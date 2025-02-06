import "./App.css";
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import { ApiClient } from "../src/helper/apiClient";
import { Organization as OrganizationComponent } from "./components/Organization";
import { AddOrgModal } from "./components/AddOrganizationModal";
import { AddContactModal } from "./components/addContactModal";
import logoDarkGreen from "./assets/logo-relationslaes-transparent-dark-green.png";
import { Contact as ContactComponent } from "./components/Contact";
import debounce from "lodash/debounce";

function App() {
  const [data, setData] = useState<OrganizationType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const client = new ApiClient();

  useLayoutEffect(() => {
    const img = new Image();
    img.src = logoDarkGreen;
    img.onload = () => setLogoLoaded(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await client.getAllData();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const searchIndex = useMemo(() => {
    return data.reduce(
      (acc, org) => {
        acc[org.orgNumber] = {
          org,
          contactsMap: (org.contacts || []).reduce(
            (cMap, contact) => {
              cMap[contact.contactID] = contact;
              return cMap;
            },
            {} as Record<string, Contact>,
          ),
        };
        return acc;
      },
      {} as Record<
        number,
        { org: OrganizationType; contactsMap: Record<string, Contact> }
      >,
    );
  }, [data]);

  const handleSearchChange = useCallback((value: string) => {
    setIsSearching(true);
    setSearchQuery(value);
    setTimeout(() => setIsSearching(false), 150);
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(handleSearchChange, 150),
    [handleSearchChange],
  );

  const { filteredOrganizations, filteredContacts } = useMemo(() => {
    const searchQueryLower = searchQuery.toLowerCase().trim();

    if (searchQueryLower.length < 2) {
      return { filteredOrganizations: data, filteredContacts: [] };
    }

    const orgMatches = new Set<number>();
    const contactMatches: Contact[] = [];

    Object.values(searchIndex).forEach(({ org, contactsMap }) => {
      if (org.orgName.toLowerCase().includes(searchQueryLower)) {
        orgMatches.add(org.orgNumber);
      }

      Object.values(contactsMap).forEach((contact) => {
        if (
          contact.name.toLowerCase().includes(searchQueryLower) ||
          contact.email?.toLowerCase().includes(searchQueryLower) ||
          contact.phone.toString().includes(searchQueryLower) ||
          contact.positionName.toLowerCase().includes(searchQueryLower)
        ) {
          contactMatches.push(contact);
        }
      });
    });

    return {
      filteredOrganizations: data.filter((org) =>
        orgMatches.has(org.orgNumber),
      ),
      filteredContacts: contactMatches,
    };
  }, [searchQuery, searchIndex, data]);

  const editContact = async (contact: Contact) => {
    try {
      const response = await client.editContact(contact);
      if (response.success) {
        const updatedData = data.map((org) => ({
          ...org,
          contacts: org.contacts
            ? org.contacts.map((c) =>
                c.contactID === contact.contactID ? contact : c,
              )
            : [],
        }));
        setData(updatedData);
      } else {
        console.error("Failed to edit contact:", response.error);
      }
    } catch (error) {
      console.error("Error editing contact:", error);
    }
  };

  const deleteContact = async (contactID: string) => {
    try {
      const response = await client.deleteContact(contactID);
      if (response.success) {
        setData((prevData) =>
          prevData.map((org) => ({
            ...org,
            contacts: org.contacts
              ? org.contacts.filter(
                  (contact) => contact.contactID !== contactID,
                )
              : [],
          })),
        );
      } else {
        console.error("Failed to delete contact:", response.error);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleAddOrg = async (orgData: {
    OrganizationName: string;
    OrgNumber: number;
  }) => {
    if (!orgData.OrganizationName || !orgData.OrgNumber) {
      console.error("Organization name and number are required");
      return;
    }
    try {
      const response = await client.addOrganization(orgData);
      if (response.success) {
        const newOrg = {
          orgName: orgData.OrganizationName,
          orgNumber: orgData.OrgNumber,
          contacts: [],
        };
        setData([...data, newOrg]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddContact = async (contactData: NewContact) => {
    try {
      if (
        !contactData.Name ||
        !contactData.Phone ||
        !contactData.OrgNumber ||
        !contactData.PositionName
      ) {
        console.error("Name, Phone, OrgNumber, and PositionName are required");
        return;
      }

      const response = await client.addContact(contactData);
      if (response.success) {
        const newContact: Contact = {
          contactID: response.data.contact.ContactID,
          name: contactData.Name,
          phone: contactData.Phone,
          orgNumber: contactData.OrgNumber,
          email: contactData.Email,
          positionName: contactData.PositionName,
          contactedAt: new Date(),
        };

        const updatedData: OrganizationType[] = data.map((org) =>
          org.orgNumber === contactData.OrgNumber
            ? {
                ...org,
                contacts: org.contacts
                  ? [...org.contacts, newContact]
                  : [newContact],
              }
            : org,
        );

        setData(updatedData);
        setIsContactModalOpen(false);
      } else {
        console.error("API call failed:", response);
      }
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#111827",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "1200px",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #22C55E",
              borderRadius: "50%",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>
            {`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111827",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "1200px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            marginBottom: "40px",
          }}
        >
          {logoLoaded && (
            <img
              src={logoDarkGreen}
              alt="Relationsales Logo"
              style={{ width: "500px" }}
            />
          )}
        </div>

        <div style={controlsContainerStyle}>
          <button
            style={addOrgButtonStyle}
            onClick={() => setIsModalOpen(true)}
          >
            Ny bedrift
          </button>

          <div style={searchContainerStyle}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Søk etter bedrift eller kontakt..."
                style={searchInputStyle}
              />
              {isSearching && (
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "20px",
                    border: "2px solid #22C55E",
                    borderRadius: "50%",
                    borderTopColor: "transparent",
                    animation: "spin 1s linear infinite",
                  }}
                />
              )}
            </div>
          </div>

          <button
            style={addContactButtonStyle}
            onClick={() => setIsContactModalOpen(true)}
          >
            Legg til ny kontakt
          </button>
        </div>

        <div style={organizationsContainerStyle}>
          {filteredOrganizations.length > 0 && (
            <>
              <h3 style={{ color: "white", marginTop: "20px" }}>
                Organisasjoner
              </h3>
              {filteredOrganizations.map((item) => (
                <OrganizationComponent
                  key={item.orgNumber}
                  orgName={item.orgName}
                  contacts={item.contacts}
                  onContactDelete={deleteContact}
                  editContact={editContact}
                />
              ))}
            </>
          )}

          {filteredOrganizations.length === 0 &&
            filteredContacts.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <h3
                  style={{
                    color: "white",
                    marginTop: "20px",
                    textAlign: "center",
                  }}
                >
                  Kontakter
                </h3>
                <div
                  style={{
                    width: "80%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      color: "#FFFFFF",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <th style={thStyle}>Navn</th>
                        <th style={thStyle}>Stilling</th>
                        <th style={thStyle}>Telefon</th>
                        <th style={thStyle}>E-post</th>
                        <th style={thStyle}>Bedrift</th>
                        <th style={thStyle}>Sist kontaktet</th>
                        <th style={thStyle}>Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact) => {
                        const organization = data.find(
                          (org) => org.orgNumber === contact.orgNumber,
                        );
                        return (
                          <ContactComponent
                            key={contact.contactID}
                            contact={contact}
                            onDelete={deleteContact}
                            changeContact={editContact}
                            orgName={organization?.orgName || ""}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>

        <AddOrgModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddOrg}
        />
        <AddContactModal
          isOpen={isContactModalOpen}
          Organizations={data}
          onClose={() => setIsContactModalOpen(false)}
          onSubmit={handleAddContact}
        />
      </div>
    </div>
  );
}

export default App;

const controlsContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
  gap: "24px",
  position: "relative",
  width: "100%",
};

const searchContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flex: "1",
  maxWidth: "600px",
  minWidth: "400px",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#E5E7EB",
  fontSize: "14px",
};

const actionButtonStyle: React.CSSProperties = {
  padding: "4px",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#9CA3AF",
  transition: "all 0.2s ease-in-out",
};

const buttonStyle: React.CSSProperties = {
  padding: "20px 24px",
  backgroundColor: "#1A1A1A",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  whiteSpace: "nowrap",
  width: "200px",
};

const addOrgButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#2563EB",
};

const addContactButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#22C55E",
};

const searchInputStyle: React.CSSProperties = {
  flex: "1",
  padding: "12px 16px",
  backgroundColor: "#374151",
  border: "1px solid #4B5563",
  borderRadius: "8px",
  color: "white",
  outline: "none",
  fontSize: "16px",
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: 500,
  fontSize: "14px",
};

const organizationsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  width: "100%",
};

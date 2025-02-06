import "./App.css";
import React, { useEffect, useState } from "react";
import { ApiClient } from "../src/helper/apiClient";
import { Organization as OrganizationComponent } from "./components/Organization";
import { AddOrgModal } from "./components/AddOrganizationModal";
import { AddContactModal } from "./components/addContactModal";
import logoDarkGreen from "./assets/logo-relationslaes-transparent-dark-green.png";

function App() {
    const [data, setData] = useState<OrganizationType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const client = new ApiClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await client.getAllData();
                if (response.success) {
                    console.log(response.data);
                    setData(response.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

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
            console.log(contactData);
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

    // Unified search: Organizations and Contacts
    const searchQueryLower = searchQuery.toLowerCase();

    const filteredOrganizations = data.filter((org) =>
        org.orgName.toLowerCase().includes(searchQueryLower),
    );

    const filteredContacts = data.flatMap((org) =>
        (org.contacts || []).filter(
            (contact) =>
                contact.name.toLowerCase().includes(searchQueryLower) ||
                contact.email?.toLowerCase().includes(searchQueryLower) ||
                contact.phone.toString().includes(searchQueryLower) ||
                contact.positionName.toLowerCase().includes(searchQueryLower),
        ),
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("no-NO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

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
                    <img
                        src={logoDarkGreen}
                        alt="Relationsales Logo"
                        style={{ width: "500px" }}
                    />
                </div>

                <div style={controlsContainerStyle}>
                    <button
                        style={addOrgButtonStyle}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Ny bedrift
                    </button>

                    <div style={searchContainerStyle}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Søk etter bedrift eller kontakt..."
                            style={searchInputStyle}
                        />
                    </div>

                    <button
                        style={addContactButtonStyle}
                        onClick={() => setIsContactModalOpen(true)}
                    >
                        Legg til ny kontakt
                    </button>
                </div>

                <div style={organizationsContainerStyle}>
                    {/* Show Organizations if there are any matches */}
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
                                />
                            ))}
                        </>
                    )}

                    {/* Show Contacts ONLY IF there are no matching organizations but contacts exist */}
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
                                                <th style={thStyle}>Sist kontaktet</th>
                                                <th style={thStyle}>Organisasjon</th>
                                                <th style={thStyle}>Handlinger</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredContacts.map((contact) => {
                                                console.log(contact.orgNumber);
                                                const organization = data.find(
                                                    (org) => org.orgNumber === contact.orgNumber,
                                                );
                                                console.log(organization);
                                                return (
                                                    <tr key={contact.contactID}>
                                                        <td style={tdStyle}>{contact.name}</td>
                                                        <td style={tdStyle}>
                                                            {contact.positionName || "-"}
                                                        </td>
                                                        <td style={tdStyle}>{contact.phone}</td>
                                                        <td style={tdStyle}>{contact.email || "-"}</td>
                                                        <td style={tdStyle}>
                                                            {contact.contactedAt
                                                                ? formatDate(contact.contactedAt)
                                                                : "-"}
                                                        </td>
                                                        <td style={tdStyle}>
                                                            {organization ? organization.orgName : "Ukjent"}
                                                        </td>{" "}
                                                        {/* Displays organization name */}
                                                        <td style={tdStyle}>
                                                            <div style={{ display: "flex", gap: "8px" }}>
                                                                <button
                                                                    style={actionButtonStyle}
                                                                    title="Slett"
                                                                    onClick={() =>
                                                                        deleteContact(contact.contactID)
                                                                    }
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
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

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Contact } from "./Contact";

interface OrganizationProps {
  orgName: string;
  orgType: string;
  contacts: Contact[] | null;
  onContactDelete: (contactID: string) => void;
  editContact: (contact: Contact) => void;
}

export const Organization: React.FC<OrganizationProps> = ({
  orgName,
  orgType,
  contacts,
  onContactDelete,
  editContact,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={containerStyle}>
      <button onClick={() => setIsOpen(!isOpen)} style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={orgNameContainerStyle}>
            <h2 style={titleStyle}>{orgName}</h2>
          </div>
          <div style={orgTypeContainerStyle}>
            <h2 style={titleStyle}>{orgType}</h2>
          </div>
          <div style={chevronContainerStyle}>
            <ChevronDown
              style={{
                transform: isOpen ? "rotate(180deg)" : "none",
                transition: "0.2s",
              }}
            />
          </div>
        </div>
      </button>
      {isOpen && (
        <div style={contentStyle}>
          {!contacts || contacts.length === 0 ? (
            <p style={emptyMessageStyle}>Ingen kontakter lagt til</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Navn</th>
                  <th style={thStyle}>Stilling</th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle}>E-post</th>
                  <th style={thStyle}>Bedrift</th>
                  <th style={thStyle}>Dato lagt til</th>
                  <th style={thStyle}>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <Contact
                    key={contact.contactID}
                    contact={contact}
                    onDelete={onContactDelete}
                    changeContact={editContact}
                    orgName={orgName}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Organization;

const containerStyle: React.CSSProperties = {
  backgroundColor: "#0A0F1A",
  borderRadius: "8px",
  width: "100%",
  marginBottom: "10px",
  transition: "all 0.2s ease-in-out",
};

const headerStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  color: "white",
};

const headerContentStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "500px 300px 40px", // Fixed widths for each column
  gap: "16px",
  alignItems: "center",
  width: "100%",
};

const orgNameContainerStyle: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textAlign: "left",
};

const orgTypeContainerStyle: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textAlign: "left",
};

const chevronContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
};

const titleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 500,
  margin: 0,
  color: "#FFFFFF",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const contentStyle: React.CSSProperties = {
  padding: "12px 16px",
  maxHeight: "500px",
  overflow: "hidden",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  backgroundColor: "#0A0F1A",
};

const emptyMessageStyle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.5)",
  fontStyle: "italic",
  padding: "8px 0",
  margin: 0,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  color: "#FFFFFF",
};

const thStyle: React.CSSProperties = {
  padding: "6px 12px",
  textAlign: "left",
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: 500,
  fontSize: "14px",
};

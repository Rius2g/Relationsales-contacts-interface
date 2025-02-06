import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Contact } from "./Contact";

interface OrganizationProps {
  orgName: string;
  contacts: Contact[] | null;
  onContactDelete: (contactID: string) => void;
}

export const Organization: React.FC<OrganizationProps> = ({
  orgName,
  contacts,
  onContactDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={containerStyle}>
      <button onClick={() => setIsOpen(!isOpen)} style={headerStyle}>
        <h2 style={titleStyle}>{orgName}</h2>
        <ChevronDown
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "0.2s",
          }}
        />
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
                  <th style={thStyle}>Sist kontaktet</th>
                  <th style={thStyle}>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <Contact
                    key={contact.contactID}
                    contact={contact}
                    onDelete={onContactDelete}
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
  padding: "10px 16px", // Reduced padding to make it slimmer
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  color: "white",
};

const titleStyle: React.CSSProperties = {
  fontSize: "18px", // Reduced font size
  fontWeight: 500,
  margin: 0,
  color: "#FFFFFF",
};

const contentStyle: React.CSSProperties = {
  padding: "12px 16px", // Reduced padding
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
  padding: "6px 12px", // Reduced padding in table
  textAlign: "left",
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: 500,
  fontSize: "14px",
};

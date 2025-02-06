import React from "react";
import { Edit, Trash2 } from "lucide-react";

interface ContactProps {
  contact: Contact;
  onDelete: (contactID: string) => void;
}

export const Contact: React.FC<ContactProps> = ({ contact, onDelete }) => {
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

  const formatPhoneNumber = (phone: number) => {
    const phoneStr = phone.toString();
    if (phoneStr.length === 8) {
      return phoneStr.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
    }
    return phoneStr;
  };

  return (
    <tr>
      <td
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#E5E7EB",
          fontSize: "14px",
        }}
      >
        {contact.name}
      </td>
      <td style={{ padding: "12px 16px" }}>{contact.positionName || "-"}</td>
      <td style={{ padding: "12px 16px" }}>
        {formatPhoneNumber(contact.phone)}
      </td>
      <td style={{ padding: "12px 16px" }}>{contact.email || "-"}</td>
      <td style={{ padding: "12px 16px" }}>
        {contact.contactedAt ? formatDate(contact.contactedAt) : "-"}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              padding: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <Edit size={16} />
          </button>
          <button
            style={{
              padding: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              transition: "all 0.2s ease-in-out",
            }}
            onClick={() => onDelete(contact.contactID)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

import React, { useState } from "react";
import { Trash2 } from "lucide-react";

interface ContactType {
  contactID: string;
  orgNumber: number;
  name: string;
  positionName: string;
  phone: number;
  email: string | null;
  contactedAt: Date;
}

interface ContactProps {
  contact: ContactType;
  orgName: string;
  onDelete: (contactID: string) => void;
  changeContact: (contact: ContactType) => void;
}

export const Contact: React.FC<ContactProps> = ({
  contact,
  orgName,
  onDelete,
  changeContact,
}) => {
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [editedContact, setEditedContact] = useState({ ...contact });

  const handleBlur = (field: string) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    changeContact(editedContact);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (field: string) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <tr>
      {["name", "positionName", "phone", "email"].map((field) => (
        <td
          key={field}
          style={{ padding: "12px 16px" }}
          onClick={() => handleEdit(field)}
        >
          {isEditing[field] ? (
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              value={editedContact[field] || ""}
              onChange={handleChange}
              onBlur={() => handleBlur(field)}
              autoFocus
            />
          ) : (
            editedContact[field] || "-"
          )}
        </td>
      ))}
      <td style={{ padding: "12px 16px" }}>{orgName}</td>
      <td style={{ padding: "12px 16px" }}>
        {editedContact.contactedAt
          ? new Date(editedContact.contactedAt).toLocaleString("no-NO")
          : "-"}
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

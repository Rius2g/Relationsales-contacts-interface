// Code for displaying a contact
import React from "react";

interface ContactProps {
  contact: Contact;
}

export const Contact: React.FC<ContactProps> = ({ contact }) => {
  return (
    <>
      <div>
        <h2>{contact.Name}</h2>
        <p>Phone: {contact.Phone}</p>
        <p>Email: {contact.Email}</p>
        <p>Position: {contact.PositionName}</p>
        <p>Contacted At: {contact.ContactedAt.toString()}</p>
      </div>
    </>
  );
};

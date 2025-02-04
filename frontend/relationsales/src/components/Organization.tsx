import React, { useState } from "react";
import { Contact } from "./Contact";
import { ChevronDown } from "lucide-react";

interface OrganizationProps {
  orgName: string;
  organizationID: number;
  contacts: Contact[] | null;
}

export const Organization: React.FC<OrganizationProps> = ({
  orgName,
  organizationID,
  contacts,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
      >
        <h2 className="text-lg font-medium text-gray-900">{orgName}</h2>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 py-3 space-y-2 border-t border-gray-200">
          {/*{contacts.map((contact) => (
            <Contact key={contact.ContactID} contact={contact} />
          ))} */}
        </div>
      </div>
    </div>
  );
};

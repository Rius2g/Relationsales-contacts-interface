import React, { useEffect, useRef, useState } from "react";

interface AddOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (org: { OrganizationName: string; OrgNumber: number }) => void;
}

export const AddOrgModal: React.FC<AddOrgModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [orgData, setOrgData] = useState({
    OrganizationName: "",
    OrgNumber: 0,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in duration-200"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Legg til ny bedrift</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedriftsnavn
            </label>
            <input
              type="text"
              value={orgData.OrganizationName}
              onChange={(e) =>
                setOrgData({ ...orgData, OrganizationName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Skriv bedriftsnavn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisasjonsnummer
            </label>
            <input
              type="number"
              value={orgData.OrgNumber || ""}
              onChange={(e) =>
                setOrgData({
                  ...orgData,
                  OrgNumber: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Skriv organisasjonsnummer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={() => {
              onSubmit(orgData);
              setOrgData({ OrganizationName: "", OrgNumber: 0 });
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Lagre
          </button>
        </div>
      </div>
    </div>
  );
};

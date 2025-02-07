import React from "react";
import { useState } from "react";
import { apiClient } from "./apiClient";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({
    OrganizationName: "",
    OrgNumber: "",
  });

  const client = new apiClient();

  const handleSubmit = async () => {
    try {
      const response = await client.addOrganization(newOrg);
      if (response.success) {
        setData([...data, response.data]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Ny bedrift</button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl mb-4">Legg til ny bedrift</h2>
            <input
              type="text"
              placeholder="Bedriftsnavn"
              className="border p-2 mb-2 w-full"
              value={newOrg.OrganizationName}
              onChange={(e) =>
                setNewOrg({ ...newOrg, OrganizationName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Organisasjonsnummer"
              className="border p-2 mb-4 w-full"
              value={newOrg.OrgNumber}
              onChange={(e) =>
                setNewOrg({ ...newOrg, OrgNumber: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200"
                onClick={() => setIsModalOpen(false)}
              >
                Avbryt
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white"
                onClick={handleSubmit}
              >
                Lagre
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// In App.tsx
import "./App.css";
import React, { useEffect, useState } from "react";
import { ApiClient } from "../src/helper/apiClient";
import { Organization } from "./components/Organization";
import { AddOrgModal } from "./components/AddOrganizationModal";

function App() {
  const [data, setData] = useState<OrganizationType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleAddOrg = async (orgData: {
    OrganizationName: string;
    OrgNumber: number;
  }) => {
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">RELATIONSALES</h1>
          {!isModalOpen && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ny bedrift
            </button>
          )}
        </div>

        <AddOrgModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddOrg}
        />

        <div className="grid gap-6">
          {data.map((item) => (
            <Organization
              key={item.orgNumber}
              orgName={item.orgName}
              organizationID={item.orgNumber}
              contacts={item.contacts}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

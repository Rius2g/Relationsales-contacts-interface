import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useMemo } from "react";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const baseUrl = "localhost:8080/api";

export const createApiClient = (getToken: () => Promise<string>) => ({
  async getAllData(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`http://${baseUrl}/all_data`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  },

  async getOrgTypes(): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`http://${baseUrl}/org_types`);
      if (!response.ok) {
        throw new Error(`Error fetching org types: ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  },

  async addOrganization(data: NewOrganization): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`http://${baseUrl}/add_organization`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Error adding organization: ${response.statusText}`);
      }
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  },

  async addContact(data: NewContact): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`http://${baseUrl}/add_contact`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Error adding contact: ${response.statusText}`);
      }
      const respdata = await response.json();
      return { success: true, data: respdata };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  },

  async editContact(contact: Contact): Promise<ApiResponse<any>> {
    console.log(contact);
    const cont: Contact = {
      contactID: contact.contactID,
      name: contact.name,
      positionName: contact.positionName,
      phone: Number(contact.phone),
      email: contact.email,
      contactedAt: contact.contactedAt,
    };
    try {
      const response = await fetch(`http://${baseUrl}/edit_contact`, {
        method: "PUT",
        body: JSON.stringify(cont),
      });
      if (!response.ok) {
        throw new Error(`Error editing contact: ${response.statusText}`);
      }
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  },

  async deleteContact(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`http://${baseUrl}/delete_contact/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Error deleting contact: ${response.statusText}`);
      }
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  },
});

// Custom hook to use the API client
export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getToken = useCallback(async () => {
    return getAccessTokenSilently({
      authorizationParams: {
        audience: "http://localhost:8080",
        scope: "openid profile email",
      },
    });
  }, [getAccessTokenSilently]);

  return useMemo(() => createApiClient(getToken), [getAccessTokenSilently]);
};

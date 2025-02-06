export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const baseUrl = "http://localhost:8080/api";

export class ApiClient {
  async getAllData(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${baseUrl}/all_data`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  }

  async addOrganization(data: NewOrganization): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${baseUrl}/add_organization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  }

  async addContact(data: NewContact): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${baseUrl}/add_contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  }

  async deleteContact(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${baseUrl}/delete_contact/${id}`, {
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
  }
}

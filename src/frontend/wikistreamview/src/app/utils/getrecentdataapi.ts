class GetRecentDataApi {
  private baseURL: string; // Define baseURL as a string property

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getData(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch data:", error);
      throw error;
    }
  }
}

export default GetRecentDataApi;

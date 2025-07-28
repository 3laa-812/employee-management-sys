import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { saveToCache, getFromCache } from "../utils/db";

export const useCompanyStore = defineStore("company", () => {
  const API = "http://localhost:3001/companies";
  const companies = ref([]);
  let eventSource = null;

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(API);
      companies.value = response.data;
      await saveToCache("companies", response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      // Try to load from cache
      const cached = await getFromCache("companies");
      if (cached && cached.length) {
        companies.value = cached;
        console.log("Loaded companies from cache");
      }
    }
  };

  const startRealTimeUpdates = () => {
    if (eventSource) {
      eventSource.close();
    }

    console.log("Starting SSE connection to:", `${API}/events`);
    eventSource = new EventSource(`${API}/events`);

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Real-time update received:", data);

      switch (data.type) {
        case "company_added":
          console.log(
            "Processing company_added event:",
            data.company || data.companie
          );
          const companyData = data.company || data.companie;
          if (companyData && companyData.id) {
            companies.value.push(companyData);
            console.log(
              "Company added to store, total companies:",
              companies.value.length
            );
          } else {
            console.log("Company data missing ID, fetching fresh data...");
            fetchCompanies();
          }
          break;
        case "company_updated":
          console.log(
            "Processing company_updated event:",
            data.company || data.companie
          );
          const updatedCompany = data.company || data.companie;
          if (updatedCompany && updatedCompany.id) {
            const updateIndex = companies.value.findIndex(
              (c) => c && c.id === updatedCompany.id
            );
            if (updateIndex !== -1) {
              companies.value[updateIndex] = updatedCompany;
              console.log("Company updated in store");
            }
          }
          break;
        case "company_deleted":
          console.log("Processing company_deleted event:", data.companyId);
          if (data.companyId) {
            companies.value = companies.value.filter(
              (c) => c && c.id !== data.companyId
            );
            console.log("Company deleted from store");
          }
          break;
        case "companies_refresh":
          console.log("Processing companies_refresh event");
          fetchCompanies();
          break;
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      // Reconnect after 5 seconds
      setTimeout(() => {
        startRealTimeUpdates();
      }, 5000);
    };
  };

  const stopRealTimeUpdates = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  const addCompany = async (company) => {
    try {
      console.log("Adding company:", company);
      const response = await axios.post(API, company);
      console.log("Add company response:", response.data);

      // Manually add to store as fallback (in case SSE doesn't work)
      if (response.data) {
        // If the response doesn't have an ID, generate a temporary one
        const companyWithId = response.data.id
          ? response.data
          : {
              ...response.data,
              id: `temp_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            };

        companies.value.push(companyWithId);
        console.log(
          "Company manually added to store, total companies:",
          companies.value.length
        );

        // If we used a temporary ID, refresh the data to get the real ID
        if (!response.data.id) {
          setTimeout(() => {
            fetchCompanies();
          }, 1000);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error adding company:", error);
      throw error; // Re-throw to handle in the component
    }
  };

  const updateCompany = async (updated) => {
    try {
      await axios.put(`${API}/${updated.id}`, updated);
      // Real-time update will be handled by SSE
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  const deleteCompany = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      // Real-time update will be handled by SSE
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const bulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => axios.delete(`${API}/${id}`)));
      // Real-time update will be handled by SSE
    } catch (error) {
      console.error("Error bulk deleting companies:", error);
    }
  };

  return {
    companies,
    fetchCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    bulkDelete,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  };
});

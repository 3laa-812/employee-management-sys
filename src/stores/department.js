import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { saveToCache, getFromCache } from "../utils/db";

const API = "http://localhost:3001/departments";

export const useDepartmentStore = defineStore("department", () => {
  const departments = ref([]);
  let eventSource = null;

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}?_sort=order`);
      departments.value = response.data;
      await saveToCache("departments", response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      // Try to load from cache
      const cached = await getFromCache("departments");
      if (cached && cached.length) {
        departments.value = cached;
        console.log("Loaded departments from cache");
      }
    }
  };

  const startRealTimeUpdates = () => {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(`${API}/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Real-time update received:", data);

      switch (data.type) {
        case "department_added":
          departments.value.push(data.department);
          break;
        case "department_updated":
          const updateIndex = departments.value.findIndex(
            (d) => d.id === data.department.id
          );
          if (updateIndex !== -1) {
            departments.value[updateIndex] = data.department;
          }
          break;
        case "department_deleted":
          departments.value = departments.value.filter(
            (d) => d.id !== data.departmentId
          );
          break;
        case "departments_refresh":
          fetchDepartments();
          break;
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
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

  const addDepartment = async (dep) => {
    const response = await axios.post(API, dep);
    // Real-time update will be handled by SSE
    return response.data;
  };

  const updateDepartment = async (dep) => {
    await axios.put(`${API}/${dep.id}`, dep);
    // Real-time update will be handled by SSE
  };

  const deleteDepartment = async (id) => {
    await axios.delete(`${API}/${id}`);
    // Real-time update will be handled by SSE
  };

  const bulkUpdateCompany = async (ids, companyId) => {
    await Promise.all(
      ids.map((id) => axios.patch(`${API}/${id}`, { companyId }))
    );
    // Real-time update will be handled by SSE
  };

  // Add this function to allow manual cache loading for offline mode
  const loadDepartmentsFromCache = async () => {
    const cached = await getFromCache("departments");
    if (cached && cached.length) {
      departments.value = cached;
      console.log("Loaded departments from cache (manual trigger)");
    }
  };

  return {
    departments,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    bulkUpdateCompany,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    loadDepartmentsFromCache, // expose for UI
  };
});

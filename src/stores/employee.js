import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { saveToCache, getFromCache } from "../utils/db";

const API = "http://localhost:3001/employees";

export const useEmployeeStore = defineStore("employee", () => {
  const employees = ref([]);
  let eventSource = null;

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API);
      employees.value = res.data;
      await saveToCache("employees", res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      // Try to load from cache
      const cached = await getFromCache("employees");
      if (cached && cached.length) {
        employees.value = cached;
        console.log("Loaded employees from cache");
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
        case "employee_added":
          employees.value.push(data.employee);
          break;
        case "employee_updated":
          const updateIndex = employees.value.findIndex(
            (e) => e.id === data.employee.id
          );
          if (updateIndex !== -1) {
            employees.value[updateIndex] = data.employee;
          }
          break;
        case "employee_deleted":
          employees.value = employees.value.filter(
            (e) => e.id !== data.employeeId
          );
          break;
        case "employees_refresh":
          fetchEmployees();
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

  const addEmployee = async (emp) => {
    const res = await axios.post(API, emp);
    // Real-time update will be handled by SSE
    return res.data;
  };

  const updateEmployee = async (emp) => {
    await axios.put(`${API}/${emp.id}`, emp);
    // Real-time update will be handled by SSE
  };

  const deleteEmployee = async (id) => {
    await axios.delete(`${API}/${id}`);
    // Real-time update will be handled by SSE
  };

  // Add this function to allow manual cache loading for offline mode
  const loadEmployeesFromCache = async () => {
    const cached = await getFromCache("employees");
    if (cached && cached.length) {
      employees.value = cached;
      console.log("Loaded employees from cache (manual trigger)");
    }
  };

  return {
    employees,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    loadEmployeesFromCache, // expose for UI
  };
});

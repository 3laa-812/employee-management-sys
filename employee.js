import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

const API = "http://localhost:3001/employees";

export const useEmployeeStore = defineStore("employee", () => {
  const employees = ref([]);

  const fetchEmployees = async () => {
    const res = await axios.get(API);
    employees.value = res.data;
  };

  const addEmployee = async (emp) => {
    const res = await axios.post(API, emp);
    employees.value.push(res.data);
  };

  const updateEmployee = async (emp) => {
    await axios.put(`${API}/${emp.id}`, emp);
    const i = employees.value.findIndex((e) => e.id === emp.id);
    if (i !== -1) employees.value[i] = emp;
  };

  const deleteEmployee = async (id) => {
    await axios.delete(`${API}/${id}`);
    employees.value = employees.value.filter((e) => e.id !== id);
  };

  return {
    employees,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
});

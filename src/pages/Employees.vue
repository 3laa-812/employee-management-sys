<template>
  <div class="employees">
    <h2>Employees</h2>

    <!-- Filters -->
    <div class="filters">
      <input v-model="search" placeholder="Search by name" />

      <select v-model="selectedDepartment">
        <option value="">All Departments</option>
        <option v-for="d in departments" :key="d.id" :value="d.id">
          {{ d.name }}
        </option>
      </select>

      <select v-model="selectedStatus">
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="On Leave">On Leave</option>
        <option value="Resigned">Resigned</option>
      </select>

      <button @click="openModal()">+ Add Employee</button>
      <div class="actions">
        <button @click="goToWizard">+ Add Employee (Wizard)</button>
      </div>

      <input
        type="file"
        @change="handleFileUpload"
        accept=".csv"
        style="margin-bottom: 1rem"
      />
    </div>

    <!-- Table -->
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Role</th>
          <th>Status</th>
          <th>Hire Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="emp in filteredEmployees" :key="emp.id">
          <td>
            <input v-model="emp.name" @blur="updateEmployee(emp)" />
          </td>
          <td>
            <input
              v-model="emp.email"
              @blur="updateEmployee(emp)"
              type="email"
            />
          </td>
          <td>
            <select v-model="emp.departmentId" @change="updateEmployee(emp)">
              <option v-for="d in departments" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
          </td>
          <td>
            <input v-model="emp.role" @blur="updateEmployee(emp)" />
          </td>
          <td>
            <select v-model="emp.status" @change="updateEmployee(emp)">
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
            </select>
          </td>
          <td>{{ formatDate(emp.hireDate) }}</td>
          <td>
            <button @click="editEmployee(emp)">Edit</button>
            <button @click="deleteEmployee(emp.id)">Delete</button>
            <button @click="goToTimeline(emp.id)">Timeline</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="modalOpen" class="modal">
      <h3>{{ editing ? "Edit" : "Add" }} Employee</h3>
      <form @submit.prevent="saveEmployee">
        <input v-model="form.name" placeholder="Name" required />
        <input v-model="form.email" placeholder="Email" type="email" required />

        <select v-model="form.departmentId" required>
          <option disabled value="">Select Department</option>
          <option v-for="d in departments" :key="d.id" :value="d.id">
            {{ d.name }}
          </option>
        </select>

        <input v-model="form.role" placeholder="Role" required />

        <select v-model="form.status" required>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="On Leave">On Leave</option>
          <option value="Resigned">Resigned</option>
        </select>

        <input type="date" v-model="form.hireDate" required />

        <button type="submit">Save</button>
        <button @click="closeModal">Cancel</button>
      </form>
    </div>
  </div>
  <button @click="exportEmployees" style="margin-bottom: 1rem">
    Export Employees
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useEmployeeStore } from "../stores/employee";
import { useDepartmentStore } from "../stores/department";
import { useRouter } from "vue-router";
const router = useRouter();

const employeeStore = useEmployeeStore();
const departmentStore = useDepartmentStore();

const search = ref("");
const selectedDepartment = ref("");
const selectedStatus = ref("");
const modalOpen = ref(false);
const editing = ref(false);
const form = ref({
  id: null,
  name: "",
  email: "",
  role: "",
  departmentId: "",
  status: "Active",
  hireDate: "",
});

onMounted(async () => {
  await employeeStore.fetchEmployees();
  await departmentStore.fetchDepartments();
  employeeStore.startRealTimeUpdates();
});

onUnmounted(() => {
  employeeStore.stopRealTimeUpdates();
});

function goToWizard() {
  router.push("/onboard");
}
function goToTimeline(id) {
  router.push(`/dashboard/employees/${id}/timeline`);
}

const employees = computed(() => employeeStore.employees);
const departments = computed(() => departmentStore.departments);

const filteredEmployees = computed(() => {
  return employees.value.filter((e) => {
    const matchesName = e.name
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const matchesEmail = e.email
      ? e.email.toLowerCase().includes(search.value.toLowerCase())
      : false;
    const matchesDept =
      !selectedDepartment.value || e.departmentId == selectedDepartment.value;
    const matchesStatus =
      !selectedStatus.value || e.status === selectedStatus.value;

    return (matchesName || matchesEmail) && matchesDept && matchesStatus;
  });
});

function openModal() {
  editing.value = false;
  form.value = {
    id: null,
    name: "",
    email: "",
    role: "",
    departmentId: "",
    status: "Active",
    hireDate: new Date().toISOString().split("T")[0],
  };
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
}

function editEmployee(emp) {
  editing.value = true;
  form.value = { ...emp };
  modalOpen.value = true;
}

async function saveEmployee() {
  if (editing.value) {
    await employeeStore.updateEmployee(form.value);
  } else {
    await employeeStore.addEmployee(form.value);
  }
  await employeeStore.fetchEmployees();
  modalOpen.value = false;
}

async function updateEmployee(emp) {
  await employeeStore.updateEmployee(emp);
}

async function deleteEmployee(id) {
  if (confirm("Are you sure you want to delete?")) {
    await employeeStore.deleteEmployee(id);
    await employeeStore.fetchEmployees();
  }
}
function exportEmployees() {
  const data = employees.value;

  let csv = "Name,Email,Role,Department\n";
  data.forEach((emp) => {
    const departmentName =
      departments.value.find((d) => d.id === emp.departmentId)?.name || "";
    csv += `${emp.name},${emp.email},${emp.role},${departmentName}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employees.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (e) => {
    const content = e.target.result;
    const rows = content.split("\n").filter((row) => row.trim().length > 0);

    // Assuming first row is headers
    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.split(",").map((h) => h.trim().toLowerCase());

    const nameIndex = headers.indexOf("name");
    const emailIndex = headers.indexOf("email");
    const roleIndex = headers.indexOf("role");
    const departmentIndex = headers.indexOf("department");

    for (const row of dataRows) {
      const columns = row.split(",");

      const departmentName = columns[departmentIndex]?.trim();
      const department = departments.value.find(
        (d) => d.name.toLowerCase() === departmentName.toLowerCase()
      );

      if (!department) continue; // Skip if department not found

      const newEmployee = {
        name: columns[nameIndex]?.trim(),
        email: columns[emailIndex]?.trim(),
        role: columns[roleIndex]?.trim(),
        departmentId: department.id,
      };

      await employeeStore.addEmployee(newEmployee);
    }

    await employeeStore.fetchEmployees();
    alert("Employees imported successfully!");
  };

  reader.readAsText(file);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.5rem;
  border: 1px solid #ccc;
}
.modal {
  margin-top: 1rem;
  background: #eee;
  padding: 1rem;
  border: 1px solid #666;
}
.actions {
  margin-bottom: 1rem;
}
.actions button {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}
</style>

<template>
  <div class="employees">
    <h2>Employees</h2>

    <button @click="loadFromCache" style="margin-bottom: 1rem; background-color: var(--bg-secondary); margin-top: 1rem;">
      Load from Offline Cache
    </button>

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

      <button @click="openModal()" style="background-color: var(--bg-secondary);">Add Employee</button>
      <div class="actions">
        <button @click="goToWizard"> (Wizard)</button>
      </div>

      <input
        type="file"
        @change="handleFileUpload"
        accept=".csv"
        style="margin-bottom: 1rem"
      />
    </div>

    <!-- Virtualized Table -->
    <div class="virtualized-table">
      <!-- Table Header -->
      <div class="table-header">
        <div class="header-cell">Name</div>
        <div class="header-cell">Email</div>
        <div class="header-cell">Department</div>
        <div class="header-cell">Role</div>
        <div class="header-cell">Status</div>
        <div class="header-cell">Hire Date</div>
        <div class="header-cell">Actions</div>
      </div>

      <!-- Virtualized List -->
      <div ref="scrollContainer" class="table-body" @scroll="handleScroll">
        <div
          class="virtual-spacer"
          :style="{ height: totalHeight + 'px' }"
        ></div>
        <div
          class="virtual-content"
          :style="{ transform: `translateY(${offsetY}px)` }"
        >
          <div
            v-for="(emp, index) in visibleEmployees"
            :key="emp.id"
            class="table-row"
          >
            <div class="table-cell">
              <input
                v-model="emp.name"
                @blur="updateEmployee(emp)"
                class="cell-input"
              />
            </div>
            <div class="table-cell">
              <input
                v-model="emp.email"
                @blur="updateEmployee(emp)"
                type="email"
                class="cell-input"
              />
            </div>
            <div class="table-cell">
              <select
                v-model="emp.departmentId"
                @change="updateEmployee(emp)"
                class="cell-select"
              >
                <option v-for="d in departments" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>
            <div class="table-cell">
              <input
                v-model="emp.role"
                @blur="updateEmployee(emp)"
                class="cell-input"
              />
            </div>
            <div class="table-cell">
              <select
                v-model="emp.status"
                @change="updateEmployee(emp)"
                class="cell-select"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
            <div class="table-cell">
              {{ formatDate(emp.hireDate) }}
            </div>
            <div class="table-cell actions-cell">
              <button @click="editEmployee(emp)" class="action-btn">
                Edit
              </button>
              <button @click="deleteEmployee(emp.id)" class="action-btn">
                Delete
              </button>
              <button @click="goToTimeline(emp.id)" class="action-btn">
                Timeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
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
const scrollContainer = ref(null);
const scrollTop = ref(0);

const form = ref({
  id: null,
  name: "",
  email: "",
  role: "",
  departmentId: "",
  status: "Active",
  hireDate: "",
});

// Virtual scrolling constants
const ROW_HEIGHT = 60;
const BUFFER_SIZE = 5;
const VISIBLE_ROWS = 10;

onMounted(async () => {
  await employeeStore.fetchEmployees();
  await departmentStore.fetchDepartments();
  employeeStore.startRealTimeUpdates();

  // Initialize scroll position
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0;
  }
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

// Virtual scrolling calculations
const totalHeight = computed(() => filteredEmployees.value.length * ROW_HEIGHT);

const startIndex = computed(() => {
  const start = Math.floor(scrollTop.value / ROW_HEIGHT) - BUFFER_SIZE;
  return Math.max(0, start);
});

const endIndex = computed(() => {
  const end =
    Math.floor(scrollTop.value / ROW_HEIGHT) + VISIBLE_ROWS + BUFFER_SIZE;
  return Math.min(filteredEmployees.value.length, end);
});

const visibleEmployees = computed(() => {
  return filteredEmployees.value.slice(startIndex.value, endIndex.value);
});

const offsetY = computed(() => startIndex.value * ROW_HEIGHT);

function handleScroll(event) {
  scrollTop.value = event.target.scrollTop;
}

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

function loadFromCache() {
  employeeStore.loadEmployeesFromCache();
}
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  height: 4rem;
}

.virtualized-table {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  background: var(--bg-secondary);
  font-weight: bold;
  border-bottom: 2px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-cell {
  padding: 0.75rem 0.5rem;
  border-right: 1px solid #dee2e6;
}

.header-cell:last-child {
  border-right: none;
}

.table-body {
  height: 400px;
  overflow-y: auto;
  position: relative;
}

.virtual-spacer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

.virtual-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  height: 60px;
  box-sizing: border-box;
}

.table-row:hover {
  background-color: var(--bg-secondary);
}

.table-cell {
  padding: 0.25rem;
  border-right: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}

.table-cell:last-child {
  border-right: none;
}

.cell-input,
.cell-select {
  width: 100%;
  padding: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 0.9rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.cell-input:focus,
.cell-select:focus {
  outline: none;
  border-color: #456882;
  box-shadow: 0 0 0 2px rgba(69, 104, 130, 0.25);
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-secondary);
  border-color: #456882;
}

.modal {
  margin-top: 1rem;
  background: var(--bg-secondary);
  padding: 1rem;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.actions {
  margin-bottom: 1rem;
}

.actions button {
  padding: 0.5rem 1rem;
  background-color: #456882;
  color: var(--text-primary);
  border: none;
  cursor: pointer;
}
</style>

<template>
  <div class="departments">
    <h2>Departments</h2>

    <button @click="loadFromCache" style="margin:   1rem 0; background-color: var(--bg-secondary);">
      Load from Offline Cache
    </button>

    <!-- Filters -->
    <div class="filters">
      <input v-model="search" placeholder="Search by name" />

      <select v-model="selectedCompany">
        <option value="">All Companies</option>
        <option v-for="c in companies" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>

      <button @click="openModal()" style="background-color: var(--bg-secondary);">Add Department</button>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedDepartments.length > 0" class="bulk-actions">
      <h4>Bulk Actions ({{ selectedDepartments.length }} selected)</h4>
      <div class="bulk-controls">
        <select v-model="bulkTargetCompany">
          <option value="">Select Company</option>
          <option v-for="c in companies" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
        <button
          @click="bulkAssign"
          :disabled="!bulkTargetCompany"
          class="bulk-btn assign"
        >
          Assign to Company
        </button>
        <button @click="bulkUnassign" class="bulk-btn unassign">
          Unassign (Set to No Company)
        </button>
        <button @click="clearSelection" class="bulk-btn clear">
          Clear Selection
        </button>
      </div>
    </div>

    <!-- Drag and Drop Table -->
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              @change="toggleSelectAll"
              :checked="isAllSelected"
              :indeterminate="isPartiallySelected"
            />
          </th>
          <th>Name</th>
          <th>Company</th>
          <th>Head</th>
          <th>Actions</th>
        </tr>
      </thead>
      <draggable
        v-model="reorderList"
        item-key="id"
        tag="tbody"
        @end="onReorder"
      >
        <template #item="{ element }">
          <tr>
            <td>
              <input
                type="checkbox"
                :value="element.id"
                v-model="selectedDepartments"
              />
            </td>
            <td>
              <input v-model="element.name" @blur="updateDepartment(element)" />
            </td>
            <td>
              <select
                v-model="element.companyId"
                @change="updateDepartment(element)"
              >
                <option v-for="c in companies" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </td>
            <td>
              <select
                v-model="element.headId"
                @change="updateDepartment(element)"
              >
                <option v-for="e in employees" :key="e.id" :value="e.id">
                  {{ e.name }}
                </option>
              </select>
            </td>
            <td>
              <button @click="editDepartment(element)">Edit</button>
              <button @click="deleteDepartment(element.id)">Delete</button>
            </td>
          </tr>
        </template>
      </draggable>
    </table>

    <!-- Modal -->
    <div v-if="modalOpen" class="modal">
      <h3>{{ editing ? "Edit" : "Add" }} Department</h3>
      <form @submit.prevent="saveDepartment">
        <input v-model="form.name" placeholder="Name" required />

        <select v-model="form.companyId" required>
          <option disabled value="">Select Company</option>
          <option v-for="c in companies" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>

        <select v-model="form.headId" required>
          <option disabled value="">Select Head</option>
          <option v-for="e in employees" :key="e.id" :value="e.id">
            {{ e.name }}
          </option>
        </select>

        <button type="submit">Save</button>
        <button @click="closeModal">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from "vue";
import draggable from "vuedraggable";

import { useDepartmentStore } from "../stores/department";
import { useCompanyStore } from "../stores/company";
import { useEmployeeStore } from "../stores/employee";

const departmentStore = useDepartmentStore();
const companyStore = useCompanyStore();
const employeeStore = useEmployeeStore();

const search = ref("");
const selectedCompany = ref("");
const modalOpen = ref(false);
const editing = ref(false);
const selectedDepartments = ref([]);
const bulkTargetCompany = ref("");

const form = ref({
  id: null,
  name: "",
  companyId: "",
  headId: "",
});

onMounted(async () => {
  await departmentStore.fetchDepartments();
  await companyStore.fetchCompanies();
  await employeeStore.fetchEmployees();
  departmentStore.startRealTimeUpdates();
});

onUnmounted(() => {
  departmentStore.stopRealTimeUpdates();
});

const filteredDepartments = computed(() =>
  departments.value.filter((d) => {
    const matchesSearch = d.name
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const matchesCompany =
      !selectedCompany.value || d.companyId == selectedCompany.value;
    return matchesSearch && matchesCompany;
  })
);

const departments = computed(() => departmentStore.departments);
const companies = computed(() => companyStore.companies);
const employees = computed(() => employeeStore.employees);

const reorderList = ref([]);
onMounted(async () => {
  await departmentStore.fetchDepartments();
  reorderList.value = [...departmentStore.departments]; // أول تحميل
  await companyStore.fetchCompanies();
  await employeeStore.fetchEmployees();
});

// Bulk selection logic
const isAllSelected = computed(() => {
  return (
    filteredDepartments.value.length > 0 &&
    selectedDepartments.value.length === filteredDepartments.value.length
  );
});

const isPartiallySelected = computed(() => {
  return (
    selectedDepartments.value.length > 0 &&
    selectedDepartments.value.length < filteredDepartments.value.length
  );
});

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedDepartments.value = filteredDepartments.value.map((d) => d.id);
  } else {
    selectedDepartments.value = [];
  }
}

function clearSelection() {
  selectedDepartments.value = [];
  bulkTargetCompany.value = "";
}

async function bulkAssign() {
  if (!bulkTargetCompany.value || selectedDepartments.value.length === 0) {
    alert("Please select a company and departments to assign.");
    return;
  }

  if (
    confirm(
      `Assign ${selectedDepartments.value.length} departments to the selected company?`
    )
  ) {
    try {
      await departmentStore.bulkUpdateCompany(
        selectedDepartments.value,
        bulkTargetCompany.value
      );
      await departmentStore.fetchDepartments();
      clearSelection();
      alert("Departments assigned successfully!");
    } catch (error) {
      console.error("Error in bulk assign:", error);
      alert("Error assigning departments. Please try again.");
    }
  }
}

async function bulkUnassign() {
  if (selectedDepartments.value.length === 0) {
    alert("Please select departments to unassign.");
    return;
  }

  if (
    confirm(
      `Unassign ${selectedDepartments.value.length} departments from their current companies?`
    )
  ) {
    try {
      await departmentStore.bulkUpdateCompany(selectedDepartments.value, null);
      await departmentStore.fetchDepartments();
      clearSelection();
      alert("Departments unassigned successfully!");
    } catch (error) {
      console.error("Error in bulk unassign:", error);
      alert("Error unassigning departments. Please try again.");
    }
  }
}

function openModal() {
  editing.value = false;
  form.value = {
    id: null,
    name: "",
    companyId: "",
    headId: "",
  };
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
}

function editDepartment(dep) {
  editing.value = true;
  form.value = { ...dep };
  modalOpen.value = true;
}

async function saveDepartment() {
  if (editing.value) {
    await departmentStore.updateDepartment(form.value);
  } else {
    await departmentStore.addDepartment(form.value);
  }
  await departmentStore.fetchDepartments();
  modalOpen.value = false;
}

async function updateDepartment(dep) {
  await departmentStore.updateDepartment(dep);
}

async function deleteDepartment(id) {
  if (confirm("Delete this department?")) {
    await departmentStore.deleteDepartment(id);
    await departmentStore.fetchDepartments();
  }
}

async function onReorder() {
  for (let i = 0; i < reorderList.value.length; i++) {
    const dep = reorderList.value[i];
    await departmentStore.updateDepartment({ ...dep, order: i + 1 });
  }
}

function loadFromCache() {
  departmentStore.loadDepartmentsFromCache();
}
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.bulk-actions {
  background: var(--bg-secondary);
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.bulk-actions h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.bulk-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.bulk-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.bulk-btn.assign {
  background: #456882;
  color: var(--text-primary);
}

.bulk-btn.assign:hover {
  background: #1b3c53;
}

.bulk-btn.unassign {
  background: #d2c1b6;
  color: var(--text-primary);
}

.bulk-btn.unassign:hover {
  background: #b8a99e;
}

.bulk-btn.clear {
  background: #6c757d;
  color: var(--text-primary);
}

.bulk-btn.clear:hover {
  background: #5a6268;
}

.bulk-btn:disabled {
  background: #6c757d;
  color: var(--text-muted);
  cursor: not-allowed;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
.modal {
  margin-top: 1rem;
  background: var(--bg-secondary);
  padding: 1rem;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}
</style>

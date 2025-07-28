<template>
  <div class="departments">
    <h2>Departments</h2>

    <!-- Filters -->
    <div class="filters">
      <input v-model="search" placeholder="Search by name" />

      <select v-model="selectedCompany">
        <option value="">All Companies</option>
        <option v-for="c in companies" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>

      <button @click="openModal()">+ Add Department</button>
    </div>

    <!-- Drag and Drop Table -->
    <table>
      <thead>
        <tr>
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
</style>

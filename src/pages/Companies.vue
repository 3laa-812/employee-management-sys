<template>
  <div class="companies">
    <h2>Companies</h2>

    <input v-model="search" placeholder="Search by name" />

    <button @click="openModal()">+ Add Company</button>
    <button @click="bulkDelete" :disabled="selectedCompanies.length === 0">
      Delete Selected
    </button>
    <button @click="exportSelected" :disabled="selectedCompanies.length === 0">
      Export Selected
    </button>
    <input type="file" @change="handleFileUpload" accept=".csv" />

    <div v-if="loading" class="loading">Loading companies...</div>

    <table v-else>
      <thead>
        <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Actions</th>
          <th>
            <input
              type="checkbox"
              @change="toggleSelectAll"
              :checked="isAllSelected"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="paginatedCompanies.length === 0">
          <tr>
            <td colspan="4" style="text-align: center">No companies found</td>
          </tr>
        </template>
        <template v-else>
          <template
            v-for="(company, index) in paginatedCompanies"
            :key="company?.id || index"
          >
            <tr v-if="company && company.id">
              <td>{{ company.name }}</td>
              <td>{{ company.code }}</td>

              <td>
                <button @click="editCompany(company)">Edit</button>
                <button @click="deleteCompany(company.id)">Delete</button>
              </td>
              <td>
                <input
                  type="checkbox"
                  :value="company.id"
                  v-model="selectedCompanies"
                />
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>

    <div class="pagination" v-if="!loading">
      <button @click="currentPage--" :disabled="currentPage === 1">
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">
        Next
      </button>
    </div>

    <!-- Add / Edit Modal -->
    <div v-if="modalOpen" class="modal">
      <h3>{{ editing ? "Edit" : "Add" }} Company</h3>
      <form @submit.prevent="saveCompany">
        <input v-model="form.name" placeholder="Company Name" required />
        <input v-model="form.code" placeholder="Company Code" required />
        <AddressInput v-model="form.address" />

        <label>Parent Company</label>
        <select v-model="form.parentId">
          <option :value="null">No Parent</option>
          <template v-for="(c, index) in companies" :key="c?.id || index">
            <option
              v-if="c && c.id && (!editing || c.id !== form.id)"
              :value="c?.id"
            >
              {{ c.name }}
            </option>
          </template>
        </select>

        <br />
        <button type="submit">Save</button>
        <button @click="closeModal">Cancel</button>
      </form>
    </div>
    <div v-if="showImportModal" class="modal">
      <h3>Preview Import</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in previewCSV" :key="index">
            <td>{{ item.Name }}</td>
            <td>{{ item.Code }}</td>
            <td>{{ item.Address }}</td>
          </tr>
        </tbody>
      </table>

      <button @click="confirmImport">Import All</button>
      <button @click="showImportModal = false">Cancel</button>
    </div>
  </div>

  <CompanyTree v-if="!loading" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useCompanyStore } from "../stores/company";
import CompanyTree from "../components/CompanyTree.vue";
// @ts-ignore
import Papa from "papaparse";
import AddressInput from "../components/AddressInput.vue";

const currentPage = ref(1);
const itemsPerPage = 5;
const selectedCompanies = ref([]);
const search = ref("");
const modalOpen = ref(false);
const editing = ref(false);
const loading = ref(true);
const form = ref({
  id: null,
  name: "",
  code: "",
  parentId: null,
});

const companyStore = useCompanyStore();

onMounted(async () => {
  try {
    await companyStore.fetchCompanies();
    companyStore.startRealTimeUpdates();
  } catch (error) {
    console.error("Error loading companies:", error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  companyStore.stopRealTimeUpdates();
});

const companies = computed(() => {
  return companyStore.companies || [];
});

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete(results) {
      console.log("Parsed CSV data:", results.data);
      const parsedData = results.data;
      previewCSV.value = parsedData;
      showImportModal.value = true;
    },
    error(err) {
      alert("Error parsing CSV: " + err.message);
    },
  });
}

const previewCSV = ref([]);
const showImportModal = ref(false);

const filteredCompanies = computed(() => {
  return (companies.value || []).filter(
    (c) =>
      c && c.name && c.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const filtered = filteredCompanies.value || [];
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  const filtered = filteredCompanies.value || [];
  return Math.max(1, Math.ceil(filtered.length / itemsPerPage));
});

const isAllSelected = computed(
  () =>
    filteredCompanies.value.length > 0 &&
    selectedCompanies.value.length === filteredCompanies.value.length
);

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedCompanies.value = filteredCompanies.value
      .filter((c) => c && c.id)
      .map((c) => c.id);
  } else {
    selectedCompanies.value = [];
  }
}

async function bulkDelete() {
  if (confirm("Are you sure you want to delete selected companies?")) {
    await companyStore.bulkDelete(selectedCompanies.value);
    await companyStore.fetchCompanies();
    selectedCompanies.value = [];
  }
}

async function deleteCompany(id) {
  await companyStore.deleteCompany(id);
  await companyStore.fetchCompanies();
}

function exportSelected() {
  const selected = companies.value.filter(
    (c) => c && c.id && selectedCompanies.value.includes(c.id)
  );

  let csv = "Name,Code,ParentID\n";
  selected.forEach((c) => {
    csv += `${c.name},${c.code},${c.parentId ?? ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "companies.csv";
  a.click();
  URL.revokeObjectURL(url);
}

async function confirmImport() {
  for (const item of previewCSV.value) {
    // optional: validation
    if (!item.name || !item.code) continue;

    await companyStore.addCompany(item); // addCompany
  }

  await companyStore.fetchCompanies();
  showImportModal.value = false;
}

function openModal() {
  editing.value = false;
  form.value = {
    // Do NOT include 'id' at all for new companies
    name: "",
    code: "",
    parentId: null,
  };
  modalOpen.value = true;
}

function editCompany(company) {
  if (!company || !company.id) {
    console.error("Invalid company object:", company);
    return;
  }

  editing.value = true;
  // Only include 'id' when editing
  form.value = { ...company };
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
}

async function saveCompany() {
  if (editing.value) {
    await companyStore.updateCompany(form.value);
  } else {
    // Create a shallow copy and remove 'id' if present
    const { id, ...companyData } = form.value;
    await companyStore.addCompany(companyData);
  }
  await companyStore.fetchCompanies();

  // Reset to page 1 when adding new companies to show the latest data
  if (!editing.value) {
    currentPage.value = 1;
  }

  closeModal();
}

watch(search, () => {
  currentPage.value = 1;
});

// Ensure current page is valid when filtered companies change
watch(filteredCompanies, (newFiltered) => {
  const maxPage = Math.max(1, Math.ceil(newFiltered.length / itemsPerPage));
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }
});
</script>

<style scoped>
table {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ccc;
  padding: 0.5rem;
}
.modal {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #333;
  background: #eee;
}
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}
</style>

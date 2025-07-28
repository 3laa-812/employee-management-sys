<template>
  <div class="companies-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Companies</h1>
          <p class="page-subtitle">Manage your company hierarchy</p>
        </div>

        <div class="header-actions">
          <button @click="loadFromCache" class="btn btn-secondary btn-sm">
            Load from Cache
          </button>
        </div>
      </div>
    </header>

    <!-- Controls -->
    <div class="controls">
      <div class="row">
        <div class="col-12 col-md-6 col-lg-4">
          <input
            v-model="search"
            placeholder="Search by name..."
            class="form-control"
          />
        </div>

        <div class="col-12 col-md-6 col-lg-8">
          <div class="action-buttons">
            <button @click="openModal()" class="btn btn-primary">
              Add Company
            </button>
            <button
              @click="bulkDelete"
              :disabled="selectedCompanies.length === 0"
              class="btn btn-danger"
            >
              Delete Selected ({{ selectedCompanies.length }})
            </button>
            <button
              @click="exportSelected"
              :disabled="selectedCompanies.length === 0"
              class="btn btn-secondary"
            >
              Export Selected
            </button>
          </div>
        </div>
      </div>

      <!-- Import -->
      <div class="import-section">
        <div class="row">
          <div class="col-12 col-md-6">
            <label for="csv-upload" class="file-upload-label">
              Choose CSV File
            </label>
            <input
              id="csv-upload"
              type="file"
              @change="handleFileUpload"
              accept=".csv"
              class="file-upload-input"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading companies...</p>
    </div>

    <!-- Table -->
    <div v-else class="table-container">
      <div class="table-responsive">
        <table class="table">
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
              <th>Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedCompanies.length === 0">
              <td colspan="4" class="empty-message">
                <p>No companies found</p>
                <button @click="openModal()" class="btn btn-primary btn-sm">
                  Add your first company
                </button>
              </td>
            </tr>
            <tr
              v-else
              v-for="(company, index) in paginatedCompanies"
              :key="company?.id || index"
            >
              <td>
                <input
                  type="checkbox"
                  :value="company.id"
                  v-model="selectedCompanies"
                />
              </td>
              <td>
                <strong>{{ company.name }}</strong>
                <small v-if="company.parentId" class="parent-info">
                  Parent: {{ getParentName(company.parentId) }}
                </small>
              </td>
              <td>{{ company.code }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="editCompany(company)"
                    class="btn btn-sm btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteCompany(company.id)"
                    class="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && totalPages > 1" class="pagination">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn btn-secondary btn-sm"
        >
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn btn-secondary btn-sm"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Tree View -->
    <div v-if="!loading" class="tree-section">
      <CompanyTree />
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editing ? "Edit" : "Add" }} Company</h3>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="saveCompany" class="modal-body">
          <div class="form-group">
            <label for="company-name">Company Name *</label>
            <input
              id="company-name"
              v-model="form.name"
              placeholder="Enter company name"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="company-code">Company Code *</label>
            <input
              id="company-code"
              v-model="form.code"
              placeholder="Enter company code"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="company-address">Address</label>
            <AddressInput v-model="form.address" />
          </div>

          <div class="form-group">
            <label for="parent-company">Parent Company</label>
            <select
              id="parent-company"
              v-model="form.parentId"
              class="form-control"
            >
              <option :value="null">No Parent</option>
              <option
                v-for="(c, index) in companies"
                :key="c?.id || index"
                v-if="c && c.id && (!editing || c.id !== form.id)"
                :value="c?.id"
              >
                {{ c.name }}
              </option>
            </select>
          </div>
        </form>

        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" @click="saveCompany" class="btn btn-primary">
            {{ editing ? "Update" : "Create" }} Company
          </button>
        </div>
      </div>
    </div>

    <!-- Import Preview Modal -->
    <div
      v-if="showImportModal"
      class="modal-overlay"
      @click="showImportModal = false"
    >
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>Preview Import</h3>
          <button @click="showImportModal = false" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div class="table-responsive">
            <table class="table">
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
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showImportModal = false" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="confirmImport" class="btn btn-primary">
            Import All ({{ previewCSV.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useCompanyStore } from "../stores/company";
import CompanyTree from "../components/CompanyTree.vue";
import Papa from "papaparse";
import AddressInput from "../components/AddressInput.vue";

const currentPage = ref(1);
const itemsPerPage = 10;
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

function getParentName(parentId) {
  if (!parentId) return null;
  const parent = companies.value.find((c) => c.id === parentId);
  return parent ? parent.name : "Unknown";
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete(results) {
      previewCSV.value = results.data;
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

const isPartiallySelected = computed(() => {
  return (
    selectedCompanies.value.length > 0 &&
    selectedCompanies.value.length < filteredCompanies.value.length
  );
});

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
  if (confirm("Are you sure you want to delete this company?")) {
    await companyStore.deleteCompany(id);
    await companyStore.fetchCompanies();
  }
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
    if (!item.name || !item.code) continue;
    await companyStore.addCompany(item);
  }

  await companyStore.fetchCompanies();
  showImportModal.value = false;
}

function openModal() {
  editing.value = false;
  form.value = {
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
    const { id, ...companyData } = form.value;
    await companyStore.addCompany(companyData);
  }
  await companyStore.fetchCompanies();

  if (!editing.value) {
    currentPage.value = 1;
  }

  closeModal();
}

watch(search, () => {
  currentPage.value = 1;
});

watch(filteredCompanies, (newFiltered) => {
  const maxPage = Math.max(1, Math.ceil(newFiltered.length / itemsPerPage));
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }
});

function loadFromCache() {
  companyStore.loadCompaniesFromCache();
}
</script>

<style scoped>
.companies-page {
  min-height: 100vh;
}

.page-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.page-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.controls {
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.import-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.file-upload-label {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.file-upload-label:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--text-secondary);
}

.file-upload-input {
  position: absolute;
  opacity: 0;
  width: 0.1px;
  height: 0.1px;
  overflow: hidden;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading p {
  margin-top: 1rem;
  font-size: 1.125rem;
}

.table-container {
  margin-bottom: 2rem;
}

.table {
  margin-bottom: 1rem;
}

.parent-info {
  color: var(--text-muted);
  font-size: 0.75rem;
  display: block;
  margin-top: 0.25rem;
}

.empty-message {
  text-align: center;
  padding: 2rem;
}

.empty-message p {
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination span {
  font-size: 0.875rem;
  color: var(--text-secondary);
  min-width: 120px;
  text-align: center;
}

.tree-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #456882;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .btn {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}

/* Focus styles */
.form-control:focus,
.btn:focus {
  outline: 2px solid #456882;
  outline-offset: 2px;
}

/* Transitions */
.page-header,
.table,
.modal-content {
  transition: all 0.3s;
}
</style>

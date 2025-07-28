<template>
  <div class="reports">
    <h2>Reports & Analytics</h2>

    <!-- Report Builder -->
    <div class="report-builder">
      <h3>Custom Report Builder</h3>

      <div class="builder-section">
        <h4>1. Select Data Source</h4>
        <select v-model="reportConfig.dataSource" @change="resetReport">
          <option value="employees">Employees</option>
          <option value="departments">Departments</option>
          <option value="companies">Companies</option>
        </select>
      </div>

      <div class="builder-section">
        <h4>2. Select Fields</h4>
        <div class="field-selector">
          <div
            v-for="field in availableFields"
            :key="field.key"
            class="field-item"
          >
            <input
              type="checkbox"
              :id="field.key"
              :value="field.key"
              v-model="reportConfig.selectedFields"
            />
            <label :for="field.key">{{ field.label }}</label>
          </div>
        </div>
      </div>

      <div class="builder-section">
        <h4>3. Apply Filters</h4>
        <div class="filters-section">
          <div
            v-for="filter in reportConfig.filters"
            :key="filter.id"
            class="filter-row"
          >
            <select v-model="filter.field">
              <option value="">Select Field</option>
              <option
                v-for="field in availableFields"
                :key="field.key"
                :value="field.key"
              >
                {{ field.label }}
              </option>
            </select>
            <select v-model="filter.operator">
              <option value="equals">Equals</option>
              <option value="contains">Contains</option>
              <option value="greater_than">Greater Than</option>
              <option value="less_than">Less Than</option>
              <option value="between">Between</option>
            </select>
            <input v-model="filter.value" placeholder="Value" />
            <button @click="removeFilter(filter.id)" class="remove-btn">
              ×
            </button>
          </div>
          <button @click="addFilter" class="add-btn">+ Add Filter</button>
        </div>
      </div>

      <div class="builder-section">
        <h4>4. Group By (Optional)</h4>
        <select v-model="reportConfig.groupBy">
          <option value="">No Grouping</option>
          <option
            v-for="field in availableFields"
            :key="field.key"
            :value="field.key"
          >
            {{ field.label }}
          </option>
        </select>
      </div>

      <div class="builder-section">
        <h4>5. Sort By</h4>
        <div class="sort-section">
          <select v-model="reportConfig.sortBy">
            <option value="">Select Field</option>
            <option
              v-for="field in availableFields"
              :key="field.key"
              :value="field.key"
            >
              {{ field.label }}
            </option>
          </select>
          <select v-model="reportConfig.sortOrder">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div class="builder-actions">
        <button @click="generateReport" class="generate-btn">
          Generate Report
        </button>
        <button @click="saveReport" class="save-btn">Save Report</button>
      </div>
    </div>

    <!-- Report Preview -->
    <div v-if="reportData.length > 0" class="report-preview">
      <h3>Report Preview</h3>
      <div class="preview-stats">
        <span>Total Records: {{ reportData.length }}</span>
        <span v-if="reportConfig.groupBy"
          >Groups: {{ groupedData.length }}</span
        >
      </div>

      <div class="export-actions">
        <button @click="exportToCSV" class="export-btn csv">
          Export to CSV
        </button>
        <button @click="exportToXLSX" class="export-btn xlsx">
          Export to XLSX
        </button>
        <button @click="exportToPDF" class="export-btn pdf">
          Export to PDF
        </button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th v-for="field in reportConfig.selectedFields" :key="field">
                {{ getFieldLabel(field) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in displayData" :key="index">
              <td v-for="field in reportConfig.selectedFields" :key="field">
                {{ formatCellValue(row[field]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Scheduled Reports -->
    <div class="scheduled-reports">
      <h3>Scheduled Reports</h3>

      <div class="schedule-form">
        <h4>Create New Schedule</h4>
        <div class="schedule-inputs">
          <input v-model="scheduleConfig.name" placeholder="Report Name" />
          <select v-model="scheduleConfig.frequency">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input
            v-model="scheduleConfig.email"
            placeholder="Email Address"
            type="email"
          />
          <select v-model="scheduleConfig.format">
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
            <option value="pdf">PDF</option>
          </select>
          <button @click="createSchedule" class="schedule-btn">
            Schedule Report
          </button>
        </div>
      </div>

      <div class="schedules-list">
        <h4>Active Schedules</h4>
        <div
          v-for="schedule in scheduledReports"
          :key="schedule.id"
          class="schedule-item"
        >
          <div class="schedule-info">
            <strong>{{ schedule.name }}</strong>
            <span
              >{{ schedule.frequency }} -
              {{ schedule.format.toUpperCase() }}</span
            >
            <span>{{ schedule.email }}</span>
          </div>
          <button @click="deleteSchedule(schedule.id)" class="delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Saved Reports -->
    <div class="saved-reports">
      <h3>Saved Reports</h3>
      <div
        v-for="report in savedReports"
        :key="report.id"
        class="saved-report-item"
      >
        <div class="report-info">
          <strong>{{ report.name }}</strong>
          <span
            >{{ report.dataSource }} -
            {{ report.selectedFields.length }} fields</span
          >
        </div>
        <div class="report-actions">
          <button @click="loadReport(report)" class="load-btn">Load</button>
          <button @click="deleteSavedReport(report.id)" class="delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useEmployeeStore } from "../stores/employee";
import { useDepartmentStore } from "../stores/department";
import { useCompanyStore } from "../stores/company";

const employeeStore = useEmployeeStore();
const departmentStore = useDepartmentStore();
const companyStore = useCompanyStore();

// Report configuration
const reportConfig = ref({
  dataSource: "employees",
  selectedFields: ["name", "email", "role"],
  filters: [],
  groupBy: "",
  sortBy: "",
  sortOrder: "asc",
});

// Schedule configuration
const scheduleConfig = ref({
  name: "",
  frequency: "weekly",
  email: "",
  format: "csv",
});

// Data storage
const reportData = ref([]);
const groupedData = ref([]);
const savedReports = ref([]);
const scheduledReports = ref([]);

// Field definitions
const fieldDefinitions = {
  employees: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "hireDate", label: "Hire Date" },
    { key: "departmentId", label: "Department" },
  ],
  departments: [
    { key: "name", label: "Name" },
    { key: "companyId", label: "Company" },
    { key: "headId", label: "Head" },
    { key: "order", label: "Order" },
  ],
  companies: [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "parentId", label: "Parent Company" },
    { key: "address", label: "Address" },
  ],
};

const availableFields = computed(() => {
  return fieldDefinitions[reportConfig.value.dataSource] || [];
});

const displayData = computed(() => {
  if (reportConfig.value.groupBy && groupedData.value.length > 0) {
    return groupedData.value;
  }
  return reportData.value;
});

onMounted(async () => {
  await loadData();
  loadSavedReports();
  loadScheduledReports();
});

async function loadData() {
  await employeeStore.fetchEmployees();
  await departmentStore.fetchDepartments();
  await companyStore.fetchCompanies();
}

function resetReport() {
  reportConfig.value.selectedFields = [];
  reportConfig.value.filters = [];
  reportConfig.value.groupBy = "";
  reportConfig.value.sortBy = "";
  reportConfig.value.sortOrder = "asc";
  reportData.value = [];
  groupedData.value = [];
}

function addFilter() {
  reportConfig.value.filters.push({
    id: Date.now(),
    field: "",
    operator: "equals",
    value: "",
  });
}

function removeFilter(filterId) {
  reportConfig.value.filters = reportConfig.value.filters.filter(
    (f) => f.id !== filterId
  );
}

function getFieldLabel(fieldKey) {
  const field = availableFields.value.find((f) => f.key === fieldKey);
  return field ? field.label : fieldKey;
}

function formatCellValue(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

function generateReport() {
  let data = getSourceData();

  // Apply filters
  data = applyFilters(data);

  // Apply sorting
  if (reportConfig.value.sortBy) {
    data = sortData(data);
  }

  // Apply grouping
  if (reportConfig.value.groupBy) {
    groupedData.value = groupData(data);
  } else {
    groupedData.value = [];
  }

  reportData.value = data;
}

function getSourceData() {
  switch (reportConfig.value.dataSource) {
    case "employees":
      return employeeStore.employees.map((emp) => ({
        ...emp,
        departmentName: getDepartmentName(emp.departmentId),
      }));
    case "departments":
      return departmentStore.departments.map((dept) => ({
        ...dept,
        companyName: getCompanyName(dept.companyId),
        headName: getEmployeeName(dept.headId),
      }));
    case "companies":
      return companyStore.companies.map((company) => ({
        ...company,
        parentName: getCompanyName(company.parentId),
      }));
    default:
      return [];
  }
}

function getDepartmentName(id) {
  const dept = departmentStore.departments.find((d) => d.id === id);
  return dept ? dept.name : "";
}

function getCompanyName(id) {
  const company = companyStore.companies.find((c) => c.id === id);
  return company ? company.name : "";
}

function getEmployeeName(id) {
  const emp = employeeStore.employees.find((e) => e.id === id);
  return emp ? emp.name : "";
}

function applyFilters(data) {
  return data.filter((item) => {
    return reportConfig.value.filters.every((filter) => {
      if (!filter.field || !filter.value) return true;

      const itemValue = item[filter.field];
      const filterValue = filter.value;

      switch (filter.operator) {
        case "equals":
          return (
            String(itemValue).toLowerCase() ===
            String(filterValue).toLowerCase()
          );
        case "contains":
          return String(itemValue)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
        case "greater_than":
          return Number(itemValue) > Number(filterValue);
        case "less_than":
          return Number(itemValue) < Number(filterValue);
        default:
          return true;
      }
    });
  });
}

function sortData(data) {
  return [...data].sort((a, b) => {
    const aVal = a[reportConfig.value.sortBy];
    const bVal = b[reportConfig.value.sortBy];

    if (reportConfig.value.sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
}

function groupData(data) {
  const groups = {};

  data.forEach((item) => {
    const groupKey = item[reportConfig.value.groupBy] || "Unknown";
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  });

  return Object.entries(groups).map(([key, items]) => ({
    [reportConfig.value.groupBy]: key,
    count: items.length,
    items: items,
  }));
}

function exportToCSV() {
  const headers = reportConfig.value.selectedFields.map((field) =>
    getFieldLabel(field)
  );
  const csvContent = [
    headers.join(","),
    ...displayData.value.map((row) =>
      reportConfig.value.selectedFields
        .map((field) => `"${formatCellValue(row[field])}"`)
        .join(",")
    ),
  ].join("\n");

  downloadFile(csvContent, "report.csv", "text/csv");
}

function exportToXLSX() {
  // Simple XLSX-like export using CSV format with .xlsx extension
  const headers = reportConfig.value.selectedFields.map((field) =>
    getFieldLabel(field)
  );
  const csvContent = [
    headers.join("\t"),
    ...displayData.value.map((row) =>
      reportConfig.value.selectedFields
        .map((field) => formatCellValue(row[field]))
        .join("\t")
    ),
  ].join("\n");

  downloadFile(
    csvContent,
    "report.xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

function exportToPDF() {
  // Simple PDF-like export using HTML that can be printed
  const headers = reportConfig.value.selectedFields.map((field) =>
    getFieldLabel(field)
  );
  const rows = displayData.value.map((row) =>
    reportConfig.value.selectedFields.map((field) =>
      formatCellValue(row[field])
    )
  );

  const htmlContent = `
    <html>
      <head>
        <title>Report</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Report</h2>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "report.html";
  a.click();
  URL.revokeObjectURL(url);

  alert(
    "HTML report generated. Open the file and use browser print function to save as PDF."
  );
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveReport() {
  const reportName = prompt("Enter report name:");
  if (!reportName) return;

  const savedReport = {
    id: Date.now(),
    name: reportName,
    config: { ...reportConfig.value },
  };

  savedReports.value.push(savedReport);
  localStorage.setItem("savedReports", JSON.stringify(savedReports.value));
  alert("Report saved successfully!");
}

function loadReport(report) {
  reportConfig.value = { ...report.config };
  generateReport();
}

function deleteSavedReport(reportId) {
  if (confirm("Are you sure you want to delete this saved report?")) {
    savedReports.value = savedReports.value.filter((r) => r.id !== reportId);
    localStorage.setItem("savedReports", JSON.stringify(savedReports.value));
  }
}

function loadSavedReports() {
  const saved = localStorage.getItem("savedReports");
  if (saved) {
    savedReports.value = JSON.parse(saved);
  }
}

function createSchedule() {
  if (!scheduleConfig.value.name || !scheduleConfig.value.email) {
    alert("Please fill in all required fields");
    return;
  }

  const schedule = {
    id: Date.now(),
    ...scheduleConfig.value,
    config: { ...reportConfig.value },
  };

  scheduledReports.value.push(schedule);
  localStorage.setItem(
    "scheduledReports",
    JSON.stringify(scheduledReports.value)
  );

  // Reset form
  scheduleConfig.value = {
    name: "",
    frequency: "weekly",
    email: "",
    format: "csv",
  };

  alert("Report scheduled successfully!");
}

function deleteSchedule(scheduleId) {
  if (confirm("Are you sure you want to delete this scheduled report?")) {
    scheduledReports.value = scheduledReports.value.filter(
      (s) => s.id !== scheduleId
    );
    localStorage.setItem(
      "scheduledReports",
      JSON.stringify(scheduledReports.value)
    );
  }
}

function loadScheduledReports() {
  const saved = localStorage.getItem("scheduledReports");
  if (saved) {
    scheduledReports.value = JSON.parse(saved);
  }
}
</script>

<style scoped>
.reports {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.report-builder {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.builder-section {
  margin-bottom: 1.5rem;
}

.builder-section h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
}

.field-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-row select,
.filter-row input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.remove-btn {
  background: #dc3545;
  color: var(--text-primary);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.add-btn {
  background: #456882;
  color: var(--text-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
}

.sort-section {
  display: flex;
  gap: 0.5rem;
}

.builder-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.generate-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.generate-btn {
  background: #456882;
  color: var(--text-primary);
}

.save-btn {
  background: #6c757d;
  color: var(--text-primary);
}

.report-preview {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.preview-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.export-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.export-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.export-btn.csv {
  background: #456882;
  color: var(--text-primary);
}

.export-btn.xlsx {
  background: #17a2b8;
  color: var(--text-primary);
}

.export-btn.pdf {
  background: #dc3545;
  color: var(--text-primary);
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  text-align: left;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

th {
  background: var(--bg-secondary);
  font-weight: 600;
}

.scheduled-reports,
.saved-reports {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.schedule-form {
  margin-bottom: 2rem;
}

.schedule-inputs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.schedule-inputs input,
.schedule-inputs select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.schedule-btn {
  background: #456882;
  color: var(--text-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.schedule-item,
.saved-report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: var(--bg-primary);
}

.schedule-info,
.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.schedule-info span,
.report-info span {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.load-btn {
  background: #456882;
  color: var(--text-primary);
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.delete-btn {
  background: #dc3545;
  color: var(--text-primary);
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>

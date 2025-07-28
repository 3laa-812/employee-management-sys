<template>
  <div class="admin">
    <h2>Admin & Audit</h2>

    <!-- User & Role Management -->
    <div class="admin-section">
      <h3>User & Role Management</h3>

      <!-- Create New User -->
      <div class="user-form">
        <h4>Create New User</h4>
        <div class="form-grid">
          <input v-model="newUser.name" placeholder="Full Name" />
          <input v-model="newUser.email" placeholder="Email" type="email" />
          <input
            v-model="newUser.password"
            placeholder="Password"
            type="password"
          />
          <select v-model="newUser.role">
            <option value="">Select Role</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
          <button @click="createUser" class="create-btn">Create User</button>
        </div>
      </div>

      <!-- Users List -->
      <div class="users-list">
        <h4>Users</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ getRoleName(user.roleId) }}</td>
              <td>
                <span :class="['status', user.status]">{{ user.status }}</span>
              </td>
              <td>{{ formatDate(user.lastLogin) }}</td>
              <td>
                <button @click="editUser(user)" class="edit-btn">Edit</button>
                <button @click="toggleUserStatus(user)" class="toggle-btn">
                  {{ user.status === "active" ? "Deactivate" : "Activate" }}
                </button>
                <button @click="deleteUser(user.id)" class="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Role Management -->
      <div class="role-management">
        <h4>Role Management</h4>

        <!-- Create New Role -->
        <div class="role-form">
          <div class="form-row">
            <input v-model="newRole.name" placeholder="Role Name" />
            <input v-model="newRole.description" placeholder="Description" />
            <button @click="createRole" class="create-btn">Create Role</button>
          </div>
        </div>

        <!-- Roles List -->
        <div class="roles-list">
          <div v-for="role in roles" :key="role.id" class="role-item">
            <div class="role-header">
              <h5>{{ role.name }}</h5>
              <p>{{ role.description }}</p>
            </div>

            <div class="permissions-grid">
              <div
                v-for="permission in permissions"
                :key="permission.key"
                class="permission-item"
              >
                <input
                  type="checkbox"
                  :id="`${role.id}-${permission.key}`"
                  :checked="role.permissions.includes(permission.key)"
                  @change="togglePermission(role.id, permission.key)"
                />
                <label :for="`${role.id}-${permission.key}`">{{
                  permission.label
                }}</label>
              </div>
            </div>

            <div class="role-actions">
              <button @click="editRole(role)" class="edit-btn">Edit</button>
              <button @click="deleteRole(role.id)" class="delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Logs -->
    <div class="admin-section">
      <h3>Audit Logs</h3>

      <!-- Audit Filters -->
      <div class="audit-filters">
        <select v-model="auditFilters.user">
          <option value="">All Users</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>

        <select v-model="auditFilters.action">
          <option value="">All Actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="export">Export</option>
        </select>

        <input
          v-model="auditFilters.dateFrom"
          type="date"
          placeholder="From Date"
        />
        <input
          v-model="auditFilters.dateTo"
          type="date"
          placeholder="To Date"
        />

        <button @click="exportAuditLogs" class="export-btn">Export Logs</button>
      </div>

      <!-- Audit Logs Table -->
      <div class="audit-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredAuditLogs" :key="log.id">
              <td>{{ formatDateTime(log.timestamp) }}</td>
              <td>{{ getUserName(log.userId) }}</td>
              <td>
                <span :class="['action-badge', log.action]">{{
                  log.action
                }}</span>
              </td>
              <td>{{ log.resource }}</td>
              <td>{{ log.details }}</td>
              <td>{{ log.ipAddress }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="currentPage--" :disabled="currentPage === 1">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages">
          Next
        </button>
      </div>
    </div>

    <!-- System Settings -->
    <div class="admin-section">
      <h3>System Settings</h3>

      <div class="settings-grid">
        <div class="setting-item">
          <label>Default Company</label>
          <select v-model="systemSettings.defaultCompany">
            <option value="">No Default</option>
            <option
              v-for="company in companies"
              :key="company.id"
              :value="company.id"
            >
              {{ company.name }}
            </option>
          </select>
        </div>

        <div class="setting-item">
          <label>Date Format</label>
          <select v-model="systemSettings.dateFormat">
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div class="setting-item">
          <label>Time Format</label>
          <select v-model="systemSettings.timeFormat">
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </select>
        </div>

        <div class="setting-item">
          <label>Session Timeout (minutes)</label>
          <input
            v-model="systemSettings.sessionTimeout"
            type="number"
            min="5"
            max="480"
          />
        </div>

        <div class="setting-item">
          <label>Max Login Attempts</label>
          <input
            v-model="systemSettings.maxLoginAttempts"
            type="number"
            min="3"
            max="10"
          />
        </div>

        <div class="setting-item">
          <label>Enable Email Notifications</label>
          <input v-model="systemSettings.emailNotifications" type="checkbox" />
        </div>

        <div class="setting-item">
          <label>Enable Audit Logging</label>
          <input v-model="systemSettings.auditLogging" type="checkbox" />
        </div>

        <div class="setting-item">
          <label>Data Retention (days)</label>
          <input
            v-model="systemSettings.dataRetention"
            type="number"
            min="30"
            max="3650"
          />
        </div>
      </div>

      <div class="settings-actions">
        <button @click="saveSettings" class="save-btn">Save Settings</button>
        <button @click="resetSettings" class="reset-btn">
          Reset to Defaults
        </button>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showUserModal" class="modal">
      <div class="modal-content">
        <h3>Edit User</h3>
        <div class="form-grid">
          <input v-model="editingUser.name" placeholder="Full Name" />
          <input v-model="editingUser.email" placeholder="Email" type="email" />
          <select v-model="editingUser.roleId">
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
          <input
            v-model="editingUser.password"
            placeholder="New Password (leave blank to keep)"
            type="password"
          />
        </div>
        <div class="modal-actions">
          <button @click="updateUser" class="save-btn">Save</button>
          <button @click="showUserModal = false" class="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <div v-if="showRoleModal" class="modal">
      <div class="modal-content">
        <h3>Edit Role</h3>
        <div class="form-grid">
          <input v-model="editingRole.name" placeholder="Role Name" />
          <input v-model="editingRole.description" placeholder="Description" />
        </div>
        <div class="modal-actions">
          <button @click="updateRole" class="save-btn">Save</button>
          <button @click="showRoleModal = false" class="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCompanyStore } from "../stores/company";

const companyStore = useCompanyStore();

// Users management
const users = ref([
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    roleId: 1,
    status: "active",
    lastLogin: new Date().toISOString(),
  },
]);

const newUser = ref({
  name: "",
  email: "",
  password: "",
  role: "",
});

const editingUser = ref({});
const showUserModal = ref(false);

// Roles management
const roles = ref([
  {
    id: 1,
    name: "Admin",
    description: "Full system access",
    permissions: [
      "users_manage",
      "roles_manage",
      "companies_manage",
      "departments_manage",
      "employees_manage",
      "reports_view",
      "audit_view",
      "settings_manage",
    ],
  },
  {
    id: 2,
    name: "Manager",
    description: "Department and employee management",
    permissions: [
      "companies_view",
      "departments_manage",
      "employees_manage",
      "reports_view",
    ],
  },
  {
    id: 3,
    name: "Employee",
    description: "Basic employee access",
    permissions: ["employees_view", "profile_edit"],
  },
]);

const newRole = ref({
  name: "",
  description: "",
});

const editingRole = ref({});
const showRoleModal = ref(false);

// Permissions
const permissions = ref([
  { key: "users_manage", label: "Manage Users" },
  { key: "roles_manage", label: "Manage Roles" },
  { key: "companies_manage", label: "Manage Companies" },
  { key: "companies_view", label: "View Companies" },
  { key: "departments_manage", label: "Manage Departments" },
  { key: "departments_view", label: "View Departments" },
  { key: "employees_manage", label: "Manage Employees" },
  { key: "employees_view", label: "View Employees" },
  { key: "reports_view", label: "View Reports" },
  { key: "audit_view", label: "View Audit Logs" },
  { key: "settings_manage", label: "Manage Settings" },
  { key: "profile_edit", label: "Edit Profile" },
]);

// Audit logs
const auditLogs = ref([
  {
    id: 1,
    timestamp: new Date().toISOString(),
    userId: 1,
    action: "login",
    resource: "system",
    details: "User logged in successfully",
    ipAddress: "192.168.1.1",
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 1,
    action: "create",
    resource: "employee",
    details: "Created employee: John Doe",
    ipAddress: "192.168.1.1",
  },
]);

const auditFilters = ref({
  user: "",
  action: "",
  dateFrom: "",
  dateTo: "",
});

const currentPage = ref(1);
const itemsPerPage = 20;

// System settings
const systemSettings = ref({
  defaultCompany: "",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  emailNotifications: true,
  auditLogging: true,
  dataRetention: 365,
});

// Computed properties
const companies = computed(() => companyStore.companies);

const filteredAuditLogs = computed(() => {
  let filtered = auditLogs.value;

  if (auditFilters.value.user) {
    filtered = filtered.filter(
      (log) => log.userId === parseInt(auditFilters.value.user)
    );
  }

  if (auditFilters.value.action) {
    filtered = filtered.filter(
      (log) => log.action === auditFilters.value.action
    );
  }

  if (auditFilters.value.dateFrom) {
    filtered = filtered.filter(
      (log) => new Date(log.timestamp) >= new Date(auditFilters.value.dateFrom)
    );
  }

  if (auditFilters.value.dateTo) {
    filtered = filtered.filter(
      (log) => new Date(log.timestamp) <= new Date(auditFilters.value.dateTo)
    );
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredAuditLogs.value.length / itemsPerPage);
});

// Methods
function createUser() {
  if (
    !newUser.value.name ||
    !newUser.value.email ||
    !newUser.value.password ||
    !newUser.value.role
  ) {
    alert("Please fill in all fields");
    return;
  }

  const user = {
    id: Date.now(),
    name: newUser.value.name,
    email: newUser.value.email,
    roleId: parseInt(newUser.value.role),
    status: "active",
    lastLogin: null,
  };

  users.value.push(user);

  // Reset form
  newUser.value = {
    name: "",
    email: "",
    password: "",
    role: "",
  };

  addAuditLog("create", "user", `Created user: ${user.name}`);
  alert("User created successfully!");
}

function editUser(user) {
  editingUser.value = { ...user };
  showUserModal.value = true;
}

function updateUser() {
  const index = users.value.findIndex((u) => u.id === editingUser.value.id);
  if (index !== -1) {
    users.value[index] = { ...editingUser.value };
    addAuditLog("update", "user", `Updated user: ${editingUser.value.name}`);
    showUserModal.value = false;
    alert("User updated successfully!");
  }
}

function toggleUserStatus(user) {
  user.status = user.status === "active" ? "inactive" : "active";
  addAuditLog(
    "update",
    "user",
    `${user.status === "active" ? "Activated" : "Deactivated"} user: ${
      user.name
    }`
  );
}

function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    const user = users.value.find((u) => u.id === userId);
    users.value = users.value.filter((u) => u.id !== userId);
    addAuditLog("delete", "user", `Deleted user: ${user.name}`);
  }
}

function createRole() {
  if (!newRole.value.name || !newRole.value.description) {
    alert("Please fill in all fields");
    return;
  }

  const role = {
    id: Date.now(),
    name: newRole.value.name,
    description: newRole.value.description,
    permissions: [],
  };

  roles.value.push(role);

  // Reset form
  newRole.value = {
    name: "",
    description: "",
  };

  addAuditLog("create", "role", `Created role: ${role.name}`);
  alert("Role created successfully!");
}

function editRole(role) {
  editingRole.value = { ...role };
  showRoleModal.value = true;
}

function updateRole() {
  const index = roles.value.findIndex((r) => r.id === editingRole.value.id);
  if (index !== -1) {
    roles.value[index] = { ...editingRole.value };
    addAuditLog("update", "role", `Updated role: ${editingRole.value.name}`);
    showRoleModal.value = false;
    alert("Role updated successfully!");
  }
}

function togglePermission(roleId, permissionKey) {
  const role = roles.value.find((r) => r.id === roleId);
  if (role) {
    const index = role.permissions.indexOf(permissionKey);
    if (index > -1) {
      role.permissions.splice(index, 1);
    } else {
      role.permissions.push(permissionKey);
    }
    addAuditLog("update", "role", `Updated permissions for role: ${role.name}`);
  }
}

function deleteRole(roleId) {
  if (confirm("Are you sure you want to delete this role?")) {
    const role = roles.value.find((r) => r.id === roleId);
    roles.value = roles.value.filter((r) => r.id !== roleId);
    addAuditLog("delete", "role", `Deleted role: ${role.name}`);
  }
}

function getRoleName(roleId) {
  const role = roles.value.find((r) => r.id === roleId);
  return role ? role.name : "Unknown";
}

function getUserName(userId) {
  const user = users.value.find((u) => u.id === userId);
  return user ? user.name : "Unknown";
}

function addAuditLog(action, resource, details) {
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    userId: 1, // Current user ID
    action,
    resource,
    details,
    ipAddress: "192.168.1.1", // Mock IP
  };

  auditLogs.value.unshift(log);
}

function exportAuditLogs() {
  const headers = [
    "Timestamp",
    "User",
    "Action",
    "Resource",
    "Details",
    "IP Address",
  ];
  const csvContent = [
    headers.join(","),
    ...filteredAuditLogs.value.map((log) =>
      [
        formatDateTime(log.timestamp),
        getUserName(log.userId),
        log.action,
        log.resource,
        `"${log.details}"`,
        log.ipAddress,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit_logs.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function saveSettings() {
  localStorage.setItem("systemSettings", JSON.stringify(systemSettings.value));
  addAuditLog("update", "settings", "Updated system settings");
  alert("Settings saved successfully!");
}

function resetSettings() {
  if (confirm("Are you sure you want to reset all settings to defaults?")) {
    systemSettings.value = {
      defaultCompany: "",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      emailNotifications: true,
      auditLogging: true,
      dataRetention: 365,
    };
    addAuditLog("update", "settings", "Reset system settings to defaults");
    alert("Settings reset to defaults!");
  }
}

function formatDate(dateString) {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleString();
}

onMounted(async () => {
  await companyStore.fetchCompanies();

  // Load saved settings
  const savedSettings = localStorage.getItem("systemSettings");
  if (savedSettings) {
    systemSettings.value = {
      ...systemSettings.value,
      ...JSON.parse(savedSettings),
    };
  }
});
</script>

<style scoped>
.admin {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-section {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin: 1.5rem 0;
}

.admin-section h3 {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.form-row input,
.form-row select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.create-btn {
  background: #456882;
  color: var(--text-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  text-align: left;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

th {
  background: var(--bg-secondary);
  font-weight: 600;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status.active {
  background: rgba(69, 104, 130, 0.2);
  color: var(--text-primary);
}

.status.inactive {
  background: rgba(220, 53, 69, 0.2);
  color: var(--text-primary);
}

.edit-btn,
.toggle-btn,
.delete-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.25rem;
  font-size: 0.8rem;
}

.edit-btn {
  background: #456882;
  color: var(--text-primary);
}

.toggle-btn {
  background: #d2c1b6;
  color: var(--text-primary);
}

.delete-btn {
  background: #dc3545;
  color: var(--text-primary);
}

.role-management {
  margin-top: 2rem;
}

.role-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: var(--bg-primary);
}

.role-header h5 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.role-header p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-actions {
  display: flex;
  gap: 0.5rem;
}

.audit-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.audit-filters select,
.audit-filters input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.export-btn {
  background: #17a2b8;
  color: var(--text-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.action-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.action-badge.login {
  background: rgba(69, 104, 130, 0.2);
  color: var(--text-primary);
}

.action-badge.logout {
  background: rgba(220, 53, 69, 0.2);
  color: var(--text-primary);
}

.action-badge.create {
  background: rgba(23, 162, 184, 0.2);
  color: var(--text-primary);
}

.action-badge.update {
  background: rgba(255, 193, 7, 0.2);
  color: var(--text-primary);
}

.action-badge.delete {
  background: rgba(220, 53, 69, 0.2);
  color: var(--text-primary);
}

.action-badge.export {
  background: rgba(108, 117, 125, 0.2);
  color: var(--text-primary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  background: var(--bg-secondary);
  cursor: not-allowed;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item label {
  font-weight: 500;
  color: var(--text-primary);
}

.setting-item input,
.setting-item select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.settings-actions {
  display: flex;
  gap: 1rem;
}

.save-btn {
  background: #456882;
  color: var(--text-primary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn {
  background: #6c757d;
  color: var(--text-primary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  color: var(--text-primary);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  background: #6c757d;
  color: var(--text-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
</style>

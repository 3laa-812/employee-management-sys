<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="welcome">
          <h1 class="welcome-title">Welcome, {{ authStore.user?.name }}</h1>
          <p class="user-role">
            {{ getUserRoleDisplay(authStore.user?.role) }}
          </p>
        </div>

        <div class="header-right">
          <NotificationBell />
          <div
            class="connection-status"
            :class="{ connected: socketConnected }"
          >
            {{ socketConnected ? "🟢 Connected" : "🔴 Disconnected" }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="dashboard-content">
      <div class="row">
        <!-- Activity Feed -->
        <div class="col-12 col-lg-8">
          <div class="card">
            <div class="card-header">
              <h3>Activity Feed</h3>
            </div>
            <div class="card-body">
              <div
                v-if="authStore.activityLogs.length === 0"
                class="empty-state"
              >
                <p>No recent activity</p>
              </div>
              <ul v-else class="activity-list">
                <li
                  v-for="(log, index) in authStore.activityLogs.slice(0, 5)"
                  :key="index"
                  class="activity-item"
                >
                  <span v-if="log.type === 'login'">🔑 Logged in</span>
                  <span v-if="log.type === 'profile_update'"
                    >✏️ Updated {{ log.field }}</span
                  >
                  <small>{{ formatTime(log.timestamp) }}</small>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-12 col-lg-4">
          <div class="card">
            <div class="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="card-body">
              <div class="actions">
                <button @click="goProfile" class="btn btn-primary">
                  My Profile
                </button>

                <div
                  v-if="
                    authStore.user?.role === 'admin' ||
                    authStore.user?.role === 'manager'
                  "
                  class="section"
                >
                  <button @click="goCompanies" class="btn btn-secondary">
                    Companies
                  </button>
                  <button @click="goDepartments" class="btn btn-secondary">
                    Departments
                  </button>
                  <button @click="goReports" class="btn btn-secondary">
                    Reports
                  </button>
                </div>

                <div v-if="authStore.user?.role === 'admin'" class="section">
                  <button @click="goAdmin" class="btn btn-danger">
                    Admin Panel
                  </button>
                </div>

                <div
                  v-if="
                    authStore.user?.role === 'admin' ||
                    authStore.user?.role === 'manager' ||
                    authStore.user?.role === 'employee'
                  "
                  class="section"
                >
                  <button @click="goEmployees" class="btn btn-success">
                    Employees
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Notifications -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3>Test Notifications</h3>
            </div>
            <div class="card-body">
              <div class="test-buttons">
                <button
                  @click="testNotification('success')"
                  class="btn btn-success"
                >
                  Test Success
                </button>
                <button
                  @click="testNotification('warning')"
                  class="btn btn-secondary"
                >
                  Test Warning
                </button>
                <button
                  @click="testNotification('error')"
                  class="btn btn-danger"
                >
                  Test Error
                </button>
                <button
                  @click="testNotification('info')"
                  class="btn btn-primary"
                >
                  Test Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logout -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="logout-section">
            <button @click="logout" class="btn btn-danger btn-lg">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Router View -->
    <div class="dashboard-routes">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useThemeStore } from "../stores/theme";
import { useNotificationStore } from "../stores/notificationStore";
import NotificationBell from "../components/NotificationBell.vue";
import socket from "../socket";

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const notificationStore = useNotificationStore();

const user = computed(() => authStore.user);
const socketConnected = computed(() => socket.connected);

onMounted(() => {
  // Join socket rooms for real-time updates
  socket.emit("join_company_room");
  socket.emit("join_department_room");
  socket.emit("join_employee_room");
});

function getUserRoleDisplay(role) {
  const roleMap = {
    admin: "Administrator",
    manager: "Manager",
    employee: "Employee",
  };
  return roleMap[role] || "User";
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString();
  }
  return d.toLocaleDateString();
}

function testNotification(type) {
  const messages = {
    success: "This is a success notification!",
    warning: "This is a warning notification!",
    error: "This is an error notification!",
    info: "This is an info notification!",
  };

  notificationStore.addNotification(messages[type], type);
}

function goProfile() {
  router.push("/dashboard/profile");
}

function goCompanies() {
  router.push("/dashboard/companies");
}

function goDepartments() {
  router.push("/dashboard/departments");
}

function goEmployees() {
  router.push("/dashboard/employees");
}

function goReports() {
  router.push("/dashboard/reports");
}

function goAdmin() {
  router.push("/dashboard/admin");
}

function logout() {
  authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.dashboard-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: background-color 0.3s, border-color 0.3s;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  transition: color 0.3s;
}

.user-role {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: color 0.3s;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s;
}

.connection-status.connected {
  background-color: rgba(69, 104, 130, 0.1);
  color: var(--text-primary);
  border-color: #456882;
}

.dashboard-content {
  margin-bottom: 2rem;
}

.card {
  height: 100%;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(27, 60, 83, 0.1);
  transition: all 0.3s;
  margin-top: 1rem;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(27, 60, 83, 0.1);
}

.card-header {
  background-color: var(--bg-secondary);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  border-radius: 8px 8px 0 0;
  transition: background-color 0.3s, border-color 0.3s;
}

.card-header h3 {
  margin-top: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s;
}

.card-body {
  padding: 1.5rem;
  background-color: var(--bg-primary);
  transition: background-color 0.3s;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: border-color 0.3s;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item small {
  color: var(--text-muted);
  font-size: 0.75rem;
  transition: color 0.3s;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  transition: color 0.3s;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.actions .btn {
  width: 100%;
  text-align: left;
  padding: 0.75rem;
  margin: .25rem 0;
}

.section {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  transition: border-color 0.3s;
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.test-buttons .btn {
  flex: 1;
  min-width: 120px;
}

.logout-section {
  text-align: center;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s, border-color 0.3s;
}

.dashboard-routes {
  margin-top: 2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .welcome-title {
    font-size: 1.25rem;
  }

  .header-right {
    flex-direction: column;
    gap: 0.5rem;
  }

  .connection-status {
    width: 100%;
    justify-content: center;
  }

  .test-buttons .btn {
    min-width: auto;
  }
}

/* Focus styles */
.btn:focus {
  outline: 2px solid #456882;
  outline-offset: 2px;
}

/* Transitions */
.dashboard-header,
.card,
.logout-section {
  transition: all 0.3s;
}
</style>

<template>
  <header class="app-header">
    <NotificationBell />
    <div class="connection-status" :class="{ connected: socketConnected }">
      {{ socketConnected ? "🟢 Connected" : "🔴 Disconnected" }}
    </div>
  </header>
  <div>
    <h1>{{$t('Welcome')}}, {{ auth.user?.name }}</h1>
    <div class="nav-buttons">
      <h3>Activity Feed</h3>
      <ul>
        <li v-for="(log, index) in auth.activityLogs" :key="index">
          <span v-if="log.type === 'login'">🔑 Logged in</span>
          <span v-if="log.type === 'profile_update'"
            >✏️ Updated {{ log.field }}</span
          >
          <small> - {{ new Date(log.timestamp).toLocaleString() }}</small>
        </li>
      </ul>

      <button @click="goProfile">My Profile</button>

      <div v-if="user?.role === 'admin' || user?.role === 'manager'">
        <button @click="goCompanies">Companies</button>
        <button @click="goDepartments">Departments</button>
      </div>

      <div
        v-if="
          user?.role === 'admin' ||
          user?.role === 'manager' ||
          user?.role === 'employee'
        "
      >
        <button @click="goEmployees">Employees</button>
      </div>
    </div>

    <!-- Test Notification Button -->
    <div class="test-section">
      <h3>Test Notifications</h3>
      <button @click="testNotification('success')" class="test-btn success">
        Test Success
      </button>
      <button @click="testNotification('warning')" class="test-btn warning">
        Test Warning
      </button>
      <button @click="testNotification('error')" class="test-btn error">
        Test Error
      </button>
      <button @click="testNotification('info')" class="test-btn info">
        Test Info
      </button>
    </div>

    <button @click="logout">Logout</button>

    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useNotificationStore } from "../stores/notificationStore";
import { ref, onMounted } from "vue";
import socket from "../socket";
import NotificationBell from "../components/NotificationBell.vue";

const router = useRouter();
const auth = useAuthStore();
const notificationStore = useNotificationStore();
const user = auth.user;
const socketConnected = ref(false);

auth.loadUser();

// Socket connection status
onMounted(() => {
  socket.on("connect", () => {
    socketConnected.value = true;
  });

  socket.on("disconnect", () => {
    socketConnected.value = false;
  });

  socket.on("connect_error", () => {
    socketConnected.value = false;
  });
});

function logout() {
  auth.logout();
  router.push("/login");
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

function canAccess(allowedRoles) {
  return allowedRoles.includes(auth.user?.role);
}

function goProfile() {
  router.push("/dashboard/profile");
}

// Test notification function
function testNotification(type) {
  const messages = {
    success: "This is a success notification!",
    warning: "This is a warning notification!",
    error: "This is an error notification!",
    info: "This is an info notification!",
  };

  notificationStore.addNotification(messages[type], type);
}
</script>

<style scoped>
.nav-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.connection-status {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.connection-status.connected {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.test-section {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.test-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.test-btn {
  margin-right: 0.5rem;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.test-btn.success {
  background: #28a745;
  color: white;
}

.test-btn.warning {
  background: #ffc107;
  color: #212529;
}

.test-btn.error {
  background: #dc3545;
  color: white;
}

.test-btn.info {
  background: #17a2b8;
  color: white;
}

.test-btn:hover {
  opacity: 0.8;
}
</style>

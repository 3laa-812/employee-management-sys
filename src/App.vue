<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="title">
            <router-link to="/dashboard"
              >Employee Management System</router-link
            >
          </div>

          <div class="controls">
            <select v-model="locale" class="select">
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>

            <button @click="toggleTheme" class="btn btn-secondary">
              {{ themeStore.currentTheme === "light" ? "🌙" : "☀️" }}
              <span class="hide-mobile">
                {{ themeStore.currentTheme === "light" ? "Dark" : "Light" }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p class="text-center">© {{ new Date().getFullYear() }} Employee Management System</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import socket from "./socket";
import { useNotificationStore } from "./stores/notificationStore";
import { useThemeStore } from "./stores/theme";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const themeStore = useThemeStore();
const notificationStore = useNotificationStore();

// Watch for locale changes
watch(locale, () => {
  applyDirection();
  localStorage.setItem("locale", locale.value);
});

// Load saved settings on mount
onMounted(() => {
  const savedLocale = localStorage.getItem("locale");
  if (savedLocale) {
    locale.value = savedLocale;
  }

  applyDirection();
  themeStore.applyTheme();

  // Set up socket notifications
  setupSocketNotifications();
});

function switchLang() {
  // Handled by watcher
}

function toggleTheme() {
  themeStore.toggleTheme();
}

function applyDirection() {
  if (locale.value === "ar") {
    document.documentElement.setAttribute("dir", "rtl");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
  }
}

function setupSocketNotifications() {
  // Listen for notifications from server
  socket.on("notification", (data) => {
    notificationStore.addNotification(data.message, data.type || "info");
  });

  // Listen for specific events
  socket.on("company_created", (data) => {
    notificationStore.addNotification(
      `New company "${data.name}" created`,
      "success"
    );
  });

  socket.on("company_updated", (data) => {
    notificationStore.addNotification(`Company "${data.name}" updated`, "info");
  });

  socket.on("company_deleted", (data) => {
    notificationStore.addNotification(
      `Company "${data.name}" deleted`,
      "warning"
    );
  });

  socket.on("department_created", (data) => {
    notificationStore.addNotification(
      `New department "${data.name}" created`,
      "success"
    );
  });

  socket.on("employee_created", (data) => {
    notificationStore.addNotification(
      `New employee "${data.name}" added`,
      "success"
    );
  });

  // Connection status
  socket.on("connect", () => {
    console.log("✅ Socket connected");
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", () => {
    console.log("⚠️ Socket connection failed");
    notificationStore.addNotification(
      "Real-time notifications are currently unavailable.",
      "warning"
    );
  });
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.title a {
  color: var(--text-primary);
  text-decoration: none;
}

.title a:hover {
  color: #456882;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 1rem 0;
  margin-top: auto;
}

.text-center {
  text-align: center;
}

.hide-mobile {
  display: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .title {
    font-size: 1.25rem;
    text-align: center;
  }

  .controls {
    justify-content: center;
  }
}

@media (min-width: 768px) {
  .hide-mobile {
    display: inline;
  }
}

/* Focus styles */
.select:focus,
.btn:focus {
  outline: 2px solid #456882;
  outline-offset: 2px;
}

/* Transitions */
.header,
.main,
.footer {
  transition: background-color 0.3s, border-color 0.3s;
}
</style>

<template>
  <div id="app">
    <div>
      <select v-model="locale" @change="switchLang">
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>

    <button @click="themeStore.toggleTheme">
      Toggle Theme: {{ themeStore.currentTheme }}
    </button>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from "vue";
import socket from "./socket";
import { useNotificationStore } from "./stores/notificationStore";
import { useThemeStore } from "./stores/theme";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
let socketConnected = false;
const themeStore = useThemeStore();

// Watch for locale changes and update direction
watch(locale, () => {
  applyDirection();
  localStorage.setItem("locale", locale.value);
});

// Load locale from localStorage on mount
onMounted(() => {
  const savedLocale = localStorage.getItem("locale");
  if (savedLocale && savedLocale !== locale.value) {
    locale.value = savedLocale;
  }
  applyDirection();
  themeStore.applyTheme();

  const notificationStore = useNotificationStore();

  // Listen for notifications from server
  socket.on("notification", (data) => {
    console.log("📨 Received notification:", data);
    notificationStore.addNotification(data.message, data.type || "info");
  });

  // Listen for specific event notifications
  socket.on("company_created", (data) => {
    notificationStore.addNotification(
      `New company "${data.name}" created`,
      "success"
    );
  });

  socket.on("company_updated", (data) => {
    notificationStore.addNotification(`Company "${data.name}" updated", "info`);
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
    socketConnected = true;
    console.log("✅ Socket connected - notifications enabled");
  });

  socket.on("disconnect", () => {
    socketConnected = false;
    console.log("❌ Socket disconnected - notifications disabled");
  });

  socket.on("connect_error", () => {
    socketConnected = false;
    console.log("⚠️ Socket connection failed - using fallback notifications");

    // Add a fallback notification
    notificationStore.addNotification(
      "Real-time notifications are currently unavailable. You can still use the test buttons.",
      "warning"
    );
  });
});

onUnmounted(() => {
  // Clean up socket listeners if needed
  socket.off("notification");
  socket.off("company_created");
  socket.off("company_updated");
  socket.off("company_deleted");
  socket.off("department_created");
  socket.off("employee_created");
});

// Optional: keep for manual change, but not strictly needed with watcher
function switchLang() {
  // No need to set localStorage or call applyDirection here anymore
}

function applyDirection() {
  if (locale.value === "ar") {
    document.documentElement.setAttribute("dir", "rtl");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
  }
}
</script>

<style>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
}

/* Light theme (default) */
:root {
  --bg-color: #fff;
  --text-color: #222;
}

/* Dark theme */
[data-theme="dark"] {
  --bg-color: #181818;
  --text-color: #f1f1f1;
}

#app {
  background: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
  transition: background 0.3s, color 0.3s;
}
</style>

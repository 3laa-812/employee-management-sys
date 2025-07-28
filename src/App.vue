<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import socket from "./socket";
import { useNotificationStore } from "./stores/notificationStore";

let socketConnected = false;

onMounted(() => {
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
</script>

<style>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
}
</style>

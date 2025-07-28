// src/stores/notification.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref([]);

  function addNotification(message, type = "info") {
    notifications.value.unshift({
      id: Date.now() + Math.random(),
      message,
      type, // 'info', 'success', 'warning', 'error'
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  function markAllRead() {
    notifications.value.forEach((n) => (n.read = true));
  }

  function markAsRead(id) {
    const notification = notifications.value.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length
  );

  return {
    notifications,
    addNotification,
    markAllRead,
    markAsRead,
    removeNotification,
    unreadCount,
  };
});

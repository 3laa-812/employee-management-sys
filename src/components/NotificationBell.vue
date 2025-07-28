<!-- src/components/NotificationBell.vue -->
<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="bell-btn"
      aria-label="Open notifications"
      aria-haspopup="menu"
      :aria-expanded="showDropdown.toString()"
    >
      🔔
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <div
      v-if="showDropdown"
      class="dropdown"
      role="menu"
      aria-label="Notifications"
    >
      <div class="dropdown-header">
        <span>Notifications</span>
        <button @click="markAllRead" class="mark-all-btn">Mark All Read</button>
      </div>
      <ul class="notification-list" role="list">
        <li
          v-for="n in notifications"
          :key="n.id"
          :class="{ unread: !n.read, [`type-${n.type}`]: true }"
          @click="markAsRead(n.id)"
          role="listitem"
          :tabindex="0"
          @keydown="onNotificationKeyDown($event, n.id)"
        >
          <div class="notification-content">
            <div class="notification-message">{{ n.message }}</div>
            <small class="notification-time">{{
              formatTime(n.createdAt)
            }}</small>
          </div>
          <button
            @click.stop="removeNotification(n.id)"
            class="remove-btn"
            title="Remove notification"
          >
            ×
          </button>
        </li>
        <li v-if="notifications.length === 0" class="empty-state">
          No notifications
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "../stores/notificationStore";

const showDropdown = ref(false);
const notificationStore = useNotificationStore();
const {
  notifications,
  unreadCount,
  markAllRead,
  markAsRead,
  removeNotification,
} = notificationStore;

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function onNotificationKeyDown(e, id) {
  if (e.key === "Enter" || e.key === " ") {
    markAsRead(id);
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    let next = e.target.nextElementSibling;
    while (next && next.getAttribute("role") !== "listitem")
      next = next.nextElementSibling;
    if (next) next.focus();
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    let prev = e.target.previousElementSibling;
    while (prev && prev.getAttribute("role") !== "listitem")
      prev = prev.previousElementSibling;
    if (prev) prev.focus();
    e.preventDefault();
  } else if (e.key === "Escape") {
    showDropdown.value = false;
    e.preventDefault();
  }
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest(".relative")) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.bell-btn {
  position: relative;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.bell-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  padding: 2px 6px;
  min-width: 18px;
  text-align: center;
  font-weight: bold;
}

.dropdown {
  position: absolute;
  top: 2.5rem;
  right: 0;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e1e8ed;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.mark-all-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.mark-all-btn:hover {
  background: #0056b3;
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notification-list li {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: background-color 0.2s;
}

.notification-list li:hover {
  background-color: #f8f9fa;
}

.notification-list li:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-message {
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  color: #6c757d;
  font-size: 0.75rem;
}

.unread {
  background-color: #f0f8ff;
  font-weight: 500;
}

.unread:hover {
  background-color: #e6f3ff;
}

.type-success {
  border-left: 4px solid #28a745;
}

.type-warning {
  border-left: 4px solid #ffc107;
}

.type-error {
  border-left: 4px solid #dc3545;
}

.type-info {
  border-left: 4px solid #17a2b8;
}

.remove-btn {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  line-height: 1;
}

.remove-btn:hover {
  color: #dc3545;
}

.empty-state {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  cursor: default;
}

.empty-state:hover {
  background-color: transparent;
}
</style>

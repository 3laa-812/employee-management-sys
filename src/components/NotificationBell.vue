<!-- src/components/NotificationBell.vue -->
<template>
  <div class="notification-bell">
    <button
      @click="toggleDropdown"
      class="bell-btn"
      aria-label="Open notifications"
      :aria-expanded="showDropdown.toString()"
    >
      🔔
      <span v-if="unreadCount > 0" class="badge">
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </button>

    <div v-if="showDropdown" class="dropdown" role="menu">
      <div class="dropdown-header">
        <h3>Notifications</h3>
        <button
          @click="markAllRead"
          class="mark-all-btn"
          :disabled="unreadCount === 0"
        >
          Mark All Read
        </button>
      </div>

      <div class="dropdown-body">
        <ul class="notification-list">
          <li
            v-for="n in notifications"
            :key="n.id"
            :class="{ unread: !n.read }"
            @click="markAsRead(n.id)"
            class="notification-item"
          >
            <div class="notification-content">
              <div class="notification-message">{{ n.message }}</div>
              <div class="notification-time">{{ formatTime(n.timestamp) }}</div>
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
            <p>No notifications</p>
            <small>You're all caught up!</small>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "../stores/notificationStore";

const notificationStore = useNotificationStore();
const showDropdown = ref(false);

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function markAsRead(id) {
  notificationStore.markAsRead(id);
}

function markAllRead() {
  notificationStore.markAllRead();
}

function removeNotification(id) {
  notificationStore.removeNotification(id);
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString();
  }
  return d.toLocaleDateString();
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

function handleClickOutside(event) {
  if (!event.target.closest(".notification-bell")) {
    showDropdown.value = false;
  }
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.bell-btn:hover {
  background-color: var(--bg-secondary);
}

.bell-btn:focus {
  outline: 2px solid #456882;
  outline-offset: 2px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #dc3545;
  color: var(--text-primary);
  border-radius: 50%;
  font-size: 0.75rem;
  padding: 2px 6px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 320px;
  max-height: 400px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(27, 60, 83, 0.1);
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px 8px 0 0;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.mark-all-btn {
  background-color: #456882;
  color: var(--text-primary);
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-all-btn:hover:not(:disabled) {
  background-color: #1b3c53;
}

.mark-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notification-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--bg-secondary);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
  margin-right: 0.5rem;
}

.notification-message {
  margin-bottom: 0.25rem;
  line-height: 1.4;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.notification-time {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.notification-item.unread {
  background-color: rgba(69, 104, 130, 0.1);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  line-height: 1;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  cursor: default;
  padding: 2rem;
}

.empty-state:hover {
  background-color: transparent;
}

.empty-state p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.empty-state small {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dropdown {
    position: fixed;
    top: 60px;
    left: 1rem;
    right: 1rem;
    width: auto;
    max-width: none;
  }

  .dropdown-header {
    padding: 0.75rem 1rem;
  }

  .dropdown-header h3 {
    font-size: 1rem;
  }

  .notification-item {
    padding: 0.75rem 1rem;
  }

  .notification-message {
    font-size: 0.75rem;
  }

  .notification-time {
    font-size: 0.75rem;
  }
}

@media (max-width: 576px) {
  .bell-btn {
    padding: 0.25rem;
    min-height: 40px;
    min-width: 40px;
    font-size: 1.125rem;
  }

  .badge {
    font-size: 0.625rem;
    padding: 1px 4px;
    min-width: 16px;
  }
}

/* Focus styles */
.notification-item:focus {
  outline: 2px solid #456882;
  outline-offset: -2px;
}

/* Transitions */
.bell-btn,
.dropdown,
.notification-item,
.remove-btn {
  transition: all 0.2s;
}
</style>

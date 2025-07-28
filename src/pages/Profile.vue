<template>
  <div class="profile">
    <div class="profile-header">
      <h2>My Profile</h2>
      <p>Manage your account information and preferences</p>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="card-header">
          <h3>Personal Information</h3>
        </div>

        <div class="card-body">
          <form @submit.prevent="save" class="profile-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control"
                disabled
              />
              <small class="form-text">Email cannot be changed</small>
            </div>

            <div class="form-group">
              <label for="password">New Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                placeholder="Leave blank to keep current password"
              />
              <small class="form-text">Minimum 6 characters</small>
            </div>

            <div class="form-group">
              <label for="photo">Profile Photo</label>
              <input
                id="photo"
                type="file"
                @change="onFileChange"
                class="form-control"
                accept="image/*"
              />
            </div>

            <div v-if="preview" class="photo-preview">
              <img :src="preview" alt="Profile preview" class="preview-image" />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                @click="resetForm"
                class="btn btn-secondary"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Account Activity -->
      <div class="activity-card">
        <div class="card-header">
          <h3>Recent Activity</h3>
        </div>
        <div class="card-body">
          <div v-if="auth.activityLogs.length === 0" class="empty-state">
            <p>No recent activity</p>
          </div>
          <ul v-else class="activity-list">
            <li
              v-for="(log, index) in auth.activityLogs.slice(0, 5)"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const form = ref({
  name: "",
  email: "",
  password: "",
  photo: "",
});

const preview = ref("");

onMounted(() => {
  // Load user data
  form.value.name = auth.user?.name || "";
  form.value.email = auth.user?.email || "";
  preview.value = auth.user?.photo || "";
});

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.value = reader.result;
      form.value.photo = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

function save() {
  // Validate password if provided
  if (form.value.password && form.value.password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }

  // Simulate update
  const updatedUser = {
    ...auth.user,
    name: form.value.name,
    photo: form.value.photo,
  };

  if (form.value.password) {
    updatedUser.password = form.value.password;
  }

  auth.user = updatedUser;
  auth.updateProfile(updatedUser);

  // Add activity log
  auth.addActivityLog({
    type: "profile_update",
    field: "profile",
    timestamp: new Date().toISOString(),
  });

  alert("Profile updated successfully!");
}

function resetForm() {
  form.value.name = auth.user?.name || "";
  form.value.email = auth.user?.email || "";
  form.value.password = "";
  preview.value = auth.user?.photo || "";
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString();
  }
  return d.toLocaleDateString();
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.profile-header p {
  color: var(--text-secondary);
  margin: 0;
}

.profile-content {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .profile-content {
    grid-template-columns: 2fr 1fr;
  }
}

.profile-card,
.activity-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(27, 60, 83, 0.1);
  overflow: hidden;
}

.card-header {
  background-color: var(--bg-secondary);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  padding: 1.5rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-control {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #456882;
  box-shadow: 0 0 0 3px rgba(69, 104, 130, 0.1);
}

.form-control:disabled {
  background-color: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.photo-preview {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.preview-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.form-actions .btn {
  flex: 1;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item small {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile {
    padding: 0.5rem;
  }

  .profile-header h2 {
    font-size: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}

/* Focus styles */
.form-control:focus,
.btn:focus {
  outline: 2px solid #456882;
  outline-offset: 2px;
}

/* Transitions */
.profile-card,
.activity-card,
.form-control,
.btn {
  transition: all 0.3s;
}
</style>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <h1 class="login-title">Welcome Back</h1>
          <p class="login-subtitle">
            Sign in to your Employee Management System
          </p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
              class="form-control"
              :class="{ error: error }"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              class="form-control"
              :class="{ error: error }"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="form-actions">
            <button type="submit" class="login-btn" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? "Signing in..." : "Sign In" }}
            </button>
          </div>
        </form>

        <!-- Demo Credentials -->
        <div class="demo-info">
          <h3>Demo Credentials</h3>
          <p>Use these credentials to test the system</p>
          <div class="demo-credentials">
            <div class="credential-item">
              <strong>Email:</strong> admin@example.com
            </div>
            <div class="credential-item"><strong>Password:</strong> 123456</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);

async function login() {
  error.value = "";
  isLoading.value = true;

  try {
    await auth.login(email.value, password.value);
    router.push("/dashboard");
  } catch (err) {
    error.value = err.message || "Login failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #456882 0%, #1b3c53 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(27, 60, 83, 0.1);
  padding: 2rem;
  border: 1px solid var(--border-color);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.login-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s;
  min-height: 48px;
}

.form-control:focus {
  outline: none;
  border-color: #456882;
  box-shadow: 0 0 0 3px rgba(69, 104, 130, 0.1);
}

.form-control.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-actions {
  margin-top: 2rem;
}

.login-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  min-height: 52px;
  background-color: #456882;
  color: #f9f3ef;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover {
  background-color: #1b3c53;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(27, 60, 83, 0.1);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-links {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.login-links a {
  color: #456882;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.login-links a:hover {
  color: #1b3c53;
  text-decoration: underline;
}

.demo-info {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.demo-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.demo-info p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.demo-credentials {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.credential-item {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.credential-item strong {
  color: var(--text-primary);
  margin-right: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 575px) {
  .login-page {
    padding: 0.5rem;
  }

  .login-card {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .login-subtitle {
    font-size: 0.875rem;
  }

  .form-control {
    font-size: 1rem;
    min-height: 44px;
  }

  .login-btn {
    font-size: 1rem;
    min-height: 48px;
  }
}

@media (max-width: 767px) {
  .login-container {
    max-width: 100%;
  }
}

/* Focus styles */
.form-control:focus,
.login-btn:focus {
  outline: 2px solid #456882;
  outline-offset: 2px;
}

/* Transitions */
.login-card,
.form-control,
.login-btn {
  transition: all 0.3s;
}

/* Hover effects */
.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(27, 60, 83, 0.1),
    0 10px 10px -5px rgba(27, 60, 83, 0.04);
}
</style>

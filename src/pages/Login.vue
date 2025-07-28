<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      <p><router-link to="/forgot-password">Forgot Password?</router-link></p>
    </form>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const auth = useAuthStore();

async function login() {
  const success = await auth.login(email.value, password.value);
  if (success) {
    router.push("/dashboard");
  } else {
    error.value = "Invalid credentials";
  }
}
</script>

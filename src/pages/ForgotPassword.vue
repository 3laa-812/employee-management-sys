<template>
  <div class="forgot">
    <h2>Forgot Password</h2>
    <form @submit.prevent="sendReset">
      <label>Email:</label>
      <input v-model="email" type="email" required />
      <button type="submit">Send Reset Link</button>
    </form>
    <p v-if="sent">Reset link sent! Check your email.</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const sent = ref(false);

function sendReset() {
  // Simulate sending
  console.log(`Sending reset link to: ${email.value}`);
  sent.value = true;
}
</script>

<style scoped>
.forgot {
  max-width: 400px;
  margin: auto;
}
</style>

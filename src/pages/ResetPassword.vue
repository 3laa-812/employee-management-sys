<template>
  <div class="reset">
    <h2>Reset Password</h2>
    <form @submit.prevent="resetPassword">
      <input
        v-model="password"
        type="password"
        placeholder="New password"
        required
      />
      <input
        v-model="confirm"
        type="password"
        placeholder="Confirm password"
        required
      />
      <button type="submit">Reset</button>
    </form>
    <p v-if="done">Password has been reset!</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const password = ref("");
const confirm = ref("");
const done = ref(false);

function resetPassword() {
  if (password.value === confirm.value) {
    console.log("Password reset to:", password.value);
    done.value = true;
  } else {
    alert("Passwords do not match");
  }
}
</script>

<style scoped>
.reset {
  max-width: 400px;
  margin: auto;
}
</style>

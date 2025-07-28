<template>
  <div class="profile">
    <h2>My Profile</h2>

    <div class="form">
      <label>
        Name:
        <input v-model="form.name" type="text" />
      </label>

      <label>
        Email:
        <input v-model="form.email" type="email" disabled />
      </label>

      <label>
        New Password:
        <input
          v-model="form.password"
          type="password"
          placeholder="Leave blank to keep old"
        />
      </label>

      <label>
        Photo:
        <input type="file" @change="onFileChange" />
      </label>

      <div v-if="preview" class="preview">
        <img :src="preview" alt="Preview" />
      </div>

      <button @click="save">Save Changes</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const form = ref({
  name: auth.user?.name || "",
  email: auth.user?.email || "",
  password: "",
  photo: "",
});

const preview = ref(auth.user?.photo || "");

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
  localStorage.setItem("user", JSON.stringify(updatedUser));
  alert("Profile updated!");
}
</script>

<style scoped>
.profile {
  max-width: 500px;
  margin: auto;
}
.form label {
  display: block;
  margin-bottom: 1rem;
}
.preview img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>

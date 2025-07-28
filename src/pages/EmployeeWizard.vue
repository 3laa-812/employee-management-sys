<template>
  <div class="wizard">
    <h2>Onboard New Employee</h2>

    <div v-if="step === 1">
      <h3>Step 1: Personal Info</h3>
      <input v-model="form.name" placeholder="Full Name" />
      <input v-model="form.email" placeholder="Email" />
      <input type="file" @change="handleImageUpload" />
      <div v-if="preview">
        <img :src="preview" alt="Preview" width="100" />
      </div>
    </div>

    <div v-else-if="step === 2">
      <h3>Step 2: Role & Department</h3>
      <select v-model="form.departmentId">
        <option disabled value="">Select Department</option>
        <option v-for="d in departments" :key="d.id" :value="d.id">
          {{ d.name }}
        </option>
      </select>

      <input v-model="form.role" placeholder="Role" />
      <select v-model="form.status">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <div v-else-if="step === 3">
      <h3>Step 3: Permissions</h3>
      <div class="permissions">
        <div>
          <h4>Available</h4>
          <ul>
            <li v-for="(p, index) in availablePermissions" :key="index">
              <button @click="grantPermission(p)">{{ p }}</button>
            </li>
          </ul>
        </div>

        <div>
          <h4>Granted</h4>
          <ul>
            <li v-for="(p, index) in form.permissions" :key="index">
              <button @click="revokePermission(p)">{{ p }}</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="navigation">
      <button @click="prevStep" :disabled="step === 1">Back</button>
      <button v-if="step < 3" @click="nextStep">Next</button>
      <button v-else @click="submit">Finish</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDepartmentStore } from "../stores/department";
import { useEmployeeStore } from "../stores/employee";

const departmentStore = useDepartmentStore();
const employeeStore = useEmployeeStore();

const step = ref(1);

const form = ref({
  name: "",
  email: "",
  photo: null,
  departmentId: "",
  role: "",
  status: "active",
  permissions: [],
});

const availablePermissions = ref([
  "View Reports",
  "Manage Users",
  "Edit Projects",
  "Access Finance",
]);

const preview = ref(null);

onMounted(async () => {
  await departmentStore.fetchDepartments();
});

const departments = computed(() => departmentStore.departments);

function handleImageUpload(e) {
  const file = e.target.files[0];
  form.value.photo = file;

  const reader = new FileReader();
  reader.onload = () => {
    preview.value = reader.result;
  };
  reader.readAsDataURL(file);
}

function grantPermission(p) {
  form.value.permissions.push(p);
  availablePermissions.value = availablePermissions.value.filter(
    (perm) => perm !== p
  );
}

function revokePermission(p) {
  availablePermissions.value.push(p);
  form.value.permissions = form.value.permissions.filter((perm) => perm !== p);
}

function nextStep() {
  if (step.value < 3) step.value++;
}

function prevStep() {
  if (step.value > 1) step.value--;
}

async function submit() {
  await employeeStore.addEmployee(form.value);
  alert("Employee added successfully!");
  step.value = 1;
  form.value = {
    name: "",
    email: "",
    photo: null,
    departmentId: "",
    role: "",
    status: "active",
    permissions: [],
  };
  preview.value = null;
}
</script>

<style scoped>
.wizard {
  padding: 1rem;
  max-width: 600px;
}
.permissions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.permissions ul {
  list-style: none;
  padding: 0;
}
.navigation {
  margin-top: 1rem;
}
</style>

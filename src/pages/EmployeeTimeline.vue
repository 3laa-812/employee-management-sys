<template>
  <div>
    <h2>Timeline for {{ employee?.name }}</h2>

    <ul class="timeline">
      <li v-for="event in events" :key="event.id">
        <strong>{{ event.type }}</strong> - {{ event.date }}<br />
        <small>{{ event.details }}</small>
      </li>
    </ul>

    <button @click="goBack">Back</button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useEmployeeStore } from "../stores/employee";

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();

const employeeId = route.params.id;
const employee = ref(null);
const events = ref([]);

onMounted(async () => {
  await employeeStore.fetchEmployees();
  employee.value = employeeStore.employees.find((e) => e.id == employeeId);

  // simulate loading employee timeline data (replace with real backend later)
  events.value = [
    {
      id: 1,
      type: "Hired",
      date: "2023-09-01",
      details: `Joined as ${employee.value.role} in department ID ${employee.value.departmentId}`,
    },
    {
      id: 2,
      type: "Promotion",
      date: "2024-04-15",
      details: "Promoted to Senior Role",
    },
    {
      id: 3,
      type: "Performance Review",
      date: "2025-06-01",
      details: "Rated: Excellent",
    },
  ];
});

function goBack() {
  router.push("/dashboard/employees");
}
</script>

<style scoped>
.timeline {
  list-style-type: none;
  padding: 0;
}
.timeline li {
  margin-bottom: 1rem;
  border-left: 3px solid #456882;
  padding-left: 1rem;
  color: var(--text-primary);
}
</style>

<template>
  <input
    ref="input"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    placeholder="Enter address"
    type="text"
  />
</template>

<script setup>
import { onMounted, ref } from "vue";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const input = ref(null);

onMounted(() => {
  // Google Maps API is not configured, so we'll use a simple text input
  // The component will still work for manual address entry
  console.log("AddressInput mounted - manual entry mode");
});
</script>

<template>
  <input
    ref="input"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    placeholder="Enter address"
    type="text"
    :aria-label="ariaLabel"
  />
</template>

<script setup>
import { onMounted, ref, computed } from "vue";

const props = defineProps({
  modelValue: String,
  ariaLabel: { type: String, default: "Address input" },
});
const emit = defineEmits(["update:modelValue"]);

const input = ref(null);
const ariaLabel = computed(() => props.ariaLabel || "Address input");

onMounted(() => {
  // Google Maps API is not configured, so we'll use a simple text input
  // The component will still work for manual address entry
  console.log("AddressInput mounted - manual entry mode");
});
</script>

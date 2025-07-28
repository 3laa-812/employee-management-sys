<template>
  <li v-if="node && node.id">
    <div>{{ node.name }}</div>
    <ul v-if="node.children && node.children.length">
      <template
        v-for="(child, index) in node.children"
        :key="child?.id || index"
      >
        <TreeNode v-if="child && child.id" :node="child" />
      </template>
    </ul>
  </li>
</template>

<script setup>
defineProps({
  node: Object,
});

import TreeNode from "./TreeNode.vue"; // recursion
</script>

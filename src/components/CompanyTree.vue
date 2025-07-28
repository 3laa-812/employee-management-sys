<template>
  <div>
    <h3>Company Tree View</h3>
    <ul>
      <template
        v-for="(company, index) in treeData"
        :key="company?.id || index"
      >
        <TreeNode v-if="company && company.id" :node="company" />
      </template>
    </ul>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCompanyStore } from "../stores/company";
import TreeNode from "./TreeNode.vue";

const companyStore = useCompanyStore();

function buildTree(data, parentId = null, visited = new Set()) {
  if (!data || !Array.isArray(data)) return [];

  return data
    .filter(
      (item) => item && item.parentId === parentId && !visited.has(item.id)
    )
    .map((item) => {
      visited.add(item.id);
      return {
        ...item,
        children: buildTree(data, item.id, visited),
      };
    });
}

const treeData = computed(() => {
  return buildTree(companyStore.companies || []);
});
</script>

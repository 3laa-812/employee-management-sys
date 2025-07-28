<template>
  <div>
    <h3 id="company-tree-label">Company Tree View</h3>
    <ul role="tree" aria-labelledby="company-tree-label">
      <template
        v-for="(company, index) in treeData"
        :key="company?.id || index"
      >
        <TreeNode
          v-if="company && company.id"
          :node="company"
          @company-drop="onCompanyDrop"
        />
      </template>
    </ul>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCompanyStore } from "../stores/company";
import TreeNode from "./TreeNode.vue";

const companyStore = useCompanyStore();

async function onCompanyDrop({ draggedId, newParentId }) {
  const company = companyStore.companies.find((c) => c.id === draggedId);
  if (company && company.parentId !== newParentId) {
    await companyStore.updateCompany({ ...company, parentId: newParentId });
  }
}

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

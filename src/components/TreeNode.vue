<template>
  <li
    v-if="node && node.id"
    :role="'treeitem'"
    :aria-expanded="hasChildren ? expanded : undefined"
    draggable="true"
    @dragstart="onDragStart"
    @dragover.prevent="onDragOver"
    @drop="onDrop"
    :class="{ 'drop-target': isDragOver }"
  >
    <div
      :tabindex="0"
      :aria-label="node.name"
      @keydown="onKeyDown"
      @click="toggleExpand"
    >
      {{ node.name }}
    </div>
    <ul v-if="hasChildren && expanded" role="group">
      <template
        v-for="(child, index) in node.children"
        :key="child?.id || index"
      >
        <TreeNode
          v-if="child && child.id"
          :node="child"
          @company-drop="onChildDrop"
        />
      </template>
    </ul>
  </li>
</template>

<script setup>
import { ref } from "vue";
const emit = defineEmits(["company-drop"]);
const props = defineProps({ node: Object });
import TreeNode from "./TreeNode.vue"; // recursion

const hasChildren =
  props.node && props.node.children && props.node.children.length;
const expanded = ref(true);
const isDragOver = ref(false);

function toggleExpand() {
  if (hasChildren) expanded.value = !expanded.value;
}

function onKeyDown(e) {
  const current = e.target;
  if (e.key === "ArrowDown") {
    let next = current.parentElement.nextElementSibling;
    while (next && !next.querySelector('[role="treeitem"]'))
      next = next.nextElementSibling;
    if (next) next.querySelector('[role="treeitem"] > div').focus();
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    let prev = current.parentElement.previousElementSibling;
    while (prev && !prev.querySelector('[role="treeitem"]'))
      prev = prev.previousElementSibling;
    if (prev) prev.querySelector('[role="treeitem"] > div').focus();
    e.preventDefault();
  } else if (e.key === "ArrowRight") {
    if (hasChildren && !expanded.value) {
      expanded.value = true;
      e.preventDefault();
    }
  } else if (e.key === "ArrowLeft") {
    if (hasChildren && expanded.value) {
      expanded.value = false;
      e.preventDefault();
    }
  } else if (e.key === "Enter" || e.key === " ") {
    toggleExpand();
    e.preventDefault();
  }
}

function onDragStart(e) {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("company/id", props.node.id);
}

function onDragOver(e) {
  isDragOver.value = true;
}

function onDrop(e) {
  isDragOver.value = false;
  const draggedId = e.dataTransfer.getData("company/id");
  if (draggedId && draggedId !== props.node.id) {
    emit("company-drop", { draggedId, newParentId: props.node.id });
  }
}

function onChildDrop({ draggedId, newParentId }) {
  emit("company-drop", { draggedId, newParentId });
}
</script>

<style scoped>
.drop-target > div {
  outline: 2px solid #333399;
  background: #e0e7ff;
}
</style>

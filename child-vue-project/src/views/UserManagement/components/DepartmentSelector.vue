// src/views/UserManagement/components/DepartmentSelector.vue - 部门选择器

<template>
  <div class="department-selector">
    <el-tree
      ref="treeRef"
      :data="departmentStore.departmentTree"
      show-checkbox
      node-key="id"
      :default-expand-all="true"
      @check="handleCheck"
    >
      <template #default="{ node }">
        <span>{{ node.data.name }}</span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/department'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const departmentStore = useDepartmentStore()
const treeRef = ref()

watch(() => props.modelValue, (val) => {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys(val)
  }
})

const handleCheck = () => {
  const checkedNodes = treeRef.value.getCheckedNodes()
  const ids = checkedNodes.map((node: any) => node.id)
  emit('update:modelValue', ids)
}

onMounted(() => {
  departmentStore.fetchDepartments()
})
</script>

<style scoped>
.department-selector {
  max-height: 300px;
  overflow-y: auto;
}
</style>

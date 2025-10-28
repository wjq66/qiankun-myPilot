// src/views/UserManagement/components/RoleSelector.vue - 角色选择器

<template>
  <div class="role-selector">
    <el-checkbox-group v-model="selectedRoleIds">
      <el-checkbox
        v-for="role in roleStore.roles"
        :key="role.id"
        :label="role.id"
      >
        {{ role.name }} ({{ role.code }})
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoleStore } from '@/stores/role'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const roleStore = useRoleStore()
const selectedRoleIds = ref<number[]>(props.modelValue || [])

watch(() => props.modelValue, (val) => {
  selectedRoleIds.value = val
})

watch(selectedRoleIds, (val) => {
  emit('update:modelValue', val)
})

onMounted(() => {
  roleStore.fetchRoles()
})
</script>

<style scoped>
.role-selector {
  max-height: 300px;
  overflow-y: auto;
}
</style>

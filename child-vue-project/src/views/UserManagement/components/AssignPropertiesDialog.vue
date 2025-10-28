// src/views/UserManagement/components/AssignPropertiesDialog.vue - 分配属性对话框

<template>
  <el-dialog
    v-model="visible"
    title="分配岗位/部门/角色"
    width="700px"
    @close="handleCancel"
  >
    <div v-if="user" class="user-info">
      <p><strong>用户：</strong>{{ user.realName }} ({{ user.username }})</p>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 分配岗位 -->
      <el-tab-pane label="分配岗位" name="jobs">
        <JobSelector v-model="selectedJobs" />
      </el-tab-pane>

      <!-- 分配部门 -->
      <el-tab-pane label="分配部门" name="departments">
        <DepartmentSelector v-model="selectedDepartments" />
      </el-tab-pane>

      <!-- 分配角色 -->
      <el-tab-pane label="分配角色" name="roles">
        <RoleSelector v-model="selectedRoles" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">
        确认分配
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import JobSelector from './JobSelector.vue'
import DepartmentSelector from './DepartmentSelector.vue'
import RoleSelector from './RoleSelector.vue'
import type { User } from '@/types/user'

const props = defineProps<{
  modelValue: boolean
  user: User | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const userStore = useUserStore()
const visible = ref(props.modelValue)
const loading = ref(false)
const activeTab = ref('jobs')
const selectedJobs = ref<number[]>([])
const selectedDepartments = ref<number[]>([])
const selectedRoles = ref<number[]>([])

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    selectedJobs.value = []
    selectedDepartments.value = []
    selectedRoles.value = []
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleCancel = () => {
  visible.value = false
  selectedJobs.value = []
  selectedDepartments.value = []
  selectedRoles.value = []
}

const handleConfirm = async () => {
  if (!props.user) return

  const hasSelection = 
    selectedJobs.value.length > 0 ||
    selectedDepartments.value.length > 0 ||
    selectedRoles.value.length > 0

  if (!hasSelection) {
    ElMessage.warning('请至少选择一个属性进行分配')
    return
  }

  try {
    loading.value = true
    
    await userStore.batchAssign({
      userIds: [props.user.id],
      jobIds: selectedJobs.value.length > 0 ? selectedJobs.value : undefined,
      departmentIds: selectedDepartments.value.length > 0 ? selectedDepartments.value : undefined,
      roleIds: selectedRoles.value.length > 0 ? selectedRoles.value : undefined
    })

    ElMessage.success('分配成功')
    emit('success')
    handleCancel()
  } catch (e: any) {
    ElMessage.error(e.message || '分配失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-info {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.user-info p {
  margin: 0;
  font-size: 16px;
}
</style>

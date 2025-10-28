// src/views/UserManagement/components/BatchOperationDialog.vue - 批量操作对话框

<template>
  <el-dialog
    v-model="visible"
    title="批量操作"
    width="600px"
    @close="handleCancel"
  >
    <div class="batch-operation">
      <p>已选择 {{ users.length }} 个用户</p>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="分配岗位" name="jobs">
          <div class="operation-content">
            <JobSelector v-model="selectedJobs" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="分配部门" name="departments">
          <div class="operation-content">
            <DepartmentSelector v-model="selectedDepartments" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="分配角色" name="roles">
          <div class="operation-content">
            <RoleSelector v-model="selectedRoles" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="更改状态" name="status">
          <div class="operation-content">
            <el-radio-group v-model="newStatus">
              <el-radio label="active">在职</el-radio>
              <el-radio label="inactive">停用</el-radio>
              <el-radio label="resigned">离职</el-radio>
            </el-radio-group>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="userStore.isLoading">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useJobStore } from '@/stores/job'
import { useDepartmentStore } from '@/stores/department'
import { useRoleStore } from '@/stores/role'
import JobSelector from './JobSelector.vue'
import DepartmentSelector from './DepartmentSelector.vue'
import RoleSelector from './RoleSelector.vue'
import type { User } from '@/types/user'

const props = defineProps<{
  modelValue: boolean
  selectedUsers: User[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const userStore = useUserStore()
const jobStore = useJobStore()
const departmentStore = useDepartmentStore()
const roleStore = useRoleStore()

const visible = ref(props.modelValue)
const users = ref(props.selectedUsers)
const activeTab = ref('jobs')
const selectedJobs = ref<number[]>([])
const selectedDepartments = ref<number[]>([])
const selectedRoles = ref<number[]>([])
const newStatus = ref('active')

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(() => props.selectedUsers, (val) => {
  users.value = val
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
  try {
    const userIds = users.value.map(u => u.id)
    
    // 根据选择的标签页执行不同操作
    if (activeTab.value === 'jobs' && selectedJobs.value.length > 0) {
      await userStore.batchAssign({
        userIds,
        jobIds: selectedJobs.value
      })
    } else if (activeTab.value === 'departments' && selectedDepartments.value.length > 0) {
      await userStore.batchAssign({
        userIds,
        departmentIds: selectedDepartments.value
      })
    } else if (activeTab.value === 'roles' && selectedRoles.value.length > 0) {
      await userStore.batchAssign({
        userIds,
        roleIds: selectedRoles.value
      })
    } else if (activeTab.value === 'status') {
      // 更新状态
      for (const user of users.value) {
        await userStore.updateUserStatus(user.id, newStatus.value as any)
      }
    } else {
      ElMessage.warning('请选择要执行的操作')
      return
    }
    
    emit('success')
    handleCancel()
    ElMessage.success('批量操作成功')
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}
</script>

<style scoped>
.batch-operation {
  padding: 20px 0;
}

.operation-content {
  padding: 20px 0;
}

p {
  margin-bottom: 20px;
  color: #666;
}
</style>

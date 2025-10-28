// src/views/UserManagement/UserListView.vue - 用户列表页面

<template>
  <div class="user-list-view">
    <div class="page-header">
      <h1>用户管理</h1>
      <el-button type="primary" @click="handleCreate">新增用户</el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索用户（用户名、真实姓名、邮箱）"
        style="width: 300px"
        clearable
        @input="handleSearch"
      />
      <el-select
        v-model="statusFilter"
        placeholder="筛选状态"
        style="width: 150px"
        clearable
        @change="handleSearch"
      >
        <el-option label="在职" value="active" />
        <el-option label="停用" value="inactive" />
        <el-option label="离职" value="resigned" />
      </el-select>
      <el-button @click="handleReset">重置</el-button>
      <el-button type="success" :disabled="selectedUsers.length === 0" @click="handleBatchOperation">
        批量操作 ({{ selectedUsers.length }})
      </el-button>
    </div>

    <!-- 错误提示 -->
    <el-alert v-if="userStore.error" :title="userStore.error" type="error" show-icon closable @close="userStore.clearError()" />

    <!-- 用户列表 -->
    <el-table
      v-loading="userStore.isLoading"
      :data="userStore.users"
      style="margin-top: 20px"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="realName" label="真实姓名" width="120" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="380">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">查看</el-button>
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="success" @click="handleAssign(row)" style="margin-left: 8px">分配</el-button>
          <el-dropdown @command="(cmd) => handleCommand(cmd, row)">
            <el-button size="small">
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="activate">启用</el-dropdown-item>
                <el-dropdown-item command="deactivate">停用</el-dropdown-item>
                <el-dropdown-item command="resign">离职</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量操作对话框 -->
    <BatchOperationDialog
      v-model="showBatchDialog"
      :selected-users="selectedUsers"
      @success="handleBatchSuccess"
    />

    <!-- 用户表单对话框 -->
    <UserFormDialog
      v-model="showUserDialog"
      :user="currentUser"
      @success="handleFormSuccess"
    />

    <!-- 分配属性对话框 -->
    <AssignPropertiesDialog
      v-model="showAssignDialog"
      :user="currentUser"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import BatchOperationDialog from './components/BatchOperationDialog.vue'
import UserFormDialog from './components/UserFormDialog.vue'
import AssignPropertiesDialog from './components/AssignPropertiesDialog.vue'
import type { User } from '@/types/user'

const userStore = useUserStore()
const keyword = ref('')
const statusFilter = ref('')
const selectedUsers = ref<User[]>([])
const showBatchDialog = ref(false)
const showUserDialog = ref(false)
const showAssignDialog = ref(false)
const currentUser = ref<User | null>(null)

// 获取用户列表
const fetchUsers = () => {
  userStore.fetchUsers({
    keyword: keyword.value || undefined,
    status: statusFilter.value || undefined
  })
}

const handleSearch = () => {
  fetchUsers()
}

const handleReset = () => {
  keyword.value = ''
  statusFilter.value = ''
  fetchUsers()
}

const handleCreate = () => {
  currentUser.value = null
  showUserDialog.value = true
}

const handleView = (row: User) => {
  currentUser.value = row
  showUserDialog.value = true
}

const handleEdit = (row: User) => {
  currentUser.value = row
  showUserDialog.value = true
}

const handleFormSuccess = () => {
  ElMessage.success('操作成功')
  fetchUsers()
}

const handleAssign = (row: User) => {
  currentUser.value = row
  showAssignDialog.value = true
}

const handleAssignSuccess = () => {
  ElMessage.success('分配成功')
  fetchUsers()
}

const handleCommand = async (command: string, row: User) => {
  try {
    switch (command) {
      case 'activate':
        await userStore.updateUserStatus(row.id, 'active')
        ElMessage.success('用户已启用')
        break
      case 'deactivate':
        await userStore.updateUserStatus(row.id, 'inactive')
        ElMessage.success('用户已停用')
        break
      case 'resign':
        await ElMessageBox.confirm('确定要标记该用户为离职吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userStore.updateUserStatus(row.id, 'resigned')
        ElMessage.success('用户已标记为离职')
        break
      case 'delete':
        await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userStore.deleteUser(row.id)
        ElMessage.success('用户已删除')
        break
    }
    fetchUsers()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const handleBatchOperation = () => {
  // 获取选中的用户
  selectedUsers.value = [] // 这里应该从表格中获取选中的用户
  showBatchDialog.value = true
}

const handleBatchSuccess = () => {
  ElMessage.success('批量操作成功')
  fetchUsers()
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    active: 'success',
    inactive: 'warning',
    resigned: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    active: '在职',
    inactive: '停用',
    resigned: '离职'
  }
  return map[status] || status
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>

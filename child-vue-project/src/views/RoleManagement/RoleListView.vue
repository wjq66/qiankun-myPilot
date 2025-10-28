// src/views/RoleManagement/RoleListView.vue

<template>
  <div class="role-list-view">
    <div class="page-header">
      <h1>角色管理</h1>
      <el-button type="primary" @click="handleCreate">新增角色</el-button>
    </div>

    <el-table
      v-loading="roleStore.isLoading"
      :data="roleStore.roles"
      style="margin-top: 20px"
    >
      <el-table-column prop="code" label="角色编码" width="150" />
      <el-table-column prop="name" label="角色名称" width="200" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="权限数量" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.permissions?.length || 0 }} 个权限</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="系统预设" width="120">
        <template #default="{ row }">
          <el-tag :type="row.isSystem ? 'warning' : 'success'">
            {{ row.isSystem ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 角色表单对话框 -->
    <RoleFormDialog
      v-model="showRoleDialog"
      :role="currentRole"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoleStore } from '@/stores/role'
import { ElMessage, ElMessageBox } from 'element-plus'
import RoleFormDialog from './components/RoleFormDialog.vue'
import type { Role } from '@/types/role'

const roleStore = useRoleStore()
const showRoleDialog = ref(false)
const currentRole = ref<Role | null>(null)

const handleCreate = () => {
  currentRole.value = null
  showRoleDialog.value = true
}

const handleEdit = (row: Role) => {
  currentRole.value = row
  showRoleDialog.value = true
}

const handleFormSuccess = () => {
  ElMessage.success('操作成功')
  fetchRoles()
}

const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await roleStore.deleteRole(row.id)
    ElMessage.success('删除成功')
    roleStore.fetchRoles()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const fetchRoles = () => {
  roleStore.fetchRoles()
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.role-list-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
}
</style>

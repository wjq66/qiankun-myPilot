// src/views/DepartmentManagement/DepartmentTreeView.vue

<template>
  <div class="department-tree-view">
    <div class="page-header">
      <h1>部门管理</h1>
      <el-button type="primary" @click="handleCreate">新增部门</el-button>
    </div>

    <el-tree
      :data="departmentStore.departmentTree"
      node-key="id"
      :default-expand-all="true"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <span>{{ data.name }} ({{ data.code }})</span>
          <div class="node-actions">
            <el-button size="small" @click="handleEdit(data)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(data)">删除</el-button>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- 部门表单对话框 -->
    <DepartmentFormDialog
      v-model="showDeptDialog"
      :department="currentDepartment"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/department'
import { ElMessage, ElMessageBox } from 'element-plus'
import DepartmentFormDialog from './components/DepartmentFormDialog.vue'

const departmentStore = useDepartmentStore()
const showDeptDialog = ref(false)
const currentDepartment = ref<any>(null)

const handleCreate = () => {
  currentDepartment.value = null
  showDeptDialog.value = true
}

const handleEdit = (data: any) => {
  currentDepartment.value = data
  showDeptDialog.value = true
}

const handleDelete = async (data: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await departmentStore.deleteDepartment(data.id)
    ElMessage.success('删除成功')
    departmentStore.fetchDepartments()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleFormSuccess = () => {
  ElMessage.success('操作成功')
  departmentStore.fetchDepartments()
}

onMounted(() => {
  departmentStore.fetchDepartments()
})
</script>

<style scoped>
.department-tree-view {
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

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.node-actions {
  margin-left: 20px;
}
</style>

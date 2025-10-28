// src/views/JobManagement/JobListView.vue

<template>
  <div class="job-list-view">
    <div class="page-header">
      <h1>岗位管理</h1>
      <el-button type="primary" @click="handleCreate">新增岗位</el-button>
    </div>

    <el-table
      v-loading="jobStore.isLoading"
      :data="jobStore.jobs"
      style="margin-top: 20px"
    >
      <el-table-column prop="code" label="岗位编码" width="150" />
      <el-table-column prop="name" label="岗位名称" width="200" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="level" label="级别" width="100" />
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

    <!-- 岗位表单对话框 -->
    <JobFormDialog
      v-model="showJobDialog"
      :job="currentJob"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useJobStore } from '@/stores/job'
import { ElMessage, ElMessageBox } from 'element-plus'
import JobFormDialog from './components/JobFormDialog.vue'
import type { Job } from '@/types/job'

const jobStore = useJobStore()
const showJobDialog = ref(false)
const currentJob = ref<Job | null>(null)

const handleCreate = () => {
  currentJob.value = null
  showJobDialog.value = true
}

const handleEdit = (row: Job) => {
  currentJob.value = row
  showJobDialog.value = true
}

const handleFormSuccess = () => {
  ElMessage.success('操作成功')
  fetchJobs()
}

const handleDelete = async (row: Job) => {
  try {
    await ElMessageBox.confirm('确定要删除该岗位吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await jobStore.deleteJob(row.id)
    ElMessage.success('删除成功')
    jobStore.fetchJobs()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const fetchJobs = () => {
  jobStore.fetchJobs()
}

onMounted(() => {
  fetchJobs()
})
</script>

<style scoped>
.job-list-view {
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

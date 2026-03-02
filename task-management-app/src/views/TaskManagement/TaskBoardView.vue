<!-- src/views/TaskManagement/TaskBoardView.vue - 任务看板视图 -->
<!-- 
  这个组件展示了 Vue3 的核心特性：
  1. Composition API 和 <script setup>
  2. 响应式数据 (ref, computed)
  3. 生命周期钩子 (onMounted)
  4. Pinia 状态管理
  5. 条件渲染和列表渲染
  6. 事件处理
  7. 组件通信 (props, emit)
-->

<template>
  <div class="task-board-view">
    <!-- 顶部工具栏 -->
    <el-card class="toolbar-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="stats-container">
            <div class="stat-item">
              <span class="stat-label">总任务</span>
              <span class="stat-value">{{ taskStore.taskStats.total }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">待办</span>
              <span class="stat-value">{{ taskStore.taskStats.todo }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">进行中</span>
              <span class="stat-value">{{ taskStore.taskStats.inProgress }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">待审核</span>
              <span class="stat-value">{{ taskStore.taskStats.review }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已完成</span>
              <span class="stat-value">{{ taskStore.taskStats.done }}</span>
            </div>
          </div>
        </div>
        <div class="toolbar-right">
          <el-button 
            type="primary" 
            :icon="Plus" 
            @click="handleCreateTask"
          >
            新建任务
          </el-button>
          <el-button :icon="Refresh" @click="handleRefresh">
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 加载状态 -->
    <el-skeleton v-if="taskStore.isLoading" :rows="5" animated />

    <!-- 错误提示 -->
    <el-alert
      v-if="taskStore.error"
      :title="taskStore.error"
      type="error"
      :closable="true"
      @close="taskStore.clearError"
      style="margin-bottom: 20px"
    />

    <!-- 任务看板 -->
    <div v-if="!taskStore.isLoading" class="kanban-board">
      <!-- 待办列 -->
      <TaskColumn
        title="待办"
        status="todo"
        :tasks="taskStore.tasksByStatus.todo"
        :color="'#909399'"
        @task-click="handleTaskClick"
        @task-edit="handleEditTask"
        @task-delete="handleDeleteTask"
        @status-change="handleStatusChange"
      />

      <!-- 进行中列 -->
      <TaskColumn
        title="进行中"
        status="in-progress"
        :tasks="taskStore.tasksByStatus['in-progress']"
        :color="'#409EFF'"
        @task-click="handleTaskClick"
        @task-edit="handleEditTask"
        @task-delete="handleDeleteTask"
        @status-change="handleStatusChange"
      />

      <!-- 待审核列 -->
      <TaskColumn
        title="待审核"
        status="review"
        :tasks="taskStore.tasksByStatus.review"
        :color="'#E6A23C'"
        @task-click="handleTaskClick"
        @task-edit="handleEditTask"
        @task-delete="handleDeleteTask"
        @status-change="handleStatusChange"
      />

      <!-- 已完成列 -->
      <TaskColumn
        title="已完成"
        status="done"
        :tasks="taskStore.tasksByStatus.done"
        :color="'#67C23A'"
        @task-click="handleTaskClick"
        @task-edit="handleEditTask"
        @task-delete="handleDeleteTask"
        @status-change="handleStatusChange"
      />
    </div>

    <!-- 任务表单对话框 -->
    <TaskFormDialog
      v-model="dialogVisible"
      :task="currentTask"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import {useTaskStore} from "@/stores/task"
  import { onMounted } from "vue"
  import type {Task, TaskStatus} from "@/types/task"
  import TaskColumn from './components/TaskColumn.vue'
  import TaskFormDialog from './components/TaskFormDialog.vue'
  import { ElMessage } from 'element-plus'


  // 响应式状态
  const taskStore = useTaskStore()
  const dialogVisible = ref(false) 
  const currentTask = ref<Task | null>(null)  // 当前编辑的任务

  onMounted(async () => {
    await taskStore.fetchTasks()
  })

  const handleCreateTask = () => {
    currentTask.value = null;
    dialogVisible.value = true;
  }

  const handleRefresh = async () => {
    await taskStore.fetchTasks()
    ElMessage.success('刷新成功')
  }



  const handleTaskClick = (task: Task) => {
    console.log("点击任务", task)
  }

  /**
   * 处理编辑任务
   */
  const handleEditTask = (task:Task) => {
    currentTask.value = task;
    dialogVisible.value = true;
  }

  /**
   * 处理删除任务
   */
  const handleDeleteTask = (task:Task) => {
    console.log("删除任务", task)

  }

  /**
   * 
   */
   const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await taskStore.updateTaskStatus(taskId,newStatus)
      ElMessage.success('状态更新成功')
    } catch (error) {
      ElMessage.error('状态更新失败')
    }
  }

  const handleDialogSuccess = () => {
    dialogVisible.value = false
    currentTask.value = null
    // ElMessage.success(currentTask.value ? '更新成功' : '创建成功')
  }


</script>

<style scoped>
.task-board-view {
  padding: 0px 8px 8px;
  min-height: calc(100vh - 200px);
}

/* 工具栏样式 */
.toolbar-card {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
}

.toolbar-left h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

/* 统计信息样式 */
.stats-container {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

/* 看板布局 */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  min-height: 600px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

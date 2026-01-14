<!-- src/views/TaskManagement/components/TaskColumn.vue - 任务列组件 -->
<!-- 
  这个组件展示了：
  1. Props 定义和类型检查
  2. Emits 事件定义
  3. 列表渲染 (v-for)
  4. 条件渲染 (v-if)
  5. 事件处理 (@click)
  6. 计算属性
-->

<template>
  <div class="task-column">
    <!-- 列标题 -->
    <div class="column-header" :style="{ borderTopColor: color }">
      <div class="header-left">
        <span class="column-title">{{ title }}</span>
        <el-badge :value="tasks.length" class="task-count-badge" />
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="task-list">
      <!-- 空状态 -->
      <el-empty 
        v-if="tasks.length === 0" 
        description="暂无任务"
        :image-size="80"
      />

      <!-- 任务卡片 -->
      <TransitionGroup name="task-list" tag="div">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @click="handleTaskClick(task)"
          @edit="handleEdit(task)"
          @delete="handleDelete(task)"
          @status-change="handleStatusChange"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
// ========== 导入依赖 ==========
import { computed } from 'vue'
import type { Task, TaskStatus } from '@/types/task'
import TaskCard from './TaskCard.vue'

// ========== Props 定义 ==========
interface Props {
  title: string              // 列标题
  status: TaskStatus         // 列状态
  tasks: Task[]              // 任务列表
  color?: string             // 列颜色
}

const props = withDefaults(defineProps<Props>(), {
  color: '#409EFF'
})

// ========== Emits 定义 ==========
const emit = defineEmits<{
  (e: 'task-click', task: Task): void
  (e: 'task-edit', task: Task): void
  (e: 'task-delete', task: Task): void
  (e: 'status-change', taskId: number, status: TaskStatus): void
}>()

// ========== 计算属性 ==========
/**
 * 任务数量（用于显示）
 */
const taskCount = computed(() => props.tasks.length)

// ========== 事件处理 ==========

/**
 * 处理任务点击
 */
const handleTaskClick = (task: Task) => {
  emit('task-click', task)
}

/**
 * 处理编辑任务
 */
const handleEdit = (task: Task) => {
  emit('task-edit', task)
}

/**
 * 处理删除任务
 */
const handleDelete = (task: Task) => {
  emit('task-delete', task)
}

/**
 * 处理状态变更
 */
const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
  emit('status-change', taskId, newStatus)
}
</script>

<style scoped>
.task-column {
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 500px;
  max-height: calc(100vh - 250px);
  overflow: hidden;
}

/* 列标题 */
.column-header {
  padding: 16px 20px;
  background: white;
  border-top: 4px solid;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.column-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.task-count-badge {
  margin-left: 8px;
}

/* 任务列表 */
.task-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 列表过渡动画 */
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s ease;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.task-list-move {
  transition: transform 0.3s ease;
}
</style>

<template>
  <div class="task-column">
    <!-- 列标题 -->
    <div class="column-header" :style="{ borderTopColor: color }">
      <div class="header-left">
        <span class="column-title">{{ title }}</span>
        <el-badge :value="tasks.length" class="task-count-badge" />
      </div>
    </div>
    <div class="task-list">
      <!-- 空状态 -->
      <el-empty 
        v-if="tasks.length === 0" 
        description="暂无任务"
        :image-size="80"
      />

      <!-- 任务卡片 -->
      <TaskCard 
        v-for="task in tasks" 
        :key="task.id" 
        :task="task" 
        @click="handleTaskClick(task)"
        @edit = "handleEdit(task)"
        @delete = "handleDelete(task)"
        @status-change = "handleStatusChange(task.id, task.status)"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
 import { ref } from 'vue';
 import {computed} from 'vue';
 import TaskCard from "./TaskCard.vue";
 import type {Task, TaskStatus} from "@/types/task";
 
//  定义props
interface Props {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#409EFF'
});
 
const emit = defineEmits<{
  (e: 'task-click', task: Task): void;
  (e: 'task-edit', task: Task): void;
  (e: 'task-delete', task: Task): void;
  (e: 'status-change', taskId: number, newStatus: TaskStatus): void;
}>()
  
const handleTaskClick = (task: Task) => {
  emit('task-click', task)
}

const handleEdit = (task: Task) => {
  emit('task-edit', task)
}

const handleDelete = (task: Task) => {
  emit('task-delete', task)
}

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
<template>
  <el-card  
    class="task-card" 
    :class="{ 'task-card-overdue': isOverdue }" 
    shadow="hover" 
     @click.stop="handleClick"
  >
    <!-- 任务优先级标识 -->
    <div class="priority-indicator" :class="`priority-${task.priority}`"></div>

    <!-- 任务标题 -->
    <div class="task-header">
      <h3 class="task-title">{{ task.title }}</h3>
      <el-dropdown @command="handleCommand" trigger="click" @click.stop>
        <el-button 
          :icon="MoreFilled" 
          circle 
          size="small"
          text
          @click.stop
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit" :icon="Edit">编辑</el-dropdown-item>
            <el-dropdown-item 
              command="delete" 
              :icon="Delete"
              divided
            >
              删除
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div> 

    <!-- 任务描述 -->
    <p v-if="task.description" class="task-description">
      {{ task.description }}
    </p>
    <!-- 任务标签 -->
    <div v-if="task.tags && task.tags.length > 0" class="task-tags">
      <el-tag
        v-for="tag in task.tags"
        :key="tag"
        size="small"
        effect="plain"
      >
        {{ tag }}
      </el-tag>
    </div>

    <!-- 任务元信息 -->
    <div class="task-footer">
      <!-- 负责人 -->
      <div v-if="task.assigneeName" class="task-meta">
        <el-icon><User /></el-icon>
        <span>{{ task.assigneeName }}</span>
      </div>

      <!-- 截止日期 -->
      <div v-if="task.dueDate" class="task-meta" :class="{ 'overdue': isOverdue }">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDate(task.dueDate) }}</span>
        <el-icon v-if="isOverdue" class="warning-icon"><Warning /></el-icon>
      </div>
    </div>

    <!-- 优先级标签 -->
    <div class="priority-badge" :class="`priority-${task.priority}`">
      {{ priorityText }}
    </div>


  </el-card>
</template>

<script setup lang="ts">
import type {Task} from "@/types/task";
import {MoreFilled, Edit, Delete, User, Calendar, Warning} from "@element-plus/icons-vue";
import {computed} from "vue";

interface Props {
  task: Task;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void;
  (e: 'delete', task: Task): void;
  (e: 'click', task: Task): void;
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const handleCommand = (command: string) => {
  if(command === 'edit') {
    emit('edit', props.task)
  } else if(command === 'delete') {
    emit('delete', props.task)
  }
}

const priorityText = computed(() => {
  const map = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return map[props.task.priority]
})

const handleClick = () => {
  emit('click', props.task)
}


</script>

<style scoped>
.task-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  margin-bottom: 0;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-card-overdue {
  border-left: 3px solid #f56c6c;
}

/* 优先级指示器 */
.priority-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: 4px 0 0 4px;
}

.priority-low {
  background-color: #909399;
}

.priority-medium {
  background-color: #409eff;
}

.priority-high {
  background-color: #e6a23c;
}

.priority-urgent {
  background-color: #f56c6c;
}

/* 任务头部 */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

/* 任务描述 */
.task-description {
  font-size: 14px;
  color: #606266;
  margin: 8px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 任务标签 */
.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

/* 任务底部信息 */
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-meta.overdue {
  color: #f56c6c;
  font-weight: 600;
}

.warning-icon {
  color: #f56c6c;
  margin-left: 4px;
}

/* 优先级徽章 */
.priority-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.priority-badge.priority-low {
  background-color: #909399;
}

.priority-badge.priority-medium {
  background-color: #409eff;
}

.priority-badge.priority-high {
  background-color: #e6a23c;
}

.priority-badge.priority-urgent {
  background-color: #f56c6c;
}
</style>

<template>
  <div class="gantt-container">
    <!-- 工具栏 -->
    <div class="gantt-toolbar">
      <div class="toolbar-left">
        <h2>项目进度甘特图</h2>
        <span class="project-info">企业管理系统开发项目</span>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button :type="scale === 'day' ? 'primary' : 'default'" @click="changeScale('day')">
            日视图
          </el-button>
          <el-button :type="scale === 'week' ? 'primary' : 'default'" @click="changeScale('week')">
            周视图
          </el-button>
          <el-button :type="scale === 'month' ? 'primary' : 'default'" @click="changeScale('month')">
            月视图
          </el-button>
        </el-button-group>
        <el-button @click="handleAddTask">
          <el-icon><Plus /></el-icon>
          添加任务
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <!-- <el-button @click="handleExpandAll">
          <el-icon><ArrowDown /></el-icon>
          展开全部
        </el-button>
        <el-button @click="handleCollapseAll">
          <el-icon><ArrowRight /></el-icon>
          折叠全部
        </el-button> -->
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="gantt-stats">
      <el-card shadow="never" class="stat-card">
        <div class="stat-item">
          <span class="stat-label">项目总进度：</span>
          <el-progress :percentage="totalProgress" :color="getProgressColor(totalProgress)" />
          <span class="stat-value">{{ totalProgress }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总任务数：</span>
          <span class="stat-value">{{ totalTasks }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成：</span>
          <span class="stat-value completed">{{ completedTasks }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">进行中：</span>
          <span class="stat-value in-progress">{{ inProgressTasks }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">未开始：</span>
          <span class="stat-value pending">{{ pendingTasks }}</span>
        </div>
      </el-card>
    </div>

    <!-- 甘特图容器 -->
    <div ref="ganttContainer" class="gantt-chart"></div>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="taskDialogVisible" title="任务详情" width="600px">
      <el-form :model="currentTask" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="currentTask.text" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="currentTask.start_date" type="date" format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="持续时间">
          <el-input-number v-model="currentTask.duration" :min="1" /> 天
        </el-form-item>
        <el-form-item label="进度">
          <el-slider v-model="currentTask.progress" :max="100" show-input />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="currentTask.owner" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentTask.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Refresh } from '@element-plus/icons-vue'
import gantt from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import { ganttTasks, ganttLinks, getGanttConfig, type GanttTask, type GanttLink } from '../services/ganttData'

// 甘特图容器引用
const ganttContainer = ref<HTMLElement | null>(null)

// 当前视图缩放级别
const scale = ref<'day' | 'week' | 'month'>('month')

// 任务数据
const tasks = ref<GanttTask[]>(ganttTasks)
const links = ref<GanttLink[]>(ganttLinks)

// 任务详情对话框
const taskDialogVisible = ref(false)
const currentTask = ref<Partial<GanttTask>>({})

// 统计信息
const totalTasks = computed(() => tasks.value.filter(t => t.type === 'task').length)
const completedTasks = computed(() => tasks.value.filter(t => t.type === 'task' && t.progress === 100).length)
const inProgressTasks = computed(() => tasks.value.filter(t => t.type === 'task' && t.progress > 0 && t.progress < 100).length)
const pendingTasks = computed(() => tasks.value.filter(t => t.type === 'task' && t.progress === 0).length)
const totalProgress = computed(() => {
  const taskList = tasks.value.filter(t => t.type === 'task')
  if (taskList.length === 0) return 0
  const sum = taskList.reduce((acc, t) => acc + t.progress, 0)
  return Math.round(sum / taskList.length)
})

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress === 100) return '#67C23A'
  if (progress > 0) return '#409EFF'
  return '#909399'
}

// 初始化甘特图
const initGantt = () => {
  if (!ganttContainer.value) return

  // 配置甘特图
  gantt.config.date_format = '%Y-%m-%d'
  
  // 启用任务分组（树形结构）
  gantt.config.order_branch = true // 启用分支排序
  gantt.config.order_branch_free = true // 允许自由排序
  
  // 配置时间轴
  gantt.config.scale_unit = 'day'
  gantt.config.scale_step = 1
  gantt.config.subscales = [
    { unit: 'month', step: 1, date: '%Y年%m月' }
  ]
  
  // 配置列（tree: true 启用树形结构和展开/折叠功能）
  // 重要：不要在列配置中使用 template，否则会覆盖展开/折叠按钮
  gantt.config.columns = [
    { 
      name: 'text', 
      label: '任务名称', 
      width: 250, 
      tree: true // 启用树形结构，自动显示展开/折叠按钮
      // 不要在这里使用 template，使用下面的 grid_folder 和 grid_file 模板
    },
    { name: 'start_date', label: '开始日期', width: 100, align: 'center' },
    { name: 'end_date', label: '结束日期', width: 100, align: 'center' },
    { name: 'duration', label: '持续时间', width: 80, align: 'center' },
    { 
      name: 'progress', 
      label: '进度', 
      width: 100, 
      align: 'center',
      template: (task: any) => {
        return `<div style="display: flex; align-items: center; gap: 8px;">
          <div style="flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${task.progress}%; background: ${getProgressColor(task.progress)}; transition: width 0.3s;"></div>
          </div>
          <span style="min-width: 35px; text-align: right;">${task.progress}%</span>
        </div>`
      }
    },
    { name: 'owner', label: '负责人', width: 100 }
  ]

  // 配置任务类型
  gantt.config.types = {
    project: {
      type: 'project',
      label: '项目',
      progress_color: '#409EFF'
    },
    task: {
      type: 'task',
      label: '任务',
      progress_color: '#67C23A'
    },
    milestone: {
      type: 'milestone',
      label: '里程碑',
      progress_color: '#E6A23C'
    }
  }

  // 配置任务颜色（根据进度）
  gantt.templates.task_class = (start: Date, end: Date, task: any) => {
    if (task.progress === 100) return 'task-completed'
    if (task.progress > 0) return 'task-in-progress'
    return 'task-pending'
  }

  // 配置任务文本（在时间轴上显示）
  gantt.templates.task_text = (start: Date, end: Date, task: any) => {
    return `${task.text} (${task.progress}%)`
  }

  // 配置网格中的文件夹图标（有子任务的任务/项目阶段）
  // 重要：这个模板用于有子任务的任务，会自动显示展开/折叠按钮
  gantt.templates.grid_folder = (task: any) => {
    let icon = '📁'
    if (task.type === 'project') icon = '📁'
    return `<span style="display: flex; align-items: center; gap: 4px;">
      <span style="font-size: 14px;">${icon}</span>
      <span>${task.text}</span>
    </span>`
  }

  // 配置网格中的文件图标（普通任务/无子任务）
  // 这个模板用于没有子任务的任务
  gantt.templates.grid_file = (task: any) => {
    let icon = '📄'
    if (task.type === 'milestone') icon = '🎯'
    return `<span style="display: flex; align-items: center; gap: 4px;">
      <span style="font-size: 14px;">${icon}</span>
      <span>${task.text}</span>
    </span>`
  }

  // 配置工具提示
  gantt.templates.tooltip_text = (start: Date, end: Date, task: any) => {
    return `
      <b>${task.text}</b><br/>
      开始日期: ${gantt.templates.tooltip_date_format(start)}<br/>
      结束日期: ${gantt.templates.tooltip_date_format(end)}<br/>
      进度: ${task.progress}%<br/>
      ${task.owner ? `负责人: ${task.owner}<br/>` : ''}
      ${task.description ? `描述: ${task.description}` : ''}
    `
  }

  // 配置日期格式
  gantt.templates.tooltip_date_format = gantt.date.date_to_str('%Y-%m-%d')

  // 启用拖拽
  gantt.config.drag_resize = true
  gantt.config.drag_move = true
  gantt.config.drag_links = true

  // 启用键盘导航
  gantt.config.keyboard_navigation = true

  // 启用任务分组和展开/折叠功能
  gantt.config.open_tree_initially = true // 默认展开所有分支
  gantt.config.show_task_cells = true // 显示任务单元格
  gantt.config.show_links = true // 显示任务链接（依赖关系）
  
  // 配置任务行高
  gantt.config.row_height = 40
  
  // 配置网格线
  gantt.config.grid_width = 300 // 左侧任务列表宽度

  // 初始化甘特图
  gantt.init(ganttContainer.value)

  // 加载数据
  gantt.parse({ data: tasks.value, links: links.value })
  
  // 确保所有父任务默认展开
  gantt.eachTask((task: any) => {
    if (task.type === 'project' && task.open !== false) {
      gantt.open(task.id)
    }
  })


  // 事件监听
  gantt.attachEvent('onTaskClick', (id: string | number) => {
    const task = gantt.getTask(id)
    currentTask.value = { ...task }
    taskDialogVisible.value = true
    return false
  })

  gantt.attachEvent('onAfterTaskUpdate', (id: string | number, task: any) => {
    console.log('任务已更新:', task)
    ElMessage.success('任务已更新')
    // 这里可以调用API保存数据
  })

  gantt.attachEvent('onAfterLinkAdd', (id: string | number, link: any) => {
    console.log('链接已添加:', link)
    ElMessage.success('任务依赖已添加')
  })
}

// 切换视图缩放
const changeScale = (newScale: 'day' | 'week' | 'month') => {
  scale.value = newScale
  
  switch (newScale) {
    case 'day':
      gantt.config.scale_unit = 'day'
      gantt.config.scale_step = 1
      gantt.config.subscales = [
        { unit: 'week', step: 1, date: '第%W周' },
        { unit: 'month', step: 1, date: '%Y年%m月' }
      ]
      break
    case 'week':
      gantt.config.scale_unit = 'week'
      gantt.config.scale_step = 1
      gantt.config.subscales = [
        { unit: 'month', step: 1, date: '%Y年%m月' }
      ]
      break
    case 'month':
      gantt.config.scale_unit = 'month'
      gantt.config.scale_step = 1
      gantt.config.subscales = [
        { unit: 'day', step: 1, date: '%d日' }
      ]
      break
  }
  
  gantt.render()
}

// 添加任务
const handleAddTask = () => {
  currentTask.value = {
    text: '新任务',
    start_date: gantt.date.date_to_str('%Y-%m-%d')(new Date()),
    duration: 5,
    progress: 0,
    type: 'task',
    parent: 0
  }
  taskDialogVisible.value = true
}

// 保存任务
const handleSaveTask = () => {
  if (!currentTask.value.text) {
    ElMessage.warning('请输入任务名称')
    return
  }

  if (currentTask.value.id) {
    // 更新任务
    gantt.updateTask(currentTask.value.id, currentTask.value)
    ElMessage.success('任务已更新')
  } else {
    // 添加新任务
    const newId = gantt.uid()
    const newTask = {
      id: newId,
      ...currentTask.value
    }
    gantt.addTask(newTask)
    tasks.value.push(newTask as GanttTask)
    ElMessage.success('任务已添加')
  }

  taskDialogVisible.value = false
  gantt.render()
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
  // 可以使用 gantt.exportToPDF() 或 gantt.exportToPNG()
}

// 刷新
const handleRefresh = () => {
  gantt.clearAll()
  gantt.parse({ data: tasks.value, links: links.value })
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  initGantt()
})

onBeforeUnmount(() => {
  if (ganttContainer.value) {
    gantt.destructor()
  }
})
</script>

<style scoped lang="scss">
.gantt-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f5f5f5;
}

.gantt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-left h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #333;
}

.project-info {
  color: #666;
  font-size: 14px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.gantt-stats {
  margin-bottom: 16px;
}

.stat-card {
  padding: 16px;
  display: flex;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  min-width: 100px;
  color: #666;
  font-size: 14px;
}

.stat-value {
  min-width: 60px;
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.stat-value.completed {
  color: #67C23A;
}

.stat-value.in-progress {
  color: #409EFF;
}

.stat-value.pending {
  color: #909399;
}

.gantt-chart {
  flex: 1;
  width: 100%;
  min-height: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 甘特图样式覆盖 */
:deep(.gantt_task_line) {
  border-radius: 4px;
}

:deep(.task-completed) {
  background-color: #67C23A !important;
}

:deep(.task-in-progress) {
  background-color: #409EFF !important;
}

:deep(.task-pending) {
  background-color: #909399 !important;
}

:deep(.gantt_task_progress) {
  background-color: rgba(255, 255, 255, 0.3);
}
el-icon{
    svg{
        width: 16px;
        height: 16px;
    }
}
</style>


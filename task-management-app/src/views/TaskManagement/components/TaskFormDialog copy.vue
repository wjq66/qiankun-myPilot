<!-- src/views/TaskManagement/components/TaskFormDialog.vue - 任务表单对话框 -->
<!-- 
  这个组件展示了：
  1. v-model 双向绑定
  2. 表单验证
  3. watch 监听器
  4. 表单提交处理
  5. 条件渲染
-->

<template>
  <el-dialog
    v-model="visible"
    :title="formData.id ? '编辑任务' : '新建任务'"
    width="700px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <!-- 任务标题 -->
      <el-form-item label="任务标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入任务标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 任务描述 -->
      <el-form-item label="任务描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入任务描述（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 任务状态 -->
      <el-form-item label="任务状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="todo">待办</el-radio>
          <el-radio label="in-progress">进行中</el-radio>
          <el-radio label="review">待审核</el-radio>
          <el-radio label="done">已完成</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 任务优先级 -->
      <el-form-item label="优先级" prop="priority">
        <el-radio-group v-model="formData.priority">
          <el-radio-button label="low">低</el-radio-button>
          <el-radio-button label="medium">中</el-radio-button>
          <el-radio-button label="high">高</el-radio-button>
          <el-radio-button label="urgent">紧急</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 负责人 -->
      <el-form-item label="负责人" prop="assigneeName">
        <el-input
          v-model="formData.assigneeName"
          placeholder="请输入负责人姓名（可选）"
        />
      </el-form-item>

      <!-- 截止日期 -->
      <el-form-item label="截止日期" prop="dueDate">
        <el-date-picker
          v-model="formData.dueDate"
          type="date"
          placeholder="选择截止日期（可选）"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签">
        <el-select
          v-model="formData.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入标签（可选）"
          style="width: 100%"
        >
          <el-option
            v-for="tag in commonTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">
        {{ formData.id ? '更新' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// ========== 导入依赖 ==========
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import type { Task } from '@/types/task'

// ========== Props 定义 ==========
interface Props {
  modelValue: boolean    // v-model 绑定值
  task?: Task | null     // 编辑时的任务数据
}

const props = withDefaults(defineProps<Props>(), {
  task: null
})

// ========== Emits 定义 ==========
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

// ========== 响应式状态 ==========
const taskStore = useTaskStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const formData = ref({
  id: undefined as number | undefined,
  title: '',
  description: '',
  status: 'todo' as Task['status'],
  priority: 'medium' as Task['priority'],
  assigneeName: '',
  dueDate: '',
  tags: [] as string[]
})

// 常用标签
const commonTags = ['前端', '后端', 'Vue3', '重要', '紧急', '文档', '样式', '数据库', '代码审查']

// ========== 表单验证规则 ==========
const rules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择任务状态', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// ========== 计算属性 ==========
/**
 * 对话框显示状态（支持 v-model）
 */
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// ========== 方法 ==========

/**
 * 重置表单
 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeName: '',
    dueDate: '',
    tags: []
  }
  formRef.value?.clearValidate()
}

// ========== 监听器 ==========
/**
 * 监听 task prop 变化，初始化表单数据
 */
watch(
  () => props.task,
  (task) => {
    if (task) {
      // 编辑模式：填充表单数据
      formData.value = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assigneeName: task.assigneeName || '',
        dueDate: task.dueDate || '',
        tags: task.tags || []
      }
    } else {
      // 新建模式：重置表单
      resetForm()
    }
  },
  { immediate: true }
)

/**
 * 监听对话框显示状态，关闭时重置表单
 */
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      // 对话框关闭时重置表单
      resetForm()
    }
  }
)

/**
 * 处理取消
 */
const handleCancel = () => {
  visible.value = false
}

/**
 * 处理确认提交
 */
const handleConfirm = async () => {
  
  // 表单验证
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 准备提交数据
    const submitData = {
      title: formData.value.title,
      description: formData.value.description || undefined,
      status: formData.value.status,
      priority: formData.value.priority,
      assigneeName: formData.value.assigneeName || undefined,
      dueDate: formData.value.dueDate || undefined,
      tags: formData.value.tags.length > 0 ? formData.value.tags : undefined
    }
    
    // 根据是否有 id 判断是创建还是更新
    if (formData.value.id) {
      // 更新任务
      await taskStore.updateTask(formData.value.id, submitData)
      ElMessage.success('任务更新成功')
    } else {
      // 创建任务
      await taskStore.createTask(submitData)
      ElMessage.success('任务创建成功')
    }
    
    // 触发成功事件
    emit('success')
    visible.value = false
  } catch (error: any) {
    // 验证失败或请求失败
    if (error !== false) {
      // error !== false 表示不是表单验证错误，而是请求错误
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 表单样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.el-radio-button__inner) {
  padding: 8px 16px;
}
</style>

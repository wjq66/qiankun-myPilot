// src/views/JobManagement/components/JobFormDialog.vue - 岗位表单对话框

<template>
  <el-dialog
    v-model="visible"
    :title="formData.id ? '编辑岗位' : '新增岗位'"
    width="600px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="岗位编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入岗位编码" />
      </el-form-item>

      <el-form-item label="岗位名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入岗位名称" />
      </el-form-item>

      <el-form-item label="岗位级别" prop="level">
        <el-input-number
          v-model="formData.level"
          :min="1"
          :max="10"
          placeholder="请输入岗位级别"
        />
      </el-form-item>

      <el-form-item label="岗位描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入岗位描述"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useJobStore } from '@/stores/job'
import type { Job } from '@/types/job'

const props = defineProps<{
  modelValue: boolean
  job?: Job | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const jobStore = useJobStore()
const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref()

const formData = ref({
  id: undefined,
  code: '',
  name: '',
  description: '',
  level: 5,
  sort: 0
})

const rules = {
  code: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  level: [{ required: true, message: '请输入岗位级别', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.job) {
    formData.value = { ...props.job }
  } else if (val) {
    formData.value = {
      id: undefined,
      code: '',
      name: '',
      description: '',
      level: 5,
      sort: 0
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleCancel = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (formData.value.id) {
      await jobStore.updateJob(formData.value.id, formData.value)
      ElMessage.success('更新岗位成功')
    } else {
      await jobStore.createJob(formData.value)
      ElMessage.success('创建岗位成功')
    }

    emit('success')
    handleCancel()
  } catch (e: any) {
    if (e !== false) {
      ElMessage.error(e.message || '操作失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

// src/views/DepartmentManagement/components/DepartmentFormDialog.vue - 部门表单对话框

<template>
  <el-dialog
    v-model="visible"
    :title="formData.id ? '编辑部门' : '新增部门'"
    width="600px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入部门编码" />
      </el-form-item>

      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入部门名称" />
      </el-form-item>

      <el-form-item label="父部门" prop="parentId">
        <el-select
          v-model="formData.parentId"
          placeholder="请选择父部门"
          clearable
        >
          <el-option
            v-for="dept in departmentOptions"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="部门描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入部门描述"
        />
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
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useDepartmentStore } from '@/stores/department'
import type { Department } from '@/types/department'

const props = defineProps<{
  modelValue: boolean
  department?: Department | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const departmentStore = useDepartmentStore()
const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref()

const formData = ref({
  id: undefined,
  code: '',
  name: '',
  parentId: null as number | null,
  description: ''
})

const rules = {
  code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const departmentOptions = computed(() => {
  return departmentStore.departments.filter(d => d.id !== props.department?.id)
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.department) {
    formData.value = {
      id: props.department.id,
      code: props.department.code,
      name: props.department.name,
      parentId: props.department.parentId,
      description: props.department.description || ''
    }
  } else if (val) {
    formData.value = {
      id: undefined,
      code: '',
      name: '',
      parentId: null,
      description: ''
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

onMounted(() => {
  departmentStore.fetchDepartments()
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
      await departmentStore.updateDepartment(formData.value.id, formData.value)
      ElMessage.success('更新部门成功')
    } else {
      await departmentStore.createDepartment(formData.value)
      ElMessage.success('创建部门成功')
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

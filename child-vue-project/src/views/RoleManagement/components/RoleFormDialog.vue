// src/views/RoleManagement/components/RoleFormDialog.vue - 角色表单对话框

<template>
  <el-dialog
    v-model="visible"
    :title="formData.id ? '编辑角色' : '新增角色'"
    width="700px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="角色编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入角色编码" />
      </el-form-item>

      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </el-form-item>

      <el-form-item label="权限选择" prop="permissions">
        <el-checkbox-group v-model="formData.permissions">
          <div class="permission-group">
            <div class="group-title">用户管理</div>
            <el-checkbox label="user:view">查看用户</el-checkbox>
            <el-checkbox label="user:create">创建用户</el-checkbox>
            <el-checkbox label="user:edit">编辑用户</el-checkbox>
            <el-checkbox label="user:delete">删除用户</el-checkbox>
          </div>

          <div class="permission-group">
            <div class="group-title">部门管理</div>
            <el-checkbox label="department:view">查看部门</el-checkbox>
            <el-checkbox label="department:manage">管理部门</el-checkbox>
          </div>

          <div class="permission-group">
            <div class="group-title">岗位管理</div>
            <el-checkbox label="job:view">查看岗位</el-checkbox>
            <el-checkbox label="job:manage">管理岗位</el-checkbox>
          </div>

          <div class="permission-group">
            <div class="group-title">角色管理</div>
            <el-checkbox label="role:view">查看角色</el-checkbox>
            <el-checkbox label="role:manage">管理角色</el-checkbox>
          </div>
        </el-checkbox-group>
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
import { useRoleStore } from '@/stores/role'
import type { Role } from '@/types/role'

const props = defineProps<{
  modelValue: boolean
  role?: Role | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const roleStore = useRoleStore()
const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref()

const formData = ref({
  id: undefined,
  code: '',
  name: '',
  description: '',
  permissions: [] as string[]
})

const rules = {
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.role) {
    formData.value = {
      id: props.role.id,
      code: props.role.code,
      name: props.role.name,
      description: props.role.description || '',
      permissions: [...props.role.permissions]
    }
  } else if (val) {
    formData.value = {
      id: undefined,
      code: '',
      name: '',
      description: '',
      permissions: []
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
      await roleStore.updateRole(formData.value.id, formData.value)
      ElMessage.success('更新角色成功')
    } else {
      await roleStore.createRole(formData.value)
      ElMessage.success('创建角色成功')
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

<style scoped>
.permission-group {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.group-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #409eff;
}

.permission-group .el-checkbox {
  margin-right: 20px;
  margin-bottom: 8px;
}
</style>

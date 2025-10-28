// src/views/UserManagement/components/UserFormDialog.vue - 用户表单对话框

<template>
  <el-dialog
    v-model="visible"
    :title="formData.id ? '编辑用户' : '新增用户'"
    width="600px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item v-if="!formData.id" label="密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="active">在职</el-radio>
          <el-radio label="inactive">停用</el-radio>
          <el-radio label="resigned">离职</el-radio>
        </el-radio-group>
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
import { useUserStore } from '@/stores/user'
import type { User } from '@/types/user'

const props = defineProps<{
  modelValue: boolean
  user?: User | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const userStore = useUserStore()
const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref()

const formData = ref({
  id: undefined,
  username: '',
  email: '',
  password: '',
  realName: '',
  phone: '',
  status: 'active'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.user) {
    formData.value = {
      id: props.user.id,
      username: props.user.username,
      email: props.user.email,
      password: '',
      realName: props.user.realName,
      phone: props.user.phone || '',
      status: props.user.status
    }
  } else if (val) {
    formData.value = {
      id: undefined,
      username: '',
      email: '',
      password: '',
      realName: '',
      phone: '',
      status: 'active'
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
      await userStore.updateUser(formData.value.id, {
        username: formData.value.username,
        realName: formData.value.realName,
        email: formData.value.email,
        phone: formData.value.phone,
        status: formData.value.status
      })
      ElMessage.success('更新用户成功')
    } else {
      await userStore.createUser({
        username: formData.value.username,
        realName: formData.value.realName,
        email: formData.value.email,
        password: formData.value.password,
        phone: formData.value.phone,
        status: formData.value.status
      })
      ElMessage.success('创建用户成功')
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

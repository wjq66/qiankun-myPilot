// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户接口定义
interface User {
  id: number
  username: string
  email: string
  password: string
}

// 登录表单接口
interface LoginForm {
  username: string
  password: string
}

// 注册表单接口
interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 忘记密码表单接口
interface ForgotPasswordForm {
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref('')

  // 模拟用户数据库（实际项目中应该连接后端API）
  const users = ref<User[]>([
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: '123456'
    },
    {
      id: 2,
      username: 'user',
      email: 'user@example.com',
      password: '123456'
    }
  ])

  // 计算属性
  const userInfo = computed(() => ({
    id: currentUser.value?.id,
    username: currentUser.value?.username,
    email: currentUser.value?.email
  }))

  // 方法
  const login = async (loginForm: LoginForm) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 查找用户
      const user = users.value.find(
        u => u.username === loginForm.username && u.password === loginForm.password
      )

      if (user) {
        currentUser.value = user
        isAuthenticated.value = true
        
        // 保存到本地存储
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('isAuthenticated', 'true')
        
        return { success: true, message: '登录成功！' }
      } else {
        errorMessage.value = '用户名或密码错误'
        return { success: false, message: '用户名或密码错误' }
      }
    } catch (error) {
      errorMessage.value = '登录失败，请稍后重试'
      return { success: false, message: '登录失败，请稍后重试' }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (registerForm: RegisterForm) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 验证密码确认
      if (registerForm.password !== registerForm.confirmPassword) {
        errorMessage.value = '两次输入的密码不一致'
        return { success: false, message: '两次输入的密码不一致' }
      }

      // 检查用户名是否已存在
      const existingUser = users.value.find(u => u.username === registerForm.username)
      if (existingUser) {
        errorMessage.value = '用户名已存在'
        return { success: false, message: '用户名已存在' }
      }

      // 检查邮箱是否已存在
      const existingEmail = users.value.find(u => u.email === registerForm.email)
      if (existingEmail) {
        errorMessage.value = '邮箱已被注册'
        return { success: false, message: '邮箱已被注册' }
      }

      // 创建新用户
      const newUser: User = {
        id: Date.now(), // 简单的ID生成
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password
      }

      users.value.push(newUser)
      
      return { success: true, message: '注册成功！请登录' }
    } catch (error) {
      errorMessage.value = '注册失败，请稍后重试'
      return { success: false, message: '注册失败，请稍后重试' }
    } finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (forgotForm: ForgotPasswordForm) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 查找用户
      const user = users.value.find(
        u => u.username === forgotForm.username && u.email === forgotForm.email
      )

      if (user) {
        return { success: true, message: '密码重置链接已发送到您的邮箱' }
      } else {
        errorMessage.value = '用户名或邮箱不匹配'
        return { success: false, message: '用户名或邮箱不匹配' }
      }
    } catch (error) {
      errorMessage.value = '操作失败，请稍后重试'
      return { success: false, message: '操作失败，请稍后重试' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
    errorMessage.value = ''
    
    // 清除本地存储
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedAuth = localStorage.getItem('isAuthenticated')
    
    if (savedUser && savedAuth === 'true') {
      currentUser.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  const clearError = () => {
    errorMessage.value = ''
  }

  return {
    // 状态
    currentUser,
    isAuthenticated,
    isLoading,
    errorMessage,
    
    // 计算属性
    userInfo,
    
    // 方法
    login,
    register,
    forgotPassword,
    logout,
    checkAuth,
    clearError
  }
})

<!-- src/views/ForgotPasswordView.vue -->
<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>忘记密码</h1>
        <p>请输入您的用户名和邮箱，我们将发送密码重置链接</p>
      </div>

      <form @submit.prevent="handleForgotPassword" class="auth-form">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="forgotForm.username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="isLoading"
            class="form-input"
            @blur="validateUsername"
          />
          <div v-if="usernameError" class="field-error">
            {{ usernameError }}
          </div>
        </div>

        <!-- 邮箱输入 -->
        <div class="form-group">
          <label for="email">邮箱地址</label>
          <input
            id="email"
            v-model="forgotForm.email"
            type="email"
            placeholder="请输入注册时的邮箱地址"
            required
            :disabled="isLoading"
            class="form-input"
            @blur="validateEmail"
          />
          <div v-if="emailError" class="field-error">
            {{ emailError }}
          </div>
        </div>

        <!-- 错误信息显示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 成功信息显示 -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="auth-button primary"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? '发送中...' : '发送重置链接' }}
        </button>

        <!-- 返回登录链接 -->
        <div class="auth-links">
          <router-link to="/login" class="link">
            ← 返回登录
          </router-link>
        </div>
      </form>

      <!-- 说明信息 -->
      <div class="auth-footer">
        <div class="info-box">
          <h4>📧 密码重置说明</h4>
          <ul>
            <li>请确保输入的用户名和邮箱与注册时一致</li>
            <li>密码重置链接将发送到您的邮箱</li>
            <li>链接有效期为24小时</li>
            <li>如果没有收到邮件，请检查垃圾邮件文件夹</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const forgotForm = reactive({
  username: '',
  email: ''
})

const successMessage = ref('')

// 字段验证错误
const usernameError = ref('')
const emailError = ref('')

// 计算属性
const isLoading = computed(() => authStore.isLoading)
const errorMessage = computed(() => authStore.errorMessage)

// 表单验证
const isFormValid = computed(() => {
  return forgotForm.username.trim() &&
         forgotForm.email.trim() &&
         !usernameError.value &&
         !emailError.value
})

// 方法
const validateUsername = () => {
  const username = forgotForm.username.trim()
  if (!username) {
    usernameError.value = '用户名不能为空'
  } else if (username.length < 3) {
    usernameError.value = '用户名至少需要3个字符'
  } else {
    usernameError.value = ''
  }
}

const validateEmail = () => {
  const email = forgotForm.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    emailError.value = '邮箱不能为空'
  } else if (!emailRegex.test(email)) {
    emailError.value = '请输入有效的邮箱地址'
  } else {
    emailError.value = ''
  }
}

const handleForgotPassword = async () => {
  // 清除之前的消息
  authStore.clearError()
  successMessage.value = ''
  
  // 验证所有字段
  validateUsername()
  validateEmail()
  
  // 如果表单无效，不提交
  if (!isFormValid.value) {
    return
  }
  
  // 执行忘记密码操作
  const result = await authStore.forgotPassword(forgotForm)
  
  if (result.success) {
    successMessage.value = result.message
    // 清空表单
    forgotForm.username = ''
    forgotForm.email = ''
  }
}

// 组件挂载时检查认证状态
onMounted(() => {
  authStore.checkAuth()
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 600;
}

.auth-header p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.auth-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.field-error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #fcc;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #c3e6cb;
}

.auth-button {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.auth-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-links {
  text-align: center;
  margin-top: 1rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.auth-footer {
  margin-top: 2rem;
}

.info-box {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.info-box h4 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-box li {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.info-box li::before {
  content: "•";
  color: #667eea;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-container {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 2rem;
  }
  
  .auth-header h1 {
    font-size: 1.5rem;
  }
  
  .info-box {
    padding: 1rem;
  }
}
</style>

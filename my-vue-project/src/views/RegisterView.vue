<!-- src/views/RegisterView.vue -->
<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>用户注册</h1>
        <p>创建您的账户，开始使用我们的服务</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="registerForm.username"
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
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱地址"
            required
            :disabled="isLoading"
            class="form-input"
            @blur="validateEmail"
          />
          <div v-if="emailError" class="field-error">
            {{ emailError }}
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input">
            <input
              id="password"
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              required
              :disabled="isLoading"
              class="form-input"
              @blur="validatePassword"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="password-toggle"
              :disabled="isLoading"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div v-if="passwordError" class="field-error">
            {{ passwordError }}
          </div>
        </div>

        <!-- 确认密码输入 -->
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <div class="password-input">
            <input
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              required
              :disabled="isLoading"
              class="form-input"
              @blur="validateConfirmPassword"
            />
            <button
              type="button"
              @click="toggleConfirmPasswordVisibility"
              class="password-toggle"
              :disabled="isLoading"
            >
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div v-if="confirmPasswordError" class="field-error">
            {{ confirmPasswordError }}
          </div>
        </div>

        <!-- 密码强度指示器 -->
        <div v-if="registerForm.password" class="password-strength">
          <div class="strength-label">密码强度：</div>
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :class="passwordStrengthClass"
              :style="{ width: passwordStrengthWidth }"
            ></div>
          </div>
          <div class="strength-text">{{ passwordStrengthText }}</div>
        </div>

        <!-- 错误信息显示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 注册按钮 -->
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="auth-button primary"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>

      <!-- 登录提示 -->
      <div class="auth-footer">
        <p>
          已有账户？
          <router-link to="/login" class="link">
            立即登录
          </router-link>
        </p>
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
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 字段验证错误
const usernameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// 计算属性
const isLoading = computed(() => authStore.isLoading)
const errorMessage = computed(() => authStore.errorMessage)

// 密码强度计算
const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return { score: 0, text: '', width: '0%', class: '' }
  
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  const strengthMap = [
    { text: '很弱', width: '20%', class: 'very-weak' },
    { text: '弱', width: '40%', class: 'weak' },
    { text: '一般', width: '60%', class: 'medium' },
    { text: '强', width: '80%', class: 'strong' },
    { text: '很强', width: '100%', class: 'very-strong' }
  ]
  
  return strengthMap[Math.min(score - 1, 4)] || strengthMap[0]
})

const passwordStrengthText = computed(() => passwordStrength.value.text)
const passwordStrengthWidth = computed(() => passwordStrength.value.width)
const passwordStrengthClass = computed(() => passwordStrength.value.class)

// 表单验证
const isFormValid = computed(() => {
  return registerForm.username &&
         registerForm.email &&
         registerForm.password &&
         registerForm.confirmPassword &&
         !usernameError.value &&
         !emailError.value &&
         !passwordError.value &&
         !confirmPasswordError.value &&
         registerForm.password === registerForm.confirmPassword
})

// 方法
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const validateUsername = () => {
  const username = registerForm.username.trim()
  if (!username) {
    usernameError.value = '用户名不能为空'
  } else if (username.length < 3) {
    usernameError.value = '用户名至少需要3个字符'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    usernameError.value = '用户名只能包含字母、数字和下划线'
  } else {
    usernameError.value = ''
  }
}

const validateEmail = () => {
  const email = registerForm.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    emailError.value = '邮箱不能为空'
  } else if (!emailRegex.test(email)) {
    emailError.value = '请输入有效的邮箱地址'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  const password = registerForm.password
  if (!password) {
    passwordError.value = '密码不能为空'
  } else if (password.length < 6) {
    passwordError.value = '密码至少需要6个字符'
  } else {
    passwordError.value = ''
  }
}

const validateConfirmPassword = () => {
  const password = registerForm.password
  const confirmPassword = registerForm.confirmPassword
  
  if (!confirmPassword) {
    confirmPasswordError.value = '请确认密码'
  } else if (password !== confirmPassword) {
    confirmPasswordError.value = '两次输入的密码不一致'
  } else {
    confirmPasswordError.value = ''
  }
}

const handleRegister = async () => {
  // 清除之前的错误信息
  authStore.clearError()
  
  // 验证所有字段
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  
  // 如果表单无效，不提交
  if (!isFormValid.value) {
    return
  }
  
  // 执行注册
  const result = await authStore.register(registerForm)
  
  if (result.success) {
    // 注册成功，跳转到登录页面
    router.push('/login')
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

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.password-toggle:hover {
  background-color: #f8f9fa;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.field-error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.strength-bar {
  height: 4px;
  background-color: #e1e5e9;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.very-weak {
  background-color: #dc3545;
}

.strength-fill.weak {
  background-color: #fd7e14;
}

.strength-fill.medium {
  background-color: #ffc107;
}

.strength-fill.strong {
  background-color: #20c997;
}

.strength-fill.very-strong {
  background-color: #198754;
}

.strength-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.strength-text.very-weak {
  color: #dc3545;
}

.strength-text.weak {
  color: #fd7e14;
}

.strength-text.medium {
  color: #ffc107;
}

.strength-text.strong {
  color: #20c997;
}

.strength-text.very-strong {
  color: #198754;
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

.auth-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e5e9;
}

.auth-footer p {
  color: #666;
  font-size: 0.9rem;
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
}
</style>

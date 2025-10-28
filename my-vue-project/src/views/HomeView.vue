<!-- src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <section class="welcome-section">
      <div class="welcome-content">
        <h1>🎉 欢迎回来！</h1>
        <p class="welcome-text">
          您好，<strong>{{ userInfo.username }}</strong>！
          欢迎使用我们的系统
        </p>
        <div class="user-info">
          <div class="info-item">
            <span class="label">用户名：</span>
            <span class="value">{{ userInfo.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱：</span>
            <span class="value">{{ userInfo.email }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能卡片区域 -->
    <section class="features-section">
      <h2>功能导航</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="card-icon">👤</div>
          <h3>用户中心</h3>
          <p>查看和编辑您的用户信息</p>
          <button class="card-button" @click="goToProfile">
            进入
          </button>
        </div>

        <div class="feature-card">
          <div class="card-icon">⚙️</div>
          <h3>系统设置</h3>
          <p>配置您的系统偏好设置</p>
          <button class="card-button" @click="goToSettings">
            进入
          </button>
        </div>

        <div class="feature-card">
          <div class="card-icon">📊</div>
          <h3>数据统计</h3>
          <p>查看您的使用数据和统计信息</p>
          <button class="card-button" @click="goToStats">
            进入
          </button>
        </div>

        <div class="feature-card">
          <div class="card-icon">💬</div>
          <h3>消息中心</h3>
          <p>查看系统通知和消息</p>
          <button class="card-button" @click="goToMessages">
            进入
          </button>
        </div>
      </div>
    </section>

    <!-- 快速操作区域 -->
    <section class="quick-actions">
      <h2>快速操作</h2>
      <div class="actions-grid">
        <button class="action-button primary" @click="refreshData">
          🔄 刷新数据
        </button>
        <button class="action-button secondary" @click="exportData">
          📤 导出数据
        </button>
        <button class="action-button warning" @click="showLogoutConfirm">
          🚪 退出登录
        </button>
      </div>
    </section>

    <!-- 系统信息 -->
    <section class="system-info">
      <h2>系统信息</h2>
      <div class="info-grid">
        <div class="info-card">
          <h4>登录时间</h4>
          <p>{{ loginTime }}</p>
        </div>
        <div class="info-card">
          <h4>会话状态</h4>
          <p class="status-active">🟢 活跃</p>
        </div>
        <div class="info-card">
          <h4>系统版本</h4>
          <p>v1.0.0</p>
        </div>
      </div>
    </section>

    <!-- 退出确认对话框 -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="hideLogoutConfirm">
      <div class="modal-content" @click.stop>
        <h3>确认退出</h3>
        <p>您确定要退出登录吗？</p>
        <div class="modal-actions">
          <button class="modal-button cancel" @click="hideLogoutConfirm">
            取消
          </button>
          <button class="modal-button confirm" @click="handleLogout">
            确认退出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const showLogoutModal = ref(false)
const loginTime = ref('')

// 计算属性
const userInfo = computed(() => authStore.userInfo)

// 方法
const goToProfile = () => {
  // 这里可以跳转到个人资料页面
  alert('个人资料功能开发中...')
}

const goToSettings = () => {
  // 这里可以跳转到设置页面
  alert('系统设置功能开发中...')
}

const goToStats = () => {
  // 这里可以跳转到统计页面
  alert('数据统计功能开发中...')
}

const goToMessages = () => {
  // 这里可以跳转到消息页面
  alert('消息中心功能开发中...')
}

const refreshData = () => {
  // 刷新数据
  alert('数据已刷新！')
}

const exportData = () => {
  // 导出数据
  alert('数据导出功能开发中...')
}

const showLogoutConfirm = () => {
  showLogoutModal.value = true
}

const hideLogoutConfirm = () => {
  showLogoutModal.value = false
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
  showLogoutModal.value = false
}

// 组件挂载时
onMounted(() => {
  // 检查认证状态
  authStore.checkAuth()
  
  // 如果未登录，跳转到登录页面
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  // 设置登录时间
  loginTime.value = new Date().toLocaleString('zh-CN')
})

</script>

<style scoped>
.home-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 3rem;
  margin-bottom: 3rem;
  text-align: center;
}

.welcome-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.welcome-text {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.user-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.info-item .label {
  opacity: 0.8;
  margin-right: 0.5rem;
}

.info-item .value {
  font-weight: 600;
}

.features-section {
  margin-bottom: 3rem;
}

.features-section h2 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.feature-card p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.card-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.card-button:hover {
  background: #5a6fd8;
}

.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.actions-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.action-button.primary {
  background: #28a745;
  color: white;
}

.action-button.secondary {
  background: #17a2b8;
  color: white;
}

.action-button.warning {
  background: #dc3545;
  color: white;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.system-info {
  margin-bottom: 3rem;
}

.system-info h2 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.info-card h4 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.info-card p {
  color: #666;
  margin: 0;
}

.status-active {
  color: #28a745 !important;
  font-weight: 600;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.modal-content p {
  color: #666;
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.modal-button.cancel {
  background: #6c757d;
  color: white;
}

.modal-button.confirm {
  background: #dc3545;
  color: white;
}

.modal-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }
  
  .welcome-section {
    padding: 2rem;
  }
  
  .welcome-content h1 {
    font-size: 2rem;
  }
  
  .user-info {
    flex-direction: column;
    align-items: center;
  }
  
  .actions-grid {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>

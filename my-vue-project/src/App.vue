<template>
  <div id="app">
    <!-- 登录/注册页面 - 不显示导航 -->
    <div v-if="showAuthPages">
      <router-view />
    </div>

    <!-- 后台布局 - 顶部导航 + 左侧菜单 -->
    <div v-else class="admin-layout">
      <!-- 顶部导航栏 -->
      <header class="top-navbar">
        <div class="navbar-left">
          <h1 class="logo">🔐 管理系统</h1>
        </div>
        <div class="navbar-right">
          <div class="user-info">
            <span class="username">{{ userInfo.username }}</span>
            <div class="user-avatar">{{ userInfo.username.charAt(0).toUpperCase() }}</div>
            <select @change="handleUserAction($event.target.value)" class="user-select">
              <option value="">▼</option>
              <option value="profile">个人资料</option>
              <option value="settings">系统设置</option>
              <option value="logout">退出登录</option>
            </select>
          </div>
        </div>
      </header>

      <!-- 左侧菜单栏 -->
      <aside class="sidebar" :class="{ collapsed: isCollapsed }">
        <div class="sidebar-menu">
          <div
            v-for="item in menuItems"
            :key="item.path"
            class="menu-item"
            :class="{ active: currentRoute === item.path }"
            @click="navigateTo(item)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content" :class="{ collapsed: isCollapsed }">
        <div class="content-wrapper" >
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<!-- <script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 是否显示导航栏（登录、注册、忘记密码页面不显示）
const showNavbar = computed(() => {
  const guestRoutes = ['login', 'register', 'forgot-password']
  return !guestRoutes.includes(route.name as string)
})

// 方法
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 组件挂载时检查认证状态
onMounted(() => {
  authStore.checkAuth()
})
</script> -->

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 是否显示认证页面
const showAuthPages = computed(() => {
  const authRoutes = ['login', 'register', 'forgot-password']
  return authRoutes.includes(route.name as string)
})

// 当前路由
const currentRoute = computed(() => route.path)

// 用户信息
const userInfo = computed(() => ({
  username: authStore.currentUser?.username || '未登录',
  email: authStore.currentUser?.email || ''
}))

// 菜单折叠状态
const isCollapsed = ref(false)

// 菜单项
const menuItems = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/dashboard', icon: '📊', label: '仪表板' },
  { path: '/users', icon: '👤', label: '用户中心' },
  { path: '/settings', icon: '⚙️', label: '系统设置' }
]

// 导航方法
const navigateTo = (item: any) => {
  router.push(item.path)
}

// 用户操作
const handleUserAction = (command: string) => {
  if (!command) return
  switch (command) {
    case 'profile':
      alert('个人资料功能开发中...')
      break
    case 'settings':
      alert('系统设置功能开发中...')
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}

onMounted(() => {
  authStore.checkAuth()
  if (!authStore.isAuthenticated && !showAuthPages.value) {
    router.push('/login')
  }
})
</script>




<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

#app {
  min-height: 100vh;
}

/* 后台布局 */
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 顶部导航栏 */
.top-navbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar-left .logo {
  font-size: 20px;
  margin: 0;
  color: #333;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  color: #666;
  font-size: 14px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
}

.user-select {
  margin-left: 10px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

/* 左侧菜单栏 */
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 220px;
  background: #fff;
  border-right: 1px solid #e1e5e9;
  overflow-y: auto;
  transition: all 0.3s;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-menu {
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.menu-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.menu-item.active {
  background: #f0f5ff;
  color: #667eea;
  border-right: 3px solid #667eea;
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.sidebar.collapsed .menu-label {
  display: none;
}

/* 主内容区域 */
.main-content {
  margin-left: 220px;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  transition: margin-left 0.3s;
}

.main-content.collapsed {
  margin-left: 64px;
}

.content-wrapper {
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }
  
  .main-content {
    margin-left: 64px;
  }
  
  .menu-label {
    display: none;
  }
}
</style>

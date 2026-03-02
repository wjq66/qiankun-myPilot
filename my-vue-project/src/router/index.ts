import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/userCenter',
      name: 'userCenter',
      component: () => import('../views/MicroAppView.vue'),
      meta: { requiresAuth: true }
    },
    // {
    //   path: '/son-vue3',
    //   name: 'son-vue3',
    //   component: () => import('../views/MicroAppView.vue'),
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/task-management',
      name: 'task-management',
      component: () => import('../views/testManage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/gantt',
      name: 'gantt',
      component: () => import('../views/GanttView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/moreDataView',
      name: 'moreDataView',
      component: () => import('../views/moreDataView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查认证状态
  authStore.checkAuth()
  
  const isAuthenticated = authStore.isAuthenticated
  
  // 如果路由需要认证但用户未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // 如果路由需要游客状态但用户已登录
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router

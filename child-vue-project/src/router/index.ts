// src/router/index.ts - 路由配置

import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper"

const router = createRouter({
  // 在 qiankun 环境使用 hash 模式，独立运行时使用 history 模式
  // base 路径需要与主应用的 activeRule 匹配
  history: qiankunWindow.__POWERED_BY_QIANKUN__ 
    ? createWebHashHistory('/son-vue3/') 
    : createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('@/views/UserManagement/UserListView.vue')
    },
    {
      path: '/job-management',
      name: 'job-management',
      component: () => import('@/views/JobManagement/JobListView.vue')
    },
    {
      path: '/department-management',
      name: 'department-management',
      component: () => import('@/views/DepartmentManagement/DepartmentTreeView.vue')
    },
    {
      path: '/role-management',
      name: 'role-management',
      component: () => import('@/views/RoleManagement/RoleListView.vue')
    }
  ]
})

export default router
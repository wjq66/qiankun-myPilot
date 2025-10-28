# 🚀 用户中心系统实现指南

## ✅ 已完成的工作

### 1️⃣ **类型定义** ✅
- ✅ `src/types/user.ts` - 用户类型
- ✅ `src/types/job.ts` - 岗位类型
- ✅ `src/types/department.ts` - 部门类型
- ✅ `src/types/role.ts` - 角色类型
- ✅ `src/types/relation.ts` - 关联类型
- ✅ `src/types/batch.ts` - 批量操作类型

### 2️⃣ **工具函数** ✅
- ✅ `src/utils/tree.ts` - 树形结构工具
- ✅ `src/utils/api.ts` - API 工具函数

### 3️⃣ **服务层** ✅
- ✅ `src/services/mockData.ts` - 模拟数据
- ✅ `src/services/userService.ts` - 用户服务
- ✅ `src/services/jobService.ts` - 岗位服务
- ✅ `src/services/departmentService.ts` - 部门服务
- ✅ `src/services/roleService.ts` - 角色服务

---

## 📝 接下来需要做的

### **第一步：创建 Store（Pinia）**

需要创建以下 Store 文件：

#### **1. 用户 Store**
```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref('')
  
  // 获取用户列表
  const fetchUsers = async (params?: any) => {
    isLoading.value = true
    error.value = ''
    try {
      const response = await userService.getUsers(params)
      users.value = response.data.list
      return response
    } catch (e: any) {
      error.value = e.message || '获取用户列表失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  // 创建用户
  const createUser = async (userData: any) => {
    const response = await userService.createUser(userData)
    users.value.push(response.data)
    return response
  }
  
  // 更新用户
  const updateUser = async (id: number, userData: any) => {
    const response = await userService.updateUser(id, userData)
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value[index] = response.data
    }
    return response
  }
  
  // 删除用户
  const deleteUser = async (id: number) => {
    await userService.deleteUser(id)
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }
  
  // 批量操作
  const batchAssign = async (params: any) => {
    return await userService.batchAssign(params)
  }
  
  // 更新用户状态
  const updateUserStatus = async (userId: number, status: any) => {
    const response = await userService.updateUserStatus(userId, status)
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index] = response.data
    }
    return response
  }
  
  return {
    users,
    currentUser,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    batchAssign,
    updateUserStatus
  }
})
```

#### **2. 岗位 Store**
```typescript
// src/stores/job.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { jobService } from '@/services/jobService'
import type { Job } from '@/types/job'

export const useJobStore = defineStore('job', () => {
  const jobs = ref<Job[]>([])
  const isLoading = ref(false)
  
  const fetchJobs = async () => {
    isLoading.value = true
    try {
      const response = await jobService.getJobs()
      jobs.value = response.data
    } finally {
      isLoading.value = false
    }
  }
  
  const createJob = async (jobData: any) => {
    const response = await jobService.createJob(jobData)
    jobs.value.push(response.data)
  }
  
  return { jobs, isLoading, fetchJobs, createJob }
})
```

#### **3. 部门 Store**
```typescript
// src/stores/department.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { departmentService } from '@/services/departmentService'
import { buildDepartmentTree } from '@/utils/tree'
import type { Department } from '@/types/department'

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref<Department[]>([])
  const isLoading = ref(false)
  
  // 计算属性：部门树
  const departmentTree = computed(() => 
    buildDepartmentTree(departments.value)
  )
  
  const fetchDepartments = async () => {
    isLoading.value = true
    try {
      const response = await departmentService.getDepartments()
      departments.value = response.data
    } finally {
      isLoading.value = false
    }
  }
  
  return { departments, departmentTree, isLoading, fetchDepartments }
})
```

#### **4. 角色 Store**
```typescript
// src/stores/role.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { roleService } from '@/services/roleService'
import type { Role } from '@/types/role'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([])
  const isLoading = ref(false)
  
  const fetchRoles = async () => {
    isLoading.value = true
    try {
      const response = await roleService.getRoles()
      roles.value = response.data
    } finally {
      isLoading.value = false
    }
  }
  
  const createRole = async (roleData: any) => {
    const response = await roleService.createRole(roleData)
    roles.value.push(response.data)
  }
  
  return { roles, isLoading, fetchRoles, createRole }
})
```

---

### **第二步：创建页面组件**

#### **1. 用户管理页面**
```vue
<!-- src/views/UserManagement/UserListView.vue -->
<template>
  <div class="user-list-view">
    <h1>用户管理</h1>
    
    <!-- 搜索和筛选 -->
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索用户" />
      <el-button @click="handleSearch">搜索</el-button>
      <el-button @click="handleCreate">新增用户</el-button>
    </div>
    
    <!-- 用户列表 -->
    <el-table :data="userStore.users" loading={userStore.isLoading}>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="realName" label="真实姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作">
        <el-button @click="handleEdit">编辑</el-button>
        <el-button @click="handleDelete">删除</el-button>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const keyword = ref('')

const handleSearch = () => {
  userStore.fetchUsers({ keyword: keyword.value })
}

const handleCreate = () => {
  // 打开创建用户对话框
}

onMounted(() => {
  userStore.fetchUsers()
})
</script>
```

---

### **第三步：更新路由**

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/user-management'
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
```

---

## 🎯 实现优先级

### **P0（必需）**
1. ✅ 类型定义
2. ✅ 服务层
3. ⏳ Store 层
4. ⏳ 基础页面组件
5. ⏳ 路由配置

### **P1（重要）**
1. 批量操作功能
2. 部门树形展示
3. 搜索和筛选

### **P2（优化）**
1. 权限控制
2. 数据导入导出
3. 统计报表

---

## 🚀 快速启动

### **1. 创建基础 Store（从上面复制）**
创建 `src/stores/user.ts`, `job.ts`, `department.ts`, `role.ts`

### **2. 创建基础页面**
创建 `src/views/UserManagement/UserListView.vue` 等

### **3. 更新路由**
更新 `src/router/index.ts`

### **4. 测试运行**
```bash
cd child-vue-project
npm run dev
```

访问：http://localhost:5173

---

## 💡 提示

由于内容较多，建议分阶段实现：

1. **第一阶段**：完成 Store 层，确保数据流通
2. **第二阶段**：实现用户管理页面
3. **第三阶段**：实现其他管理页面
4. **第四阶段**：添加批量操作和高级功能

每一步都先确保前一步能正常工作！

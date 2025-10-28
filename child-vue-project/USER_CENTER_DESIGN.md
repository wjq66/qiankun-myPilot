# 🏢 用户中心系统设计文档

## 📋 目录
1. [需求概述](#需求概述)
2. [系统架构](#系统架构)
3. [数据模型设计](#数据模型设计)
4. [功能模块设计](#功能模块设计)
5. [技术实现方案](#技术实现方案)
6. [UI/UX 设计](#uiux-设计)
7. [开发计划](#开发计划)

---

## 📋 需求概述

### **核心需求**
1. **用户管理**：管理登录账号，支持用户状态（在职/停用/离职）
2. **岗位管理**：用户具有岗位属性，支持多岗位
3. **部门管理**：部门具有层级结构，支持无限层级
4. **角色管理**：基于 RBAC 的权限控制
5. **批量操作**：支持批量分配岗位、部门、角色
6. **属性管理**：岗位、部门、角色可以新建、删除、编辑

### **业务场景**
- 👤 新员工入职：分配部门、岗位、角色
- 🔄 员工调岗：转移部门，更新岗位
- 👋 员工离职：标记离职状态，保留历史数据
- 🎫 权限调整：批量修改用户权限

---

## 🏗️ 系统架构

### **架构图**

```
┌──────────────────────────────────────────────────────────┐
│                    用户中心系统 (child-vue-project)        │
└──────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │  用户管理  │    │  岗位管理  │    │  部门管理  │
    │  User     │    │   Job     │    │Department │
    └───────────┘    └───────────┘    └───────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                    ┌───────▼────────┐
                    │   角色管理      │
                    │     Role       │
                    └───────────────┘
```

### **三层架构**

```
┌──────────────────────────────────────┐
│         Presentation Layer            │
│   页面组件、UI交互、表单验证            │
│   (Views, Components)                  │
└────────────┬───────────────────────────┘
             │
┌────────────▼───────────────────────────┐
│         Business Logic Layer           │
│  业务逻辑、状态管理、数据处理            │
│   (Stores, Services)                   │
└────────────┬───────────────────────────┘
             │
┌────────────▼───────────────────────────┐
│         Data Access Layer              │
│   API调用、数据持久化、本地缓存          │
│   (API, localStorage, IndexedDB)        │
└─────────────────────────────────────────┘
```

---

## 📊 数据模型设计

### **实体关系图**

```
┌───────────┐    N      ┌──────────────┐     1   ┌─────┐
│   User    │ ──────<< │ User_Job     │ ────── │ Job │
│  (用户)   │          │ (用户岗位)    │         │(岗位)│
└───────────┘    N     └──────────────┘         └─────┘
    │                                                
    │ N                                              ┌─────────────┐
    │                                                │ Department  │
    │      ┌──────────────┐     1   ┌────────────── │   (部门)    │
    │ ─── │User_Depart    │ ────── │ Department    │             │
          │ (用户部门)    │         │ (部门)        │ parentId ───┘
          └──────────────┘         │               │
                                     │ treePath      │
                                     └───────────────┘
                           N      ┌──────────────┐     1   ┌──────┐
User ─────────────<< ─────────── │  User_Role   │ ──────│ Role │
                                 │  (用户角色)   │        │(角色)│
                                 └──────────────┘        └──────┘
```

### **核心字段设计**

#### **1. 用户表 (User)**
```typescript
{
  id: number                    // 主键
  username: string              // 用户名（唯一）
  email: string                // 邮箱（唯一）
  realName: string             // 真实姓名
  phone?: string               // 手机号
  avatar?: string              // 头像URL
  status: 'active' | 'inactive' | 'resigned'  // 状态
  createdAt: string            // 创建时间
  updatedAt: string           // 更新时间
}
```

#### **2. 岗位表 (Job)**
```typescript
{
  id: number
  code: string                 // 岗位编码（如：JOB001）
  name: string                 // 岗位名称
  level: number                // 岗位级别（1最低，10最高）
  description?: string         // 描述
  isSystem: boolean           // 是否系统预设
  sort: number                 // 排序
}
```

#### **3. 部门表 (Department)**
```typescript
{
  id: number
  code: string                 // 部门编码
  name: string                 // 部门名称
  parentId: number | null      // 父部门ID
  treePath: string             // 树路径（如：/1/2/3）
  level: number                // 层级深度
  managerId?: number           // 部门负责人
  description?: string         // 描述
  sort: number                 // 排序
  isSystem: boolean           // 是否系统预设
}
```

#### **4. 角色表 (Role)**
```typescript
{
  id: number
  code: string                 // 角色编码
  name: string                 // 角色名称
  permissions: string[]        // 权限列表
  description?: string         // 描述
  isSystem: boolean           // 是否系统预设
}
```

---

## 🎯 功能模块设计

### **模块1：用户管理**

#### **功能列表**
- ✅ 用户列表（搜索、筛选、分页）
- ✅ 新增用户
- ✅ 编辑用户
- ✅ 删除用户（软删除）
- ✅ 用户详情
- ✅ 分配岗位
- ✅ 分配部门
- ✅ 分配角色
- ✅ 离职操作
- ✅ 批量操作

#### **核心页面**
```
UserManagement/
├── UserListView.vue          # 用户列表
├── UserForm.vue             # 用户表单（新增/编辑）
├── UserDetail.vue           # 用户详情
├── AssignJobs.vue           # 分配岗位
├── AssignDepartments.vue    # 分配部门
├── AssignRoles.vue          # 分配角色
└── BatchOperation.vue        # 批量操作
```

### **模块2：岗位管理**

#### **功能列表**
- ✅ 岗位列表
- ✅ 新增岗位
- ✅ 编辑岗位
- ✅ 删除岗位
- ✅ 岗位详情

#### **核心页面**
```
JobManagement/
├── JobListView.vue            # 岗位列表
├── JobForm.vue              # 岗位表单
└── JobDetail.vue            # 岗位详情
```

### **模块3：部门管理**

#### **功能列表**
- ✅ 部门树形结构
- ✅ 新增部门
- ✅ 编辑部门
- ✅ 删除部门
- ✅ 移动部门
- ✅ 部门详情
- ✅ 设置负责人

#### **核心页面**
```
DepartmentManagement/
├── DepartmentTreeView.vue   # 部门树
├── DepartmentForm.vue       # 部门表单
└── DepartmentDetail.vue     # 部门详情
```

### **模块4：角色管理**

#### **功能列表**
- ✅ 角色列表
- ✅ 新增角色
- ✅ 编辑角色
- ✅ 删除角色
- ✅ 权限配置
- ✅ 角色详情

#### **核心页面**
```
RoleManagement/
├── RoleListView.vue         # 角色列表
├── RoleForm.vue            # 角色表单
├── PermissionEditor.vue    # 权限编辑器
└── RoleDetail.vue          # 角色详情
```

---

## 💻 技术实现方案

### **技术栈**
- **Vue 3** + **TypeScript**
- **Pinia** (状态管理)
- **Vue Router** (路由)
- **Element Plus** (UI框架)
- **Axios** (HTTP请求)

### **Store 设计**

#### **1. User Store**
```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  
  // 获取用户列表
  const fetchUsers = async (params?: UserQueryParams) => {}
  
  // 获取用户详情
  const getUserById = async (id: number) => {}
  
  // 创建用户
  const createUser = async (userData: CreateUserDto) => {}
  
  // 更新用户
  const updateUser = async (id: number, userData: UpdateUserDto) => {}
  
  // 删除用户
  const deleteUser = async (id: number) => {}
  
  // 批量操作
  const batchAssign = async (request: BatchAssignRequest) => {}
  
  // 离职操作
  const setUserStatus = async (userId: number, status: UserStatus) => {}
  
  return {
    users,
    currentUser,
    isLoading,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    batchAssign,
    setUserStatus
  }
})
```

#### **2. Job Store**
```typescript
// stores/job.ts
export const useJobStore = defineStore('job', () => {
  const jobs = ref<Job[]>([])
  
  const fetchJobs = async () => {}
  const createJob = async (jobData: CreateJobDto) => {}
  const updateJob = async (id: number, jobData: UpdateJobDto) => {}
  const deleteJob = async (id: number) => {}
  
  return { jobs, fetchJobs, createJob, updateJob, deleteJob }
})
```

#### **3. Department Store**
```typescript
// stores/department.ts
export const useDepartmentStore = defineStore('department', () => {
  const departments = ref<Department[]>([])
  const departmentTree = computed(() => buildTree(departments.value))
  
  const fetchDepartments = async () => {}
  const createDepartment = async (deptData: CreateDepartmentDto) => {}
  const moveDepartment = async (id: number, parentId: number) => {}
  const deleteDepartment = async (id: number) => {}
  
  // 构建树形结构
  const buildTree = (depts: Department[]): Tree[] => {}
  
  return { departments, departmentTree, fetchDepartments, createDepartment }
})
```

#### **4. Role Store**
```typescript
// stores/role.ts
export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  
  const fetchRoles = async () => {}
  const createRole = async (roleData: CreateRoleDto) => {}
  const updateRole = async (id: number, roleData: UpdateRoleDto) => {}
  const deleteRole = async (id: number) => {}
  
  // 获取所有权限
  const fetchPermissions = async () => {}
  
  return { roles, permissions, fetchRoles, createRole, updateRole }
})
```

### **Service 层设计**

```typescript
// services/userService.ts
export const userService = {
  async getUsers(params?: UserQueryParams) {
    return await api.get('/users', { params })
  },
  
  async getUserById(id: number) {
    return await api.get(`/users/${id}`)
  },
  
  async createUser(data: CreateUserDto) {
    return await api.post('/users', data)
  },
  
  async batchAssign(data: BatchAssignRequest) {
    return await api.post('/users/batch-assign', data)
  }
}
```

---

## 🎨 UI/UX 设计

### **主界面布局**

```
┌────────────────────────────────────────────────────┐
│  导航栏：用户中心                                    │
├────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────┐ │
│  │ 用户管理 │  │ 岗位管理 │  │ 部门管理 │  │ 角色 │ │
│  │ 👤      │  │ 💼      │  │ 🏢      │  │ 🎭  │ │
│  └─────────┘  └─────────┘  └─────────┘  └──────┘ │
├────────────────────────────────────────────────────┤
│  主内容区域                                         │
│                                                    │
│  [搜索框]  [筛选]  [新增]  [批量操作]  [导出]    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │  数据表格（用户列表）                        │    │
│  │                                            │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  页码：[1] [2] [3] ...                          │
└────────────────────────────────────────────────────┘
```

### **关键交互**

#### **1. 批量操作流程**
```
1. 勾选多个用户
2. 点击"批量操作"按钮
3. 弹出操作对话框：
   ┌─────────────────────────┐
   │ 批量操作                 │
   ├─────────────────────────┤
   │ ✅ 分配岗位               │
   │ ✅ 分配部门               │
   │ ✅ 分配角色               │
   │ ✅ 更改状态               │
   └─────────────────────────┘
4. 选择操作类型
5. 填写操作内容
6. 确认执行
```

#### **2. 部门树形结构**
```
技术部
├── 研发组
│   ├── 前端组
│   │   └── 前端一组
│   └── 后端组
├── 测试组
└── 运维组
```

---

## 📅 开发计划

### **Phase 1: 基础架构（1-2天）**
- [ ] 创建项目结构
- [ ] 配置开发环境
- [ ] 定义类型系统
- [ ] 设计 Store 架构
- [ ] 设置路由

### **Phase 2: 数据模型（2-3天）**
- [ ] 实现 User Store
- [ ] 实现 Job Store
- [ ] 实现 Department Store
- [ ] 实现 Role Store
- [ ] Mock 数据

### **Phase 3: 核心功能（5-7天）**
- [ ] 用户管理页面
- [ ] 岗位管理页面
- [ ] 部门管理页面
- [ ] 角色管理页面
- [ ] 批量操作功能

### **Phase 4: 高级功能（3-5天）**
- [ ] 权限控制
- [ ] 搜索和筛选
- [ ] 数据导入导出
- [ ] 操作日志
- [ ] 统计报表

### **Phase 5: 优化和完善（2-3天）**
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 测试
- [ ] 文档

---

## 🎯 核心功能演示

### **功能1：批量分配岗位**

```typescript
// 选中多个用户
const selectedUsers = [1, 2, 3, 4, 5]

// 点击"批量分配岗位"
const handleBatchAssignJobs = () => {
  // 显示对话框
  jobSelectDialog.value.open(selectedUsers)
}

// 选择岗位并确认
const confirmAssign = async (userIds: number[], jobIds: number[]) => {
  await userStore.batchAssign({
    userIds,
    jobIds,
    departmentIds: [],
    roleIds: []
  })
}
```

### **功能2：部门树形操作**

```vue
<template>
  <el-tree
    :data="departmentTree"
    node-key="id"
    :props="{ children: 'children', label: 'name' }"
    @node-click="handleNodeClick"
  >
    <template #default="{ node }">
      <span class="custom-node">
        <i class="el-icon-folder"></i>
        {{ node.label }}
        <el-dropdown @command="handleCommand">
          <el-icon><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="add">添加子部门</el-dropdown-item>
              <el-dropdown-item command="edit">编辑</el-dropdown-item>
              <el-dropdown-item command="delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </span>
    </template>
  </el-tree>
</template>
```

---

## ✅ 总结

### **设计亮点**
1. **模块化架构** - 易于维护和扩展
2. **类型安全** - TypeScript 全面覆盖
3. **响应式设计** - 适配各种设备
4. **批量操作** - 提高操作效率
5. **树形结构** - 直观的部门层级展示
6. **权限控制** - 基于 RBAC 的灵活权限

### **技术优势**
- ✅ 清晰的代码结构
- ✅ 完善的类型定义
- ✅ 统一的代码风格
- ✅ 良好的扩展性
- ✅ 优秀的用户体验

这份设计文档提供了完整的实现方案，可以直接按照文档开始开发！

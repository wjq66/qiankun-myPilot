# 📡 微前端项目接口文档

> 本文档详细列出主应用和子应用所需的所有后端接口，方便后端开发。

---

## 📋 目录

1. [主应用接口](#主应用接口)
2. [子应用接口](#子应用接口)
3. [通用响应格式](#通用响应格式)
4. [认证机制](#认证机制)

---

## 🔐 主应用接口

### **基础路径**
```
/api/auth
```

---

### **1. 用户登录**

**接口**：`POST /api/auth/login`

**请求参数**：
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

**错误响应**：
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

---

### **2. 用户注册**

**接口**：`POST /api/auth/register`

**请求参数**：
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 3,
    "username": "newuser",
    "email": "newuser@example.com"
  }
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

---

### **3. 忘记密码**

**接口**：`POST /api/auth/forgot-password`

**请求参数**：
```json
{
  "username": "admin",
  "email": "admin@example.com"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "密码重置链接已发送到您的邮箱",
  "data": null
}
```

**错误响应**：
```json
{
  "code": 404,
  "message": "用户名或邮箱不匹配",
  "data": null
}
```

---

### **4. 验证 Token（可选）**

**接口**：`GET /api/auth/verify`

**请求头**：
```
Authorization: Bearer {token}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "token有效",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

---

## 📦 子应用接口

### **基础路径**
```
/api/user-center
```

---

## 👤 用户管理接口

### **1. 获取用户列表**

**接口**：`GET /api/user-center/users`

**查询参数**：
```
keyword?: string      // 搜索关键词（用户名、真实姓名、邮箱）
status?: string       // 状态筛选（active/inactive/resigned）
page?: number         // 页码，默认 1
pageSize?: number     // 每页数量，默认 10
```

**示例**：
```
GET /api/user-center/users?keyword=admin&status=active&page=1&pageSize=10
```

**响应数据**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "realName": "管理员",
        "email": "admin@example.com",
        "phone": "13800138000",
        "status": "active",
        "createdAt": "2024-01-01 10:00:00",
        "updatedAt": "2024-01-01 10:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### **2. 获取用户详情**

**接口**：`GET /api/user-center/users/:id`

**路径参数**：
- `id`: 用户ID

**响应数据**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "status": "active",
    "jobs": [
      {
        "id": 1,
        "code": "JOB001",
        "name": "CEO"
      }
    ],
    "departments": [
      {
        "id": 1,
        "code": "DEPT001",
        "name": "总公司"
      }
    ],
    "roles": [
      {
        "id": 1,
        "code": "admin",
        "name": "管理员"
      }
    ],
    "createdAt": "2024-01-01 10:00:00",
    "updatedAt": "2024-01-01 10:00:00"
  }
}
```

---

### **3. 创建用户**

**接口**：`POST /api/user-center/users`

**请求参数**：
```json
{
  "username": "newuser",
  "realName": "新用户",
  "email": "newuser@example.com",
  "phone": "13800138001",
  "password": "123456",
  "status": "active"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 10,
    "username": "newuser",
    "realName": "新用户",
    "email": "newuser@example.com",
    "phone": "13800138001",
    "status": "active",
    "createdAt": "2024-01-15 10:00:00",
    "updatedAt": "2024-01-15 10:00:00"
  }
}
```

---

### **4. 更新用户**

**接口**：`PUT /api/user-center/users/:id`

**路径参数**：
- `id`: 用户ID

**请求参数**：
```json
{
  "realName": "更新后的姓名",
  "email": "updated@example.com",
  "phone": "13800138002",
  "status": "active"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "更新后的姓名",
    "email": "updated@example.com",
    "phone": "13800138002",
    "status": "active",
    "updatedAt": "2024-01-15 11:00:00"
  }
}
```

---

### **5. 删除用户**

**接口**：`DELETE /api/user-center/users/:id`

**路径参数**：
- `id`: 用户ID

**响应数据**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "success": true
  }
}
```

---

### **6. 批量操作（分配岗位/部门/角色）**

**接口**：`POST /api/user-center/users/batch-assign`

**请求参数**：
```json
{
  "userIds": [1, 2, 3],
  "jobIds": [1, 2],           // 可选，批量分配岗位
  "departmentIds": [1, 3],    // 可选，批量分配部门
  "roleIds": [1]               // 可选，批量分配角色
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "批量操作成功",
  "data": {
    "success": 3,
    "failed": 0,
    "errors": []
  }
}
```

**部分失败示例**：
```json
{
  "code": 200,
  "message": "部分操作成功",
  "data": {
    "success": 2,
    "failed": 1,
    "errors": [
      {
        "userId": 3,
        "message": "用户不存在"
      }
    ]
  }
}
```

---

### **7. 更新用户状态**

**接口**：`PATCH /api/user-center/users/:id/status`

**路径参数**：
- `id`: 用户ID

**请求参数**：
```json
{
  "status": "inactive"  // active | inactive | resigned
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "id": 1,
    "status": "inactive",
    "updatedAt": "2024-01-15 12:00:00"
  }
}
```

---

## 💼 岗位管理接口

### **1. 获取岗位列表**

**接口**：`GET /api/user-center/jobs`

**响应数据**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "code": "JOB001",
      "name": "CEO",
      "description": "首席执行官",
      "level": 1,
      "createdAt": "2024-01-01 10:00:00",
      "updatedAt": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### **2. 创建岗位**

**接口**：`POST /api/user-center/jobs`

**请求参数**：
```json
{
  "code": "JOB002",
  "name": "CTO",
  "description": "首席技术官",
  "level": 1
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 2,
    "code": "JOB002",
    "name": "CTO",
    "description": "首席技术官",
    "level": 1,
    "createdAt": "2024-01-15 10:00:00",
    "updatedAt": "2024-01-15 10:00:00"
  }
}
```

---

### **3. 更新岗位**

**接口**：`PUT /api/user-center/jobs/:id`

**路径参数**：
- `id`: 岗位ID

**请求参数**：
```json
{
  "name": "更新后的岗位名称",
  "description": "更新后的描述",
  "level": 2
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "code": "JOB001",
    "name": "更新后的岗位名称",
    "description": "更新后的描述",
    "level": 2,
    "updatedAt": "2024-01-15 11:00:00"
  }
}
```

---

### **4. 删除岗位**

**接口**：`DELETE /api/user-center/jobs/:id`

**路径参数**：
- `id`: 岗位ID

**响应数据**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "success": true
  }
}
```

---

## 🏢 部门管理接口

### **1. 获取部门列表（树形结构）**

**接口**：`GET /api/user-center/departments`

**查询参数**：
```
tree?: boolean  // 是否返回树形结构，默认 true
```

**响应数据**（树形结构）：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "code": "DEPT001",
      "name": "总公司",
      "parentId": null,
      "level": 1,
      "treePath": "/1",
      "children": [
        {
          "id": 2,
          "code": "DEPT002",
          "name": "技术部",
          "parentId": 1,
          "level": 2,
          "treePath": "/1/2",
          "children": []
        }
      ],
      "createdAt": "2024-01-01 10:00:00",
      "updatedAt": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### **2. 创建部门**

**接口**：`POST /api/user-center/departments`

**请求参数**：
```json
{
  "code": "DEPT003",
  "name": "市场部",
  "parentId": 1  // 可选，父部门ID，null表示顶级部门
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 3,
    "code": "DEPT003",
    "name": "市场部",
    "parentId": 1,
    "level": 2,
    "treePath": "/1/3",
    "createdAt": "2024-01-15 10:00:00",
    "updatedAt": "2024-01-15 10:00:00"
  }
}
```

---

### **3. 更新部门**

**接口**：`PUT /api/user-center/departments/:id`

**路径参数**：
- `id`: 部门ID

**请求参数**：
```json
{
  "name": "更新后的部门名称",
  "code": "DEPT003"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 3,
    "code": "DEPT003",
    "name": "更新后的部门名称",
    "parentId": 1,
    "level": 2,
    "treePath": "/1/3",
    "updatedAt": "2024-01-15 11:00:00"
  }
}
```

---

### **4. 删除部门**

**接口**：`DELETE /api/user-center/departments/:id`

**路径参数**：
- `id`: 部门ID

**错误响应**（有子部门时）：
```json
{
  "code": 400,
  "message": "该部门下还有子部门，无法删除",
  "data": null
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "success": true
  }
}
```

---

### **5. 移动部门**

**接口**：`PATCH /api/user-center/departments/:id/move`

**路径参数**：
- `id`: 部门ID

**请求参数**：
```json
{
  "parentId": 2  // 新的父部门ID，null表示移动到顶级
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "移动成功",
  "data": {
    "id": 3,
    "code": "DEPT003",
    "name": "市场部",
    "parentId": 2,
    "level": 3,
    "treePath": "/1/2/3",
    "updatedAt": "2024-01-15 12:00:00"
  }
}
```

---

## 🎭 角色管理接口

### **1. 获取角色列表**

**接口**：`GET /api/user-center/roles`

**响应数据**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "code": "admin",
      "name": "管理员",
      "description": "系统管理员",
      "isSystem": true,
      "createdAt": "2024-01-01 10:00:00",
      "updatedAt": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### **2. 创建角色**

**接口**：`POST /api/user-center/roles`

**请求参数**：
```json
{
  "code": "editor",
  "name": "编辑",
  "description": "内容编辑角色"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 2,
    "code": "editor",
    "name": "编辑",
    "description": "内容编辑角色",
    "isSystem": false,
    "createdAt": "2024-01-15 10:00:00",
    "updatedAt": "2024-01-15 10:00:00"
  }
}
```

---

### **3. 更新角色**

**接口**：`PUT /api/user-center/roles/:id`

**路径参数**：
- `id`: 角色ID

**请求参数**：
```json
{
  "name": "更新后的角色名称",
  "description": "更新后的描述"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "code": "admin",
    "name": "更新后的角色名称",
    "description": "更新后的描述",
    "isSystem": true,
    "updatedAt": "2024-01-15 11:00:00"
  }
}
```

---

### **4. 删除角色**

**接口**：`DELETE /api/user-center/roles/:id`

**路径参数**：
- `id`: 角色ID

**错误响应**（系统角色无法删除）：
```json
{
  "code": 400,
  "message": "系统预设角色无法删除",
  "data": null
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "success": true
  }
}
```

---

## 📝 通用响应格式

### **成功响应**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### **错误响应**

```json
{
  "code": 400,  // 400: 参数错误, 401: 未授权, 403: 无权限, 404: 资源不存在, 500: 服务器错误
  "message": "错误信息",
  "data": null
}
```

### **HTTP 状态码**

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（token无效或过期） |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 🔒 认证机制

### **请求头**

所有子应用的接口都需要在请求头中携带认证信息：

```
Authorization: Bearer {token}
X-User-Id: {userId}
X-Username: {username}
```

### **Token 格式**

JWT Token，示例：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4ifQ.xxx
```

### **Token 过期处理**

当 token 过期或无效时，返回 401，前端应跳转到登录页。

---

## 📊 接口汇总表

### **主应用接口（3个）**

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 登录 | POST | `/api/auth/login` | 用户登录 |
| 注册 | POST | `/api/auth/register` | 用户注册 |
| 忘记密码 | POST | `/api/auth/forgot-password` | 忘记密码 |

### **子应用接口（20个）**

#### **用户管理（7个）**
- `GET /api/user-center/users` - 获取用户列表
- `GET /api/user-center/users/:id` - 获取用户详情
- `POST /api/user-center/users` - 创建用户
- `PUT /api/user-center/users/:id` - 更新用户
- `DELETE /api/user-center/users/:id` - 删除用户
- `POST /api/user-center/users/batch-assign` - 批量操作
- `PATCH /api/user-center/users/:id/status` - 更新用户状态

#### **岗位管理（4个）**
- `GET /api/user-center/jobs` - 获取岗位列表
- `POST /api/user-center/jobs` - 创建岗位
- `PUT /api/user-center/jobs/:id` - 更新岗位
- `DELETE /api/user-center/jobs/:id` - 删除岗位

#### **部门管理（5个）**
- `GET /api/user-center/departments` - 获取部门列表
- `POST /api/user-center/departments` - 创建部门
- `PUT /api/user-center/departments/:id` - 更新部门
- `DELETE /api/user-center/departments/:id` - 删除部门
- `PATCH /api/user-center/departments/:id/move` - 移动部门

#### **角色管理（4个）**
- `GET /api/user-center/roles` - 获取角色列表
- `POST /api/user-center/roles` - 创建角色
- `PUT /api/user-center/roles/:id` - 更新角色
- `DELETE /api/user-center/roles/:id` - 删除角色

---

## ✅ 开发建议

### **1. 数据库设计**

建议的表结构：
- `users` - 用户表
- `jobs` - 岗位表
- `departments` - 部门表（支持层级）
- `roles` - 角色表
- `user_jobs` - 用户-岗位关联表（多对多）
- `user_departments` - 用户-部门关联表（多对多）
- `user_roles` - 用户-角色关联表（多对多）

### **2. 权限控制**

- 所有接口都需要验证 token
- 根据角色控制操作权限
- 记录操作日志（谁在什么时候做了什么）

### **3. 数据验证**

- 用户名、邮箱唯一性验证
- 密码强度验证
- 删除前检查关联关系（如有子部门的部门不能删除）

### **4. 性能优化**

- 用户列表使用分页
- 部门列表使用树形结构缓存
- 批量操作使用事务

---

## 🎯 总结

- **主应用**：3个接口（登录、注册、忘记密码）
- **子应用**：20个接口（用户7个、岗位4个、部门5个、角色4个）
- **总计**：23个接口

所有接口需要统一的响应格式和错误处理，建议使用统一的中间件处理认证和权限验证。

---

**🚀 开始开发后端接口吧！**

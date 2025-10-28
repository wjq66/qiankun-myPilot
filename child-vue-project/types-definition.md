// types/user.ts
export interface User {
  id: number
  username: string
  email: string
  password: string
  realName: string
  phone?: string
  avatar?: string
  status: 'active' | 'inactive' | 'resigned'  // 状态：在职/停用/离职
  createdAt: string
  updatedAt: string
}

export interface UserWithRelations extends User {
  jobs: Job[]           // 用户的岗位列表
  departments: Department[]  // 用户的部门列表
  roles: Role[]         // 用户的角色列表
}

// types/job.ts
export interface Job {
  id: number
  code: string          // 岗位编码
  name: string          // 岗位名称
  description?: string   // 岗位描述
  level: number         // 岗位级别（1-10）
  isSystem: boolean      // 是否系统预设岗位
  sort: number          // 排序
  createdAt: string
  updatedAt: string
}

// types/department.ts
export interface Department {
  id: number
  code: string          // 部门编码
  name: string          // 部门名称
  parentId: number | null  // 父部门ID（null表示顶级部门）
  treePath: string      // 树路径（如：/1/2/3）
  level: number         // 部门层级
  description?: string   // 部门描述
  managerId?: number     // 部门负责人ID
  sort: number          // 排序
  isSystem: boolean      // 是否系统预设部门
  createdAt: string
  updatedAt: string
  
  // 关联数据
  children?: Department[]  // 子部门
  parent?: Department      // 父部门
}

// types/role.ts
export interface Role {
  id: number
  code: string          // 角色编码
  name: string          // 角色名称
  description?: string   // 角色描述
  permissions: string[]  // 权限列表
  isSystem: boolean      // 是否系统预设角色
  createdAt: string
  updatedAt: string
}

// 系统预设角色
export enum SystemRoles {
  SUPER_ADMIN = 'super_admin',    // 超级管理员
  ADMIN = 'admin',               // 普通管理员
  USER = 'user',                 // 普通用户
  VIEWER = 'viewer'              // 只读用户
}

// types/relation.ts
// 用户-岗位关联
export interface UserJob {
  id: number
  userId: number
  jobId: number
  isPrimary: boolean      // 是否主岗位
  createdAt: string
}

// 用户-部门关联
export interface UserDepartment {
  id: number
  userId: number
  departmentId: number
  isPrimary: boolean      // 是否主部门
  createdAt: string
}

// 用户-角色关联
export interface UserRole {
  id: number
  userId: number
  roleId: number
  createdAt: string
}

// types/batch.ts
// 批量操作
export interface BatchAssignRequest {
  userIds: number[]
  jobIds?: number[]
  departmentIds?: number[]
  roleIds?: number[]
}

export interface BatchOperationResult {
  success: number
  failed: number
  errors: Array<{ userId: number; message: string }>
}

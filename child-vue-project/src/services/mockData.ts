// src/services/mockData.ts - 模拟数据

import type { User } from '@/types/user'
import type { Job } from '@/types/job'
import type { Department } from '@/types/department'
import type { Role } from '@/types/role'
import { generateId, formatDate } from '@/utils/api'

// 模拟岗位数据
export const mockJobs: Job[] = [
  {
    id: 1,
    code: 'JOB001',
    name: 'CEO',
    description: '首席执行官',
    level: 10,
    isSystem: true,
    sort: 1,
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 2,
    code: 'JOB002',
    name: 'CTO',
    description: '首席技术官',
    level: 9,
    isSystem: true,
    sort: 2,
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 3,
    code: 'JOB003',
    name: '前端开发工程师',
    description: '负责前端开发',
    level: 5,
    isSystem: true,
    sort: 3,
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 4,
    code: 'JOB004',
    name: '后端开发工程师',
    description: '负责后端开发',
    level: 5,
    isSystem: true,
    sort: 4,
    createdAt: formatDate(),
    updatedAt: formatDate()
  }
]

// 模拟部门数据
export const mockDepartments: Department[] = [
  {
    id: 1,
    code: 'DEPT001',
    name: '总公司',
    parentId: null,
    treePath: '/1',
    level: 1,
    description: '总公司',
    sort: 1,
    isSystem: true,
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 2,
    code: 'DEPT002',
    name: '技术部',
    parentId: 1,
    treePath: '/1/2',
    level: 2,
    description: '技术部',
    sort: 1,
    isSystem: true,
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 3,
    code: 'DEPT003',
    name: '研发组',
    parentId: 2,
    treePath: '/1/2/3',
    level: 3,
    description: '研发组',
    sort: 1,
    isSystem: true,
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 4,
    code: 'DEPT004',
    name: '前端组',
    parentId: 3,
    treePath: '/1/2/3/4',
    level: 4,
    description: '前端组',
    sort: 1,
    isSystem: true,
    createdAt: formatDate(),
    updatedAt: formatDate()
  }
]

// 模拟角色数据
export const mockRoles: Role[] = [
  {
    id: 1,
    code: 'super_admin',
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: [
      'user:view', 'user:create', 'user:edit', 'user:delete',
      'department:view', 'department:manage',
      'job:view', 'job:manage',
      'role:view', 'role:manage'
    ],
    isSystem: true,
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 2,
    code: 'admin',
    name: '普通管理员',
    description: '拥有大部分权限',
    permissions: [
      'user:view', 'user:create', 'user:edit',
      'department:view',
      'job:view'
    ],
    isSystem: true,
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 3,
    code: 'user',
    name: '普通用户',
    description: '基础权限',
    permissions: ['user:view'],
    isSystem: true,
    createdAt: formatDate(),
    updatedAt: formatDate()
  }
]

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: '123456',
    realName: '超级管理员',
    phone: '13800138000',
    status: 'active',
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 2,
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    password: '123456',
    realName: '张三',
    phone: '13800138001',
    status: 'active',
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 3,
    username: 'lisi',
    email: 'lisi@example.com',
    password: '123456',
    realName: '李四',
    phone: '13800138002',
    status: 'active',
    createdAt: formatDate(),
    updatedAt: formatDate()
  }
]

// 模拟关联数据
export const mockUserJobs: Map<number, number[]> = new Map([
  [1, [1]], // admin 有 CEO 岗位
  [2, [3]], // zhangsan 有前端开发岗位
  [3, [4]]  // lisi 有后端开发岗位
])

export const mockUserDepartments: Map<number, number[]> = new Map([
  [1, [1]], // admin 在总公司
  [2, [4]], // zhangsan 在前端组
  [3, [4]]  // lisi 在前端组
])

export const mockUserRoles: Map<number, number[]> = new Map([
  [1, [1]], // admin 是超级管理员
  [2, [2]], // zhangsan 是普通管理员
  [3, [3]]  // lisi 是普通用户
])

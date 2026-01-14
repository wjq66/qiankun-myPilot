// src/services/mockData.ts - 任务模拟数据

import type { Task } from '@/types/task'
import { formatDate } from '@/utils/api'

// 模拟任务数据
export const mockTasks: Task[] = [
  {
    id: 1,
    title: '完成用户管理模块开发',
    description: '实现用户的增删改查功能，包括表单验证和权限控制',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 2,
    assigneeName: '张三',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['前端', 'Vue3', '重要'],
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 2,
    title: '优化数据库查询性能',
    description: '对用户列表查询进行索引优化，提升查询速度',
    status: 'todo',
    priority: 'medium',
    assigneeId: 3,
    assigneeName: '李四',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['后端', '数据库'],
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 3,
    title: '编写 API 文档',
    description: '为所有接口编写详细的 API 文档，包括请求参数和响应格式',
    status: 'review',
    priority: 'low',
    assigneeId: 2,
    assigneeName: '张三',
    tags: ['文档'],
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 4,
    title: '修复登录页面样式问题',
    description: '修复移动端登录页面的样式适配问题',
    status: 'done',
    priority: 'medium',
    assigneeId: 2,
    assigneeName: '张三',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['前端', '样式'],
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 5,
    title: '实现任务看板功能',
    description: '使用 Vue3 开发一个完整的任务管理看板，支持拖拽排序和状态切换',
    status: 'todo',
    priority: 'urgent',
    assigneeId: 1,
    assigneeName: '超级管理员',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['前端', 'Vue3', '紧急'],
    createdAt: formatDate(),
    updatedAt: formatDate()
  },
  {
    id: 6,
    title: '代码审查：用户管理模块',
    description: '对用户管理模块的代码进行审查，确保代码质量和规范',
    status: 'review',
    priority: 'high',
    assigneeId: 1,
    assigneeName: '超级管理员',
    tags: ['代码审查'],
    createdAt: formatDate(),
    updatedAt: formatDate()
  }
]

// src/services/userService.ts

import type { User, UserWithRelations } from '@/types/user'
import { mockUsers, mockUserJobs, mockUserDepartments, mockUserRoles } from './mockData'
import { mockApi, generateId, formatDate } from '@/utils/api'

/**
 * 用户服务
 */
class UserService {
  // 获取用户列表
  async getUsers(params?: { 
    keyword?: string
    status?: string
    page?: number
    pageSize?: number
  }) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let users = [...mockUsers]
    
    // 搜索
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      users = users.filter(u => 
        u.username.toLowerCase().includes(keyword) ||
        u.realName.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
      )
    }
    
    // 筛选状态
    if (params?.status) {
      users = users.filter(u => u.status === params.status)
    }
    
    return mockApi({
      list: users,
      total: users.length
    })
  }
  
  // 获取用户详情（包含关联数据）
  async getUserById(id: number) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const user = mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    // 模拟获取关联数据
    const userWithRelations: UserWithRelations = {
      ...user,
      jobs: mockUserJobs.get(id)?.map(() => ({ id: 1, code: 'JOB001', name: 'CEO' } as any)) || [],
      departments: mockUserDepartments.get(id)?.map(() => ({ id: 1, code: 'DEPT001', name: '总公司' } as any)) || [],
      roles: mockUserRoles.get(id)?.map(() => ({ id: 1, code: 'admin', name: '管理员' } as any)) || []
    }
    
    return mockApi(userWithRelations)
  }
  
  // 创建用户
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newUser: User = {
      id: generateId(),
      ...userData,
      createdAt: formatDate(),
      updatedAt: formatDate()
    }
    
    mockUsers.push(newUser)
    return mockApi(newUser)
  }
  
  // 更新用户
  async updateUser(id: number, userData: Partial<User>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error('用户不存在')
    }
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...userData,
      updatedAt: formatDate()
    }
    
    return mockApi(mockUsers[index])
  }
  
  // 删除用户
  async deleteUser(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error('用户不存在')
    }
    
    mockUsers.splice(index, 1)
    return mockApi({ success: true })
  }
  
  // 批量操作
  async batchAssign(params: {
    userIds: number[]
    jobIds?: number[]
    departmentIds?: number[]
    roleIds?: number[]
  }) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const errors: Array<{ userId: number; message: string }> = []
    
    params.userIds.forEach(userId => {
      if (params.jobIds?.length) {
        mockUserJobs.set(userId, params.jobIds)
      }
      if (params.departmentIds?.length) {
        mockUserDepartments.set(userId, params.departmentIds)
      }
      if (params.roleIds?.length) {
        mockUserRoles.set(userId, params.roleIds)
      }
    })
    
    return mockApi({
      success: params.userIds.length - errors.length,
      failed: errors.length,
      errors
    })
  }
  
  // 更新用户状态
  async updateUserStatus(userId: number, status: 'active' | 'inactive' | 'resigned') {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    user.status = status
    user.updatedAt = formatDate()
    
    return mockApi(user)
  }
}

export const userService = new UserService()

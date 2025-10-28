// src/services/roleService.ts

import type { Role } from '@/types/role'
import { mockRoles } from './mockData'
import { mockApi, generateId, formatDate } from '@/utils/api'

class RoleService {
  // 获取角色列表
  async getRoles() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockApi([...mockRoles])
  }
  
  // 创建角色
  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newRole: Role = {
      id: generateId(),
      ...roleData,
      createdAt: formatDate(),
      updatedAt: formatDate()
    }
    
    mockRoles.push(newRole)
    return mockApi(newRole)
  }
  
  // 更新角色
  async updateRole(id: number, roleData: Partial<Role>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockRoles.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error('角色不存在')
    }
    
    mockRoles[index] = {
      ...mockRoles[index],
      ...roleData,
      updatedAt: formatDate()
    }
    
    return mockApi(mockRoles[index])
  }
  
  // 删除角色
  async deleteRole(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const role = mockRoles.find(r => r.id === id)
    if (!role) {
      throw new Error('角色不存在')
    }
    
    if (role.isSystem) {
      throw new Error('系统预设角色无法删除')
    }
    
    const index = mockRoles.findIndex(r => r.id === id)
    mockRoles.splice(index, 1)
    
    return mockApi({ success: true })
  }
}

export const roleService = new RoleService()

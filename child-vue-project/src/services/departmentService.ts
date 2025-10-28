// src/services/departmentService.ts

import type { Department } from '@/types/department'
import { mockDepartments } from './mockData'
import { mockApi, generateId, formatDate } from '@/utils/api'

class DepartmentService {
  // 获取部门列表
  async getDepartments() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockApi([...mockDepartments])
  }
  
  // 创建部门
  async createDepartment(deptData: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 计算 level 和 treePath
    let level = 1
    let treePath = '/' + generateId()
    
    if (deptData.parentId) {
      const parent = mockDepartments.find(d => d.id === deptData.parentId)
      if (parent) {
        level = parent.level + 1
        treePath = parent.treePath + `/${generateId()}`
      }
    }
    
    const newDept: Department = {
      id: generateId(),
      ...deptData,
      level,
      treePath,
      createdAt: formatDate(),
      updatedAt: formatDate()
    }
    
    mockDepartments.push(newDept)
    return mockApi(newDept)
  }
  
  // 更新部门
  async updateDepartment(id: number, deptData: Partial<Department>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockDepartments.findIndex(d => d.id === id)
    if (index === -1) {
      throw new Error('部门不存在')
    }
    
    mockDepartments[index] = {
      ...mockDepartments[index],
      ...deptData,
      updatedAt: formatDate()
    }
    
    return mockApi(mockDepartments[index])
  }
  
  // 删除部门
  async deleteDepartment(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockDepartments.findIndex(d => d.id === id)
    if (index === -1) {
      throw new Error('部门不存在')
    }
    
    // 检查是否有子部门
    const hasChildren = mockDepartments.some(d => d.parentId === id)
    if (hasChildren) {
      throw new Error('该部门下还有子部门，无法删除')
    }
    
    mockDepartments.splice(index, 1)
    return mockApi({ success: true })
  }
  
  // 移动部门
  async moveDepartment(id: number, parentId: number | null) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const dept = mockDepartments.find(d => d.id === id)
    if (!dept) {
      throw new Error('部门不存在')
    }
    
    // 更新 parentId 并重新计算 level 和 treePath
    dept.parentId = parentId
    
    if (parentId === null) {
      dept.level = 1
      dept.treePath = '/' + id
    } else {
      const parent = mockDepartments.find(d => d.id === parentId)
      if (parent) {
        dept.level = parent.level + 1
        dept.treePath = parent.treePath + '/' + id
      }
    }
    
    dept.updatedAt = formatDate()
    
    return mockApi(dept)
  }
}

export const departmentService = new DepartmentService()

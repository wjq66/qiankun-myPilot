// src/stores/user.ts - 用户管理 Store

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'
import type { User, UserWithRelations } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref('')
  
  // 获取用户列表
  const fetchUsers = async (params?: { 
    keyword?: string
    status?: string
    page?: number
    pageSize?: number
  }) => {
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
  
  // 获取用户详情（包含关联数据）
  const getUserById = async (id: number) => {
    isLoading.value = true
    try {
      const response = await userService.getUserById(id)
      currentUser.value = response.data
      return response
    } catch (e: any) {
      error.value = e.message || '获取用户详情失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  // 创建用户
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    isLoading.value = true
    try {
      const response = await userService.createUser(userData)
      users.value.push(response.data)
      return response
    } catch (e: any) {
      error.value = e.message || '创建用户失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  // 更新用户
  const updateUser = async (id: number, userData: Partial<User>) => {
    isLoading.value = true
    try {
      const response = await userService.updateUser(id, userData)
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      return response
    } catch (e: any) {
      error.value = e.message || '更新用户失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  // 删除用户
  const deleteUser = async (id: number) => {
    isLoading.value = true
    try {
      await userService.deleteUser(id)
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value.splice(index, 1)
      }
    } catch (e: any) {
      error.value = e.message || '删除用户失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  // 批量操作
  const batchAssign = async (params: {
    userIds: number[]
    jobIds?: number[]
    departmentIds?: number[]
    roleIds?: number[]
  }) => {
    isLoading.value = true
    try {
      const response = await userService.batchAssign(params)
      // 刷新用户列表
      await fetchUsers()
      return response
    } catch (e: any) {
      error.value = e.message || '批量操作失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  // 更新用户状态
  const updateUserStatus = async (userId: number, status: 'active' | 'inactive' | 'resigned') => {
    isLoading.value = true
    try {
      const response = await userService.updateUserStatus(userId, status)
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = response.data
      }
      return response
    } catch (e: any) {
      error.value = e.message || '更新用户状态失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  // 清除错误
  const clearError = () => {
    error.value = ''
  }
  
  return {
    users,
    currentUser,
    isLoading,
    error,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    batchAssign,
    updateUserStatus,
    clearError
  }
})

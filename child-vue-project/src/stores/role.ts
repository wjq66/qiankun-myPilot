// src/stores/role.ts - 角色管理 Store

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { roleService } from '@/services/roleService'
import type { Role } from '@/types/role'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([])
  const isLoading = ref(false)
  const error = ref('')
  
  const fetchRoles = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const response = await roleService.getRoles()
      roles.value = response.data
    } catch (e: any) {
      error.value = e.message || '获取角色列表失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const createRole = async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    isLoading.value = true
    try {
      const response = await roleService.createRole(roleData)
      roles.value.push(response.data)
      return response
    } catch (e: any) {
      error.value = e.message || '创建角色失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const updateRole = async (id: number, roleData: Partial<Role>) => {
    isLoading.value = true
    try {
      const response = await roleService.updateRole(id, roleData)
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value[index] = response.data
      }
      return response
    } catch (e: any) {
      error.value = e.message || '更新角色失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const deleteRole = async (id: number) => {
    isLoading.value = true
    try {
      await roleService.deleteRole(id)
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value.splice(index, 1)
      }
    } catch (e: any) {
      error.value = e.message || '删除角色失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const clearError = () => {
    error.value = ''
  }
  
  return {
    roles,
    isLoading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    clearError
  }
})

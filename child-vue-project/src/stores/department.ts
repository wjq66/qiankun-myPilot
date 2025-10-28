// src/stores/department.ts - 部门管理 Store

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { departmentService } from '@/services/departmentService'
import { buildDepartmentTree } from '@/utils/tree'
import type { Department } from '@/types/department'

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref<Department[]>([])
  const isLoading = ref(false)
  const error = ref('')
  
  // 计算属性：部门树
  const departmentTree = computed(() => 
    buildDepartmentTree(departments.value)
  )
  
  const fetchDepartments = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const response = await departmentService.getDepartments()
      departments.value = response.data
    } catch (e: any) {
      error.value = e.message || '获取部门列表失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const createDepartment = async (deptData: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'level' | 'treePath'>) => {
    isLoading.value = true
    try {
      const response = await departmentService.createDepartment(deptData)
      departments.value.push(response.data)
      return response
    } catch (e: any) {
      error.value = e.message || '创建部门失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const updateDepartment = async (id: number, deptData: Partial<Department>) => {
    isLoading.value = true
    try {
      const response = await departmentService.updateDepartment(id, deptData)
      const index = departments.value.findIndex(d => d.id === id)
      if (index !== -1) {
        departments.value[index] = response.data
      }
      return response
    } catch (e: any) {
      error.value = e.message || '更新部门失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const deleteDepartment = async (id: number) => {
    isLoading.value = true
    try {
      await departmentService.deleteDepartment(id)
      const index = departments.value.findIndex(d => d.id === id)
      if (index !== -1) {
        departments.value.splice(index, 1)
      }
    } catch (e: any) {
      error.value = e.message || '删除部门失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const moveDepartment = async (id: number, parentId: number | null) => {
    isLoading.value = true
    try {
      const response = await departmentService.moveDepartment(id, parentId)
      // 刷新列表
      await fetchDepartments()
      return response
    } catch (e: any) {
      error.value = e.message || '移动部门失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const clearError = () => {
    error.value = ''
  }
  
  return {
    departments,
    departmentTree,
    isLoading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    moveDepartment,
    clearError
  }
})

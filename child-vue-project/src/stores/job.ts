// src/stores/job.ts - 岗位管理 Store

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { jobService } from '@/services/jobService'
import type { Job } from '@/types/job'

export const useJobStore = defineStore('job', () => {
  const jobs = ref<Job[]>([])
  const isLoading = ref(false)
  const error = ref('')
  
  const fetchJobs = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const response = await jobService.getJobs()
      jobs.value = response.data
    } catch (e: any) {
      error.value = e.message || '获取岗位列表失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const createJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    isLoading.value = true
    try {
      const response = await jobService.createJob(jobData)
      jobs.value.push(response.data)
      return response
    } catch (e: any) {
      error.value = e.message || '创建岗位失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const updateJob = async (id: number, jobData: Partial<Job>) => {
    isLoading.value = true
    try {
      const response = await jobService.updateJob(id, jobData)
      const index = jobs.value.findIndex(j => j.id === id)
      if (index !== -1) {
        jobs.value[index] = response.data
      }
      return response
    } catch (e: any) {
      error.value = e.message || '更新岗位失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const deleteJob = async (id: number) => {
    isLoading.value = true
    try {
      await jobService.deleteJob(id)
      const index = jobs.value.findIndex(j => j.id === id)
      if (index !== -1) {
        jobs.value.splice(index, 1)
      }
    } catch (e: any) {
      error.value = e.message || '删除岗位失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  const clearError = () => {
    error.value = ''
  }
  
  return {
    jobs,
    isLoading,
    error,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    clearError
  }
})

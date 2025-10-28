// src/services/jobService.ts

import type { Job } from '@/types/job'
import { mockJobs } from './mockData'
import { mockApi, generateId, formatDate } from '@/utils/api'

class JobService {
  // 获取岗位列表
  async getJobs() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockApi([...mockJobs])
  }
  
  // 创建岗位
  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newJob: Job = {
      id: generateId(),
      ...jobData,
      createdAt: formatDate(),
      updatedAt: formatDate()
    }
    
    mockJobs.push(newJob)
    return mockApi(newJob)
  }
  
  // 更新岗位
  async updateJob(id: number, jobData: Partial<Job>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockJobs.findIndex(j => j.id === id)
    if (index === -1) {
      throw new Error('岗位不存在')
    }
    
    mockJobs[index] = {
      ...mockJobs[index],
      ...jobData,
      updatedAt: formatDate()
    }
    
    return mockApi(mockJobs[index])
  }
  
  // 删除岗位
  async deleteJob(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockJobs.findIndex(j => j.id === id)
    if (index === -1) {
      throw new Error('岗位不存在')
    }
    
    mockJobs.splice(index, 1)
    return mockApi({ success: true })
  }
}

export const jobService = new JobService()

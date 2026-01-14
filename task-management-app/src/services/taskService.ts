// src/services/taskService.ts - 任务服务

import { mockApi, generateId, formatDate } from '@/utils/api'
import { mockTasks } from './mockData'
import type { Task, CreateTaskData, UpdateTaskData } from '@/types/task'

/**
 * 任务服务类
 */
class TaskService {
  /**
   * 获取所有任务
   */
  async getTasks() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockApi([...mockTasks])
  }

  /**
   * 根据ID获取任务详情
   */
  async getTaskById(id: number) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const task = mockTasks.find(t => t.id === id)
    if (!task) {
      throw new Error('任务不存在')
    }
    
    return mockApi(task)
  }

  /**
   * 创建任务
   */
  async createTask(taskData: CreateTaskData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成完整的 Task 对象（包含 id、createdAt、updatedAt）
    const newTask: Task = {
      id: generateId(),
      ...taskData,
      createdAt: formatDate(),
      updatedAt: formatDate()
    }
    
    // 添加到模拟数据中
    mockTasks.push(newTask)
    console.log('createTask', taskData)
    console.log('newTask', newTask)
    
    // 返回新创建的任务
    return mockApi(newTask)
  }

  /**
   * 更新任务
   */
  async updateTask(id: number, taskData: UpdateTaskData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockTasks.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error('任务不存在')
    }
    
    mockTasks[index] = {
      ...mockTasks[index],
      ...taskData,
      updatedAt: formatDate()
    }
    
    return mockApi(mockTasks[index])
  }

  /**
   * 删除任务
   */
  async deleteTask(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockTasks.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error('任务不存在')
    }
    
    mockTasks.splice(index, 1)
    return mockApi({ success: true })
  }

  /**
   * 批量更新任务状态
   */
  async batchUpdateStatus(ids: number[], status: Task['status']) {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const updatedTasks: Task[] = []
    ids.forEach(id => {
      const task = mockTasks.find(t => t.id === id)
      if (task) {
        task.status = status
        task.updatedAt = formatDate()
        updatedTasks.push(task)
      }
    })
    
    return mockApi(updatedTasks)
  }
}

export const taskService = new TaskService()

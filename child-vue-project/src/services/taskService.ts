
import {mockApi, generateId, formatDate} from "@/utils/api"
import {mockTasks} from "./mockData"
import type {CreateTaskData, UpdateTaskData, Task} from "@/types/task"
/**
 * 
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
   * 根据id获取任务详情
   */

  async createTask(taskData: CreateTaskData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newTask: Task = {
      id: generateId(),
      ...taskData,
      createdAt: formatDate(),
      updatedAt: formatDate()
    }
    
    mockTasks.push(newTask)
    return mockApi(newTask)
  }

  async updateTask(id: number, taskData: UpdateTaskData) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockApi([...mockTasks, taskData])
  }


}


export const taskService = new TaskService()
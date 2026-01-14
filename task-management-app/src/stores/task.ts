// src/stores/task.ts - 任务管理 Store

import { defineStore } from "pinia"
import type {Task, TaskStats} from "@/types/task"
import {ref, computed} from "vue"
import {taskService} from "@/services/taskService"
import type {CreateTaskData, UpdateTaskData, TaskStatus} from "@/types/task"

export const useTaskStore = defineStore('task', () => {
  // ========== 状态定义 ==========
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref('')

  // ========== 计算属性 ==========
  
  /**
   * 按状态分组的任务
   */
  const tasksByStatus = computed(() => {
    return {
      todo: tasks.value.filter(t => t.status === 'todo'),
      'in-progress': tasks.value.filter(t => t.status === 'in-progress'),
      review: tasks.value.filter(t => t.status === 'review'),
      done: tasks.value.filter(t => t.status === 'done')
    }
  })

  /**
   * 任务统计信息
   */
  const taskStats = computed<TaskStats>(() => ({
    total: tasks.value.length,
    todo: tasksByStatus.value.todo.length,
    inProgress: tasksByStatus.value['in-progress'].length,
    review: tasksByStatus.value.review.length,
    done: tasksByStatus.value.done.length
  }))

  // ========== 方法定义 ==========
  
  /**
   * 获取所有任务
   */
  const fetchTasks = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const response = await taskService.getTasks()
      tasks.value = response.data
    } catch (e: any){
      error.value = e.message || '获取任务列表失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 根据ID获取任务详情
   */
  const getTaskById = async (id: number) => {
    isLoading.value = true
    try {
      const response = await taskService.getTaskById(id)
      return response
    } catch (e: any) {
      error.value = e.message || '获取任务详情失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建任务
   */
  const createTask = async (taskData: CreateTaskData) => {
    isLoading.value = true
    try {
      const response = await taskService.createTask(taskData)
      tasks.value.push(response.data)
      return response
    } catch (e: any) {
      error.value = e.message || '创建任务失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新任务
   */
  const updateTask = async (id: number, taskData: UpdateTaskData) => {
    isLoading.value = true
    try {
      const response = await taskService.updateTask(id, taskData)
      const index = tasks.value.findIndex(t => t.id === id)
      if(index !== -1){
        tasks.value[index] = response.data
      }
      return response
    } catch (e: any){
      error.value = e.message || '更新任务失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除任务
   */
  const deleteTask = async (id: number) => {
    isLoading.value = true
    try {
      await taskService.deleteTask(id)
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
    } catch (e: any) {
      error.value = e.message || '删除任务失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新任务状态
   */
  const updateTaskStatus = async (id: number, status: TaskStatus) => {
    return updateTask(id, { status })
  }

  /**
   * 批量更新任务状态
   */
  const batchUpdateStatus = async (ids: number[], status: TaskStatus) => {
    isLoading.value = true
    try {
      const response = await taskService.batchUpdateStatus(ids, status)
      response.data.forEach(updatedTask => {
        const index = tasks.value.findIndex(t => t.id === updatedTask.id)
        if (index !== -1) {
          tasks.value[index] = updatedTask
        }
      })
      return response
    } catch (e: any) {
      error.value = e.message || '批量更新任务状态失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 清除错误信息
   */
  const clearError = () => {
    error.value = ''
  }

  return {
    // 状态
    tasks,
    isLoading,
    error,
    // 计算属性
    tasksByStatus,
    taskStats,
    // 方法
    fetchTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    batchUpdateStatus,
    clearError
  }
})


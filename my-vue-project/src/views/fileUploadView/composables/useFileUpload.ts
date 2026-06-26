// composables/useFileUpload.ts
import type { Ref } from "vue"
import type { UploadFile } from "../../../classes/uploadFile"
import { FileUploadTask } from "../../../classes/uploadFile"

/**
 * 文件上传控制 Composition
 * 
 * 为什么放在这里？
 * - 批量操作需要操作多个任务实例
 * - 需要管理任务实例的生命周期
 * - 连接 Class 和响应式状态
 */
export function useFileUpload(
  fileList: Ref<UploadFile[]>,
  onProgressUpdate?: (file: UploadFile) => void,
  options?: {
    wsUrl?: string
    uploadUrl?: string
    chunkSize?: number
    concurrent?: number
  }
) {
  // 存储每个文件的任务实例
  // 为什么用 Map？因为需要根据文件ID快速查找任务
  const tasks = new Map<string, FileUploadTask>()
  
  /**
   * 开始上传单个文件
   * @param file 上传文件对象
   */
  async function startUpload(file: UploadFile) {
    // 如果任务已存在，先清理
    if (tasks.has(file.id)) {
      const oldTask = tasks.get(file.id)!
      oldTask.cancel()
    }
    
    // 创建新的上传任务实例
    const task = new FileUploadTask(file, {
      chunkSize: options?.chunkSize,
      concurrent: options?.concurrent,
      wsUrl: options?.wsUrl,
      uploadUrl: options?.uploadUrl,
      onProgress: (progress, speed) => {
        file.progress = progress
        file.speed = speed
        if (onProgressUpdate) {
          onProgressUpdate(file)
        }
      },
      onStatusChange: (status) => {
        file.status = status
      },
      onError: (error) => {
        console.error('上传错误:', error)
        file.status = 'error'
      },
      onComplete: () => {
        console.log(`文件 ${file.name} 上传完成`)
      }
    })
    
    // 存储任务实例
    tasks.set(file.id, task)
    
    // 开始上传
    try {
      await task.start()
    } catch (error) {
      console.error('上传失败:', error)
      file.status = 'error'
    }
  }
  
  /**
   * 暂停上传
   */
  function pauseUpload(file: UploadFile) {
    const task = tasks.get(file.id)
    if (task) {
      task.pause()
    }
  }
  
  /**
   * 继续上传
   */
  async function resumeUpload(file: UploadFile) {
    const task = tasks.get(file.id)
    if (task) {
      await task.resume()
    }
  }
  
  /**
   * 重试上传
   */
  async function retryUpload(file: UploadFile) {
    // 先清理旧任务
    const task = tasks.get(file.id)
    if (task) {
      task.cancel()
      tasks.delete(file.id)
    }
    
    // 重置状态
    file.status = 'pending'
    file.progress = 0
    
    // 重新开始上传
    await startUpload(file)
  }
  
  /**
   * 取消上传
   */
  function cancelUpload(file: UploadFile) {
    const task = tasks.get(file.id)
    if (task) {
      task.cancel()
      tasks.delete(file.id)
    }
  }
  
  /**
   * 上传所有待上传的文件
   */
  async function uploadAll() {
    const pendingFiles = fileList.value.filter(file => file.status === 'pending')
    // 并发上传，但不要同时上传太多文件
    const concurrentLimit = 3
    for (let i = 0; i < pendingFiles.length; i += concurrentLimit) {
      const batch = pendingFiles.slice(i, i + concurrentLimit)
      await Promise.all(batch.map(file => startUpload(file)))
    }
  }
  
  /**
   * 暂停所有正在上传的文件
   */
  function pauseAll() {
    fileList.value.forEach(file => {
      if (file.status === 'uploading') {
        pauseUpload(file)
      }
    })
  }
  
  /**
   * 取消所有上传任务
   */
  function cancelAll() {
    tasks.forEach(task => {
      task.cancel()
    })
    tasks.clear()
  }
  
  return {
    startUpload,
    pauseUpload,
    resumeUpload,
    retryUpload,
    cancelUpload,
    uploadAll,
    pauseAll,
    cancelAll
  }
}
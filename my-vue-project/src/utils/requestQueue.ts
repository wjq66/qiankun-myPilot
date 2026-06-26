/**
 * 请求序列控制器
 * 
 * 为什么需要请求序列控制？
 * - 控制并发请求数量，避免服务器压力过大
 * - 保证请求顺序，避免竞态条件
 * - 支持请求重试和错误处理
 */

export interface QueueTask {
  id: string
  execute: () => Promise<any>
  priority?: number // 优先级，数字越大优先级越高
  retry?: number // 重试次数
  retryDelay?: number // 重试延迟（毫秒）
}

export interface QueueOptions {
  concurrent?: number // 并发数量
  retry?: number // 默认重试次数
  retryDelay?: number // 默认重试延迟
}

/**
 * 请求队列
 */
export class RequestQueue {
  private queue: QueueTask[] = []
  private running: Set<string> = new Set()
  private concurrent: number
  private defaultRetry: number
  private defaultRetryDelay: number

  constructor(options: QueueOptions = {}) {
    this.concurrent = options.concurrent || 3
    this.defaultRetry = options.retry || 3
    this.defaultRetryDelay = options.retryDelay || 1000
  }

  /**
   * 添加任务到队列
   */
  add(task: QueueTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const taskWithCallbacks = {
        ...task,
        resolve,
        reject,
        retry: task.retry ?? this.defaultRetry,
        retryDelay: task.retryDelay ?? this.defaultRetryDelay
      }

      // 按优先级插入队列
      this.insertTask(taskWithCallbacks)
      this.processQueue()
    })
  }

  /**
   * 按优先级插入任务
   */
  private insertTask(task: QueueTask & { resolve: Function; reject: Function }): void {
    const priority = task.priority || 0
    let insertIndex = this.queue.length

    for (let i = 0; i < this.queue.length; i++) {
      const currentPriority = (this.queue[i] as any).priority || 0
      if (priority > currentPriority) {
        insertIndex = i
        break
      }
    }

    this.queue.splice(insertIndex, 0, task)
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    // 如果已达到并发限制，等待
    if (this.running.size >= this.concurrent) {
      return
    }

    // 如果队列为空，返回
    if (this.queue.length === 0) {
      return
    }

    // 取出任务
    const task = this.queue.shift() as QueueTask & {
      resolve: Function
      reject: Function
      retry: number
      retryDelay: number
    }

    if (!task) {
      return
    }

    // 标记为运行中
    this.running.add(task.id)

    // 执行任务
    try {
      const result = await this.executeTask(task)
      task.resolve(result)
    } catch (error) {
      // 如果还有重试次数，重新加入队列
      if (task.retry > 0) {
        task.retry--
        setTimeout(() => {
          this.insertTask(task)
          this.processQueue()
        }, task.retryDelay)
      } else {
        task.reject(error)
      }
    } finally {
      // 从运行中移除
      this.running.delete(task.id)
      // 继续处理队列
      this.processQueue()
    }
  }

  /**
   * 执行任务
   */
  private async executeTask(
    task: QueueTask & { retry: number; retryDelay: number }
  ): Promise<any> {
    return task.execute()
  }

  /**
   * 移除任务
   */
  remove(taskId: string): void {
    const index = this.queue.findIndex(task => task.id === taskId)
    if (index !== -1) {
      this.queue.splice(index, 1)
    }
    this.running.delete(taskId)
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
    this.running.clear()
  }

  /**
   * 获取队列长度
   */
  getLength(): number {
    return this.queue.length
  }

  /**
   * 获取运行中的任务数量
   */
  getRunningCount(): number {
    return this.running.size
  }
}

// 单例模式
export const requestQueue = new RequestQueue({
  concurrent: 3, // 默认并发3个请求
  retry: 3, // 默认重试3次
  retryDelay: 1000 // 默认重试延迟1秒
})

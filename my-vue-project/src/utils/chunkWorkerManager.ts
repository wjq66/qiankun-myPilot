/**
 * Web Worker 管理器
 * 
 * 为什么需要管理器？
 * - 统一管理多个 Worker 实例
 * - 复用 Worker，避免频繁创建销毁
 * - 控制 Worker 数量，避免资源浪费
 */

import type { ChunkInfo } from '../classes/uploadFile'

export interface ChunkResult {
  chunks: ChunkInfo[]
}

export interface HashResult {
  hash: string
  chunkIndex: number
}

export interface FileHashResult {
  hash: string
}

/**
 * Web Worker 管理器
 */
export class ChunkWorkerManager {
  private workers: Worker[] = []
  private maxWorkers: number = navigator.hardwareConcurrency || 4 // CPU 核心数
  private currentWorkerIndex: number = 0

  /**
   * 获取一个 Worker 实例（轮询分配）
   */
  private getWorker(): Worker {
    if (this.workers.length < this.maxWorkers) {
      // 创建新的 Worker
      const worker = new Worker(
        new URL('./chunkWorker.ts', import.meta.url),
        { type: 'module' }
      )
      this.workers.push(worker)
      return worker
    }

    // 轮询使用现有 Worker
    const worker = this.workers[this.currentWorkerIndex]
    this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length
    return worker
  }

  /**
   * 创建文件分片（使用 Worker）
   */
  async createChunks(
    file: File,
    chunkSize: number,
    onProgress?: (progress: number) => void
  ): Promise<ChunkInfo[]> {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker()
      const totalChunks = Math.ceil(file.size / chunkSize)
      const batchSize = 50 // 每批处理50个分片
      const chunks: ChunkInfo[] = []
      let processedBatches = 0
      const totalBatches = Math.ceil(totalChunks / batchSize)

      const processBatch = (batchIndex: number) => {
        if (batchIndex >= totalBatches) {
          // 所有批次处理完成
          resolve(chunks.sort((a, b) => a.index - b.index))
          return
        }

        const startIndex = batchIndex * batchSize
        const endIndex = Math.min(startIndex + batchSize, totalChunks)

        const messageHandler = (e: MessageEvent) => {
          const { type, data } = e.data

          if (type === 'chunkResult') {
            chunks.push(...data.chunks)
            processedBatches++
            
            if (onProgress) {
              onProgress((processedBatches / totalBatches) * 100)
            }

            worker.removeEventListener('message', messageHandler)
            processBatch(batchIndex + 1)
          } else if (type === 'error') {
            worker.removeEventListener('message', messageHandler)
            reject(new Error(data.error))
          }
        }

        worker.addEventListener('message', messageHandler)

        worker.postMessage({
          type: 'chunk',
          data: {
            file,
            chunkSize,
            startIndex,
            endIndex
          }
        })
      }

      processBatch(0)
    })
  }

  /**
   * 计算分片 Hash（使用 Worker）
   */
  async calculateChunkHash(
    blob: Blob,
    chunkIndex: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker()

      const messageHandler = (e: MessageEvent) => {
        const { type, data } = e.data

        if (type === 'hashResult' && data.chunkIndex === chunkIndex) {
          worker.removeEventListener('message', messageHandler)
          resolve(data.hash)
        } else if (type === 'error' && data.chunkIndex === chunkIndex) {
          worker.removeEventListener('message', messageHandler)
          reject(new Error(data.error))
        }
      }

      worker.addEventListener('message', messageHandler)

      worker.postMessage({
        type: 'hash',
        data: { blob, chunkIndex }
      })
    })
  }

  /**
   * 计算文件 Hash（使用 Worker）
   */
  async calculateFileHash(
    file: File,
    chunkSize: number = 2 * 1024 * 1024,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker()

      const messageHandler = (e: MessageEvent) => {
        const { type, data } = e.data

        if (type === 'fileHashResult') {
          worker.removeEventListener('message', messageHandler)
          resolve(data.hash)
        } else if (type === 'fileHashProgress' && onProgress) {
          onProgress(data.progress)
        } else if (type === 'error') {
          worker.removeEventListener('message', messageHandler)
          reject(new Error(data.error))
        }
      }

      worker.addEventListener('message', messageHandler)

      worker.postMessage({
        type: 'fileHash',
        data: { file, chunkSize }
      })
    })
  }

  /**
   * 批量计算分片 Hash（并发）
   */
  async calculateChunkHashes(
    chunks: ChunkInfo[],
    concurrent: number = 3
  ): Promise<void> {
    const hashPromises: Promise<void>[] = []

    for (let i = 0; i < chunks.length; i += concurrent) {
      const batch = chunks.slice(i, i + concurrent)
      const batchPromises = batch.map(async (chunk) => {
        if (!chunk.hash) {
          chunk.hash = await this.calculateChunkHash(chunk.blob, chunk.index)
        }
      })
      hashPromises.push(...batchPromises)
      await Promise.all(batchPromises)
    }
  }

  /**
   * 销毁所有 Worker
   */
  destroy() {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.currentWorkerIndex = 0
  }
}

// 单例模式
export const chunkWorkerManager = new ChunkWorkerManager()

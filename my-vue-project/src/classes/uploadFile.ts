import { chunkWorkerManager } from '../utils/chunkWorkerManager'
import { indexedDBManager, type FileMetadata } from '../utils/indexedDB'
import { getWebSocketManager } from '../utils/websocketManager'
import { requestQueue } from '../utils/requestQueue'

export interface UploadFile {
  id: string
  name: string
  size: number
  file: File
  status: 'pending' | 'uploading' | 'paused' | 'success' | 'error'
  progress: number
  speed?: number
  chunkList?: ChunkInfo[]
  uploadedChunks?: number
  fileHash?: string // 文件hash，用于断点续传
}

export interface ChunkInfo {
  index: number
  start: number
  end: number
  blob: Blob
  hash?: string
}

// 参数的配置
export interface UploadTaskOptions {
  /** 分片大小（字节），默认 2MB */
  chunkSize?: number
  /** 并发上传数量，默认 3 */
  concurrent?: number
  /** 进度更新回调 */
  onProgress?: (progress: number, speed: number) => void
  /** 状态更新回调 */
  onStatusChange?: (status: 'pending' | 'uploading' | 'paused' | 'success' | 'error') => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 完成回调 */
  onComplete?: () => void
  /** WebSocket URL */
  wsUrl?: string
  /** 上传API地址 */
  uploadUrl?: string
}

export class FileUploadTask {
  private file: UploadFile
  /** 是否暂停 */
  private isPaused: boolean = false
  /** 是否已取消 */
  private isCancelled: boolean = false
  /** 选项配置 */
  private options: Required<Pick<UploadTaskOptions, 'chunkSize' | 'concurrent' | 'onProgress' | 'onStatusChange' | 'onError' | 'onComplete'>> & Pick<UploadTaskOptions, 'wsUrl' | 'uploadUrl'>
  /** 分片列表 */
  private chunks: ChunkInfo[] = []
  /** 已上传的分片索引集合 */
  private uploadedChunkIndices: Set<number> = new Set()
  /** 当前正在上传的分片请求 */
  private uploadingRequests: Map<number, AbortController> = new Map()
  /** 文件hash值 */
  private fileHash: string = ''
  /** 上次更新时间（用于计算上传速度） */
  private lastUpdateTime: number = Date.now()
  /** 上次已上传字节数 */
  private lastUploadedBytes: number = 0
  /** WebSocket 消息取消函数 */
  private wsUnsubscribe: (() => void) | null = null

  constructor(file: UploadFile, options: UploadTaskOptions = {}) {
    this.file = file
    // 设置默认选项
    this.options = {
      chunkSize: options.chunkSize || 2 * 1024 * 1024, // 2MB
      concurrent: options.concurrent || 3,
      onProgress: options.onProgress || (() => {}),
      onStatusChange: options.onStatusChange || (() => {}),
      onError: options.onError || (() => {}),
      onComplete: options.onComplete || (() => {}),
      wsUrl: options.wsUrl,
      uploadUrl: options.uploadUrl || '/api/upload/chunk'
    }
  }

  /**
   * 开始上传
   */
  async start(): Promise<void> {
    if (this.isCancelled) {
      throw new Error('任务已取消')
    }

    try {
      // 1. 更新状态
      this.file.status = 'uploading'
      this.options.onStatusChange('uploading')
      this.isPaused = false

      // 2. 初始化 IndexedDB
      await indexedDBManager.init()

      // 3. 检查是否有已保存的文件元数据（断点续传）
      let metadata: FileMetadata | null = null
      if (this.file.fileHash) {
        metadata = await indexedDBManager.getFileMetadataByHash(this.file.fileHash)
      }

      // 4. 如果文件hash未计算，先计算
      if (!this.file.fileHash) {
        this.fileHash = await chunkWorkerManager.calculateFileHash(
          this.file.file,
          this.options.chunkSize,
          (progress) => {
            // Hash计算进度可以在这里显示
            console.log(`计算文件Hash进度: ${progress.toFixed(1)}%`)
          }
        )
        this.file.fileHash = this.fileHash
      } else {
        this.fileHash = this.file.fileHash
      }

      // 5. 如果找到已保存的元数据，尝试恢复
      if (metadata && metadata.fileHash === this.fileHash) {
        await this.restoreFromMetadata(metadata)
      } else {
        // 6. 准备分片（使用 Web Worker）
        await this.prepareChunks()
      }

      // 7. 连接 WebSocket（如果配置了）
      if (this.options.wsUrl) {
        await this.setupWebSocket()
      }

      // 8. 检查服务器已上传的分片
      await this.checkServerUploadedChunks()

      // 9. 上传待上传的分片
      await this.uploadPendingChunks()

      // 10. 所有分片上传完成后，合并分片
      if (this.uploadedChunkIndices.size === this.chunks.length) {
        await this.mergeChunks()
        this.file.status = 'success'
        this.options.onStatusChange('success')
        
        // 清理 IndexedDB 中的数据
        await indexedDBManager.deleteChunks(this.file.id)
        await indexedDBManager.deleteFileMetadata(this.file.id)
        
        this.options.onComplete()
      }
    } catch (error) {
      if (!this.isCancelled) {
        this.file.status = 'error'
        this.options.onStatusChange('error')
        this.options.onError(error as Error)
      }
      throw error
    } finally {
      // 清理 WebSocket 订阅
      if (this.wsUnsubscribe) {
        this.wsUnsubscribe()
        this.wsUnsubscribe = null
      }
    }
  }

  /**
   * 从元数据恢复
   */
  private async restoreFromMetadata(metadata: FileMetadata): Promise<void> {
    console.log(`恢复上传: ${metadata.fileName}, 已上传 ${metadata.uploadedChunks.length}/${metadata.totalChunks} 个分片`)

    // 从 IndexedDB 加载分片
    const savedChunks = await indexedDBManager.getAllChunks(metadata.fileId)
    if (savedChunks.length > 0) {
      // 使用保存的分片
      this.chunks = savedChunks
      this.file.chunkList = this.chunks
      
      // 恢复已上传的分片索引
      this.uploadedChunkIndices = new Set(metadata.uploadedChunks)
      
      // 更新进度
      this.updateProgress()
    } else {
      // 如果没有保存的分片，重新创建
      await this.prepareChunks()
    }
  }

  /**
   * 准备分片（使用 Web Worker）
   */
  private async prepareChunks(): Promise<void> {
    console.log('开始创建分片...')
    
    // 1. 使用 Web Worker 创建分片
    this.chunks = await chunkWorkerManager.createChunks(
      this.file.file,
      this.options.chunkSize,
      (progress) => {
        console.log(`创建分片进度: ${progress.toFixed(1)}%`)
      }
    )
    this.file.chunkList = this.chunks

    // 2. 计算每个分片的hash（并发）
    console.log('开始计算分片Hash...')
    await chunkWorkerManager.calculateChunkHashes(this.chunks, this.options.concurrent)

    // 3. 保存分片到 IndexedDB
    console.log('保存分片到 IndexedDB...')
    const savePromises = this.chunks.map(chunk =>
      indexedDBManager.saveChunk(this.file.id, chunk.index, chunk.blob, chunk.hash)
    )
    await Promise.all(savePromises)

    // 4. 保存文件元数据
    const metadata: FileMetadata = {
      fileId: this.file.id,
      fileName: this.file.name,
      fileSize: this.file.size,
      fileHash: this.fileHash,
      totalChunks: this.chunks.length,
      uploadedChunks: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await indexedDBManager.saveFileMetadata(metadata)

    console.log(`分片创建完成，共 ${this.chunks.length} 个分片`)
  }

  /**
   * 设置 WebSocket
   */
  private async setupWebSocket(): Promise<void> {
    if (!this.options.wsUrl) {
      return
    }

    try {
      const wsManager = getWebSocketManager(this.options.wsUrl)
      
      // 如果未连接，先连接
      if (!wsManager.isConnected()) {
        await wsManager.connect()
      }

      // 订阅消息
      this.wsUnsubscribe = wsManager.onMessage((message) => {
        if (message.fileId === this.file.id) {
          this.handleWebSocketMessage(message)
        }
      })
    } catch (error) {
      console.warn('WebSocket连接失败，将使用HTTP轮询:', error)
    }
  }

  /**
   * 处理 WebSocket 消息
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'chunkUploaded':
        // 服务器确认分片已上传
        if (message.chunkIndex !== undefined) {
          this.uploadedChunkIndices.add(message.chunkIndex)
          this.updateProgress()
          this.updateMetadata()
        }
        break
      case 'progress':
        // 服务器推送的进度更新
        if (message.progress !== undefined) {
          this.file.progress = message.progress
          this.options.onProgress(message.progress, this.file.speed || 0)
        }
        break
      case 'mergeComplete':
        // 合并完成
        this.file.status = 'success'
        this.options.onStatusChange('success')
        this.options.onComplete()
        break
      case 'error':
        // 服务器错误
        this.file.status = 'error'
        this.options.onStatusChange('error')
        this.options.onError(new Error(message.error || '服务器错误'))
        break
    }
  }

  /**
   * 检查服务器已上传的分片
   */
  private async checkServerUploadedChunks(): Promise<void> {
    try {
      // TODO: 调用服务器API检查已上传的分片
      console.log(this.fileHash)
      const response = await fetch(`/api/upload/check?fileHash=${this.fileHash}`)
      const { uploadedChunks } = await response.json()
      this.uploadedChunkIndices = new Set(uploadedChunks)
      
      // 临时实现：假设没有已上传的分片
      // 实际应该调用服务器API
    } catch (error) {
      console.warn('检查服务器分片失败:', error)
      // 继续上传，不影响流程
    }
  }

  /**
   * 上传待上传的分片
   */
  private async uploadPendingChunks(): Promise<void> {
    // 找出未上传的分片
    const pendingChunks = this.chunks.filter(
      (_, index) => !this.uploadedChunkIndices.has(index)
    )

    if (pendingChunks.length === 0) {
      return
    }

    // 使用请求队列上传分片
    const uploadPromises = pendingChunks.map(chunk =>
      requestQueue.add({
        id: `${this.file.id}_${chunk.index}`,
        execute: () => this.uploadChunk(chunk),
        priority: 0
      })
    )

    await Promise.all(uploadPromises)
  }

  /**
   * 上传单个分片
   */
  private async uploadChunk(chunk: ChunkInfo): Promise<void> {
    // 检查是否已暂停或取消
    if (this.isPaused || this.isCancelled) {
      return
    }

    // 如果分片已上传，跳过
    if (this.uploadedChunkIndices.has(chunk.index)) {
      return
    }

    // 创建 AbortController
    const abortController = new AbortController()
    this.uploadingRequests.set(chunk.index, abortController)

    try {
      // 从 IndexedDB 获取分片（如果存在）
      let blob = chunk.blob
      const savedBlob = await indexedDBManager.getChunk(this.file.id, chunk.index)
      if (savedBlob) {
        blob = savedBlob
      }

      // 创建 FormData
      const formData = new FormData()
      formData.append('file', blob)
      formData.append('chunkIndex', chunk.index.toString())
      formData.append('fileHash', this.fileHash)
      formData.append('fileName', this.file.name)
      formData.append('fileId', this.file.id)
      if (chunk.hash) {
        formData.append('chunkHash', chunk.hash)
      }

      // 发送请求
      const response = await fetch(this.options.uploadUrl!, {
        method: 'POST',
        body: formData,
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`)
      }

      const result = await response.json()

      // 标记分片已上传
      this.uploadedChunkIndices.add(chunk.index)
      this.uploadingRequests.delete(chunk.index)

      // 更新进度
      this.updateProgress()
      this.updateMetadata()

      // 发送 WebSocket 消息（如果连接了）
      if (this.options.wsUrl) {
        try {
          const wsManager = getWebSocketManager()
          wsManager.send({
            type: 'chunkUploaded',
            fileId: this.file.id,
            chunkIndex: chunk.index
          })
        } catch (error) {
          // WebSocket 未连接，忽略
        }
      }
    } catch (error) {
      this.uploadingRequests.delete(chunk.index)

      // 如果是取消操作，不抛出错误
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      // 其他错误，抛出
      throw error
    }
  }

  /**
   * 更新元数据
   */
  private async updateMetadata(): Promise<void> {
    try {
      const metadata: FileMetadata = {
        fileId: this.file.id,
        fileName: this.file.name,
        fileSize: this.file.size,
        fileHash: this.fileHash,
        totalChunks: this.chunks.length,
        uploadedChunks: Array.from(this.uploadedChunkIndices),
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      await indexedDBManager.saveFileMetadata(metadata)
    } catch (error) {
      console.warn('更新元数据失败:', error)
    }
  }

  /**
   * 合并分片
   */
  private async mergeChunks(): Promise<void> {
    try {
      const response = await fetch('/api/upload/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileHash: this.fileHash,
          fileName: this.file.name,
          fileId: this.file.id,
          totalChunks: this.chunks.length
        })
      })

      if (!response.ok) {
        throw new Error('合并分片失败')
      }

      console.log('合并分片完成')
    } catch (error) {
      console.error('合并分片失败:', error)
      throw error
    }
  }

  /**
   * 更新进度
   */
  private updateProgress(): void {
    // 计算已上传的字节数
    let uploadedBytes = 0
    this.uploadedChunkIndices.forEach(index => {
      const chunk = this.chunks[index]
      if (chunk) {
        uploadedBytes += chunk.blob.size
      }
    })

    // 计算进度百分比
    const progress = this.file.size > 0
      ? Math.round((uploadedBytes / this.file.size) * 100)
      : 0

    this.file.progress = progress
    this.file.uploadedChunks = this.uploadedChunkIndices.size

    // 计算上传速度
    const now = Date.now()
    const timeDiff = (now - this.lastUpdateTime) / 1000 // 秒
    if (timeDiff > 0) {
      const bytesDiff = uploadedBytes - this.lastUploadedBytes
      const speed = bytesDiff / timeDiff // 字节/秒
      this.file.speed = speed

      this.lastUpdateTime = now
      this.lastUploadedBytes = uploadedBytes
    }

    // 调用回调函数
    this.options.onProgress(progress, this.file.speed || 0)
  }

  /**
   * 暂停上传
   */
  pause(): void {
    if (this.file.status !== 'uploading') {
      return
    }

    this.isPaused = true
    this.file.status = 'paused'
    this.options.onStatusChange('paused')

    // 取消所有正在上传的请求
    this.uploadingRequests.forEach(controller => {
      controller.abort()
    })
    this.uploadingRequests.clear()

    // 更新元数据
    this.updateMetadata()
  }

  /**
   * 继续上传
   */
  async resume(): Promise<void> {
    if (this.file.status !== 'paused') {
      return
    }

    this.isPaused = false
    await this.start()
  }

  /**
   * 取消上传
   */
  cancel(): void {
    this.isCancelled = true
    this.isPaused = true

    // 取消所有正在上传的请求
    this.uploadingRequests.forEach(controller => {
      controller.abort()
    })
    this.uploadingRequests.clear()

    // 清理 WebSocket 订阅
    if (this.wsUnsubscribe) {
      this.wsUnsubscribe()
      this.wsUnsubscribe = null
    }
  }

  /**
   * 重试上传
   */
  async retry(): Promise<void> {
    this.isCancelled = false
    this.isPaused = false
    this.uploadedChunkIndices.clear()
    this.file.progress = 0
    this.file.status = 'pending'

    await this.start()
  }
}

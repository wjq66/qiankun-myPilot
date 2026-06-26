/**
 * Web Worker 用于文件切片和 Hash 计算
 * 
 * 为什么用 Web Worker？
 * - 大文件切片和 hash 计算是 CPU 密集型操作
 * - 在主线程执行会阻塞 UI，导致页面卡顿
 * - Web Worker 在后台线程执行，不影响主线程
 */

import SparkMD5 from 'spark-md5'

// Worker 消息类型
export interface WorkerMessage {
  type: 'chunk' | 'hash' | 'fileHash'
  data: any
}

export interface ChunkMessage {
  type: 'chunk'
  file: File
  chunkSize: number
  startIndex: number
  endIndex: number
}

export interface HashMessage {
  type: 'hash'
  blob: Blob
  chunkIndex: number
}

export interface FileHashMessage {
  type: 'fileHash'
  file: File
  chunkSize: number
}

// Worker 响应类型
export interface WorkerResponse {
  type: 'chunkResult' | 'hashResult' | 'fileHashResult' | 'error'
  data: any
}

// 在 Worker 中处理消息
self.onmessage = async function(e: MessageEvent<WorkerMessage>) {
  const { type, data } = e.data

  try {
    switch (type) {
      case 'chunk':
        await handleChunk(data as ChunkMessage)
        break
      case 'hash':
        await handleHash(data as HashMessage)
        break
      case 'fileHash':
        await handleFileHash(data as FileHashMessage)
        break
      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { error: (error as Error).message }
    } as WorkerResponse)
  }
}

/**
 * 处理文件切片
 */
async function handleChunk(message: ChunkMessage) {
  const { file, chunkSize, startIndex, endIndex } = message
  const chunks: Array<{ index: number; start: number; end: number; blob: Blob }> = []

  for (let i = startIndex; i < endIndex; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const blob = file.slice(start, end)

    chunks.push({
      index: i,
      start,
      end,
      blob
    })

    // 主线程没有接收进度，所以不发送进度
    // 定期发送进度（每10个分片发送一次）
    // if ((i - startIndex) % 10 === 0) {
    //   self.postMessage({
    //     type: 'chunkProgress',
    //     data: {
    //       progress: ((i - startIndex + 1) / (endIndex - startIndex)) * 100,
    //       chunkIndex: i
    //     }
    //   })
    // }
  }

  self.postMessage({
    type: 'chunkResult',
    data: { chunks }
  } as WorkerResponse)
}

/**
 * 计算分片 Hash
 */
async function handleHash(message: HashMessage) {
  const { blob, chunkIndex } = message
  
  return new Promise<void>((resolve) => {
    const reader = new FileReader()
    const spark = new SparkMD5.ArrayBuffer()

    reader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer)
      const hash = spark.end()

      self.postMessage({
        type: 'hashResult',
        data: { hash, chunkIndex }
      } as WorkerResponse)

      resolve()
    }

    reader.onerror = () => {
      self.postMessage({
        type: 'error',
        data: { error: 'Failed to read chunk', chunkIndex }
      } as WorkerResponse)
      resolve()
    }

    reader.readAsArrayBuffer(blob)
  })
}

/**
 * 计算文件 Hash（使用分片方式，避免内存溢出）
 */
async function handleFileHash(message: FileHashMessage) {
  const { file, chunkSize } = message
  const spark = new SparkMD5.ArrayBuffer()
  const totalChunks = Math.ceil(file.size / chunkSize)
  let processedChunks = 0

  return new Promise<void>((resolve) => {
    const processChunk = (chunkIndex: number) => {
      if (chunkIndex >= totalChunks) {
        const hash = spark.end()
        self.postMessage({
          type: 'fileHashResult',
          data: { hash }
        } as WorkerResponse)
        resolve()
        return
      }

      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const blob = file.slice(start, end)

      // SparkMD5 需要 ArrayBuffer， FileReader 的作用是将 Blob 转换为 ArrayBuffer，以便进行 MD5 哈希计算。
      const reader = new FileReader()
      reader.onload = (e) => {
        spark.append(e.target?.result as ArrayBuffer)
        processedChunks++

        // 发送进度
        self.postMessage({
          type: 'fileHashProgress',
          data: {
            progress: (processedChunks / totalChunks) * 100
          }
        })

        // 处理下一个分片
        processChunk(chunkIndex + 1)
      }

      reader.onerror = () => {
        self.postMessage({
          type: 'error',
          data: { error: 'Failed to read file chunk', chunkIndex }
        } as WorkerResponse)
        resolve()
      }

      reader.readAsArrayBuffer(blob)
    }

    processChunk(0)
  })
}

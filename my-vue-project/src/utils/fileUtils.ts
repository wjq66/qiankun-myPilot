import type { ChunkInfo } from '../classes/uploadFile'

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
    // 纯函数，无副作用
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
  

/**
 * 生成文件ID
 */
export function generateFileId(): string {
    // 纯函数，无副作用
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 创建文件分片
 * @param file 文件对象
 * @param chunkSize 分片大小（字节），默认 2MB
 */
export function createChunks(file: File, chunkSize: number): ChunkInfo[] {
    // 纯函数，输入文件，输出分片数组
    const chunks: ChunkInfo[] = []
  let start = 0
  let index = 0

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size)
    const blob = file.slice(start, end)
    
    chunks.push({
      index,
      start,
      end,
      blob
    })
    
    start = end
    index++
  }

  return chunks
}


/**
 * 计算文件hash值（用于断点续传）
 * @param file 文件对象
 */
export async function calculateFileHash(file: File): Promise<string> {
    // 纯函数，输入文件，输出hash
    return ''
}

/**
 * 计算分片hash值
 * @param chunk 分片对象
 */
export async function calculateChunkHash(chunk: Blob): Promise<string> {
    // TODO: 实现分片hash计算逻辑
    return ''
  }
  
/**
 * IndexedDB 工具类
 * 
 * 为什么用 IndexedDB？
 * - 可以存储大量数据（比 localStorage 大得多）
 * - 可以存储 Blob 对象
 * - 异步操作，不阻塞主线程
 * - 支持事务，保证数据一致性
 */

import type { ChunkInfo } from '../classes/uploadFile'

const DB_NAME = 'FileUploadDB'
const DB_VERSION = 1
const STORE_CHUNKS = 'chunks'
const STORE_FILES = 'files'

/**
 * 文件元数据
 */
export interface FileMetadata {
  fileId: string
  fileName: string
  fileSize: number
  fileHash: string
  totalChunks: number
  uploadedChunks: number[]
  createdAt: number
  updatedAt: number
}

/**
 * IndexedDB 管理器
 */
export class IndexedDBManager {
  private db: IDBDatabase | null = null

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      // 数据库升级时回调
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建分片存储
        if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
          // 创建对象存储（表）并设置主键
          const chunkStore = db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' })
          // 为对象存储中的字段创建索引
          chunkStore.createIndex('fileId', 'fileId', { unique: false })
          // 为对象存储中的字段创建索引
          chunkStore.createIndex('chunkIndex', 'chunkIndex', { unique: false })
        }

        // 创建文件元数据存储
        if (!db.objectStoreNames.contains(STORE_FILES)) {
           // 创建对象存储（表）并设置主键
          const fileStore = db.createObjectStore(STORE_FILES, { keyPath: 'fileId' })
          // 为对象存储中的字段创建索引
          fileStore.createIndex('fileHash', 'fileHash', { unique: false })
        }
      }
    })
  }

  /**
   * 保存分片到 IndexedDB
   */
  async saveChunk(
    fileId: string,
    chunkIndex: number,
    blob: Blob,
    hash?: string
  ): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_CHUNKS], 'readwrite')
      const store = transaction.objectStore(STORE_CHUNKS)

      const chunkData = {
        id: `${fileId}_${chunkIndex}`,
        fileId,
        chunkIndex,
        blob,
        hash,
        createdAt: Date.now()
      }

      const request = store.put(chunkData)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to save chunk'))
      }
    })
  }

  /**
   * 从 IndexedDB 获取分片
   */
  async getChunk(fileId: string, chunkIndex: number): Promise<Blob | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_CHUNKS], 'readonly')
      const store = transaction.objectStore(STORE_CHUNKS)
      const request = store.get(`${fileId}_${chunkIndex}`)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.blob : null)
      }

      request.onerror = () => {
        reject(new Error('Failed to get chunk'))
      }
    })
  }

  /**
   * 获取文件的所有分片
   */
  async getAllChunks(fileId: string): Promise<ChunkInfo[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_CHUNKS], 'readonly')
      const store = transaction.objectStore(STORE_CHUNKS)
      const index = store.index('fileId')
      const request = index.getAll(fileId)

      request.onsuccess = () => {
        const chunks: ChunkInfo[] = request.result.map((item: any) => ({
          index: item.chunkIndex,
          start: 0, // IndexedDB 中不存储 start/end，需要重新计算
          end: item.blob.size,
          blob: item.blob,
          hash: item.hash
        }))
        resolve(chunks.sort((a, b) => a.index - b.index))
      }

      request.onerror = () => {
        reject(new Error('Failed to get chunks'))
      }
    })
  }

  /**
   * 删除文件的所有分片
   */
  async deleteChunks(fileId: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_CHUNKS], 'readwrite')
      const store = transaction.objectStore(STORE_CHUNKS)
      const index = store.index('fileId')
      const request = index.openKeyCursor(IDBKeyRange.only(fileId))

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          store.delete(cursor.primaryKey)
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => {
        reject(new Error('Failed to delete chunks'))
      }
    })
  }

  /**
   * 保存文件元数据
   */
  async saveFileMetadata(metadata: FileMetadata): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_FILES], 'readwrite')
      const store = transaction.objectStore(STORE_FILES)

      const data = {
        ...metadata,
        updatedAt: Date.now()
      }

      const request = store.put(data)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to save file metadata'))
      }
    })
  }

  /**
   * 获取文件元数据
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_FILES], 'readonly')
      const store = transaction.objectStore(STORE_FILES)
      const request = store.get(fileId)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        reject(new Error('Failed to get file metadata'))
      }
    })
  }

  /**
   * 根据文件 Hash 查找文件元数据（用于断点续传）
   */
  async getFileMetadataByHash(fileHash: string): Promise<FileMetadata | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      // // 进行事务操作
      // db.transaction()：创建事务，指定对象存储名称和事务模式（readonly 或 readwrite）。
      const transaction = this.db!.transaction([STORE_FILES], 'readonly')
      const store = transaction.objectStore(STORE_FILES)
      
      // 根据fileHash字段查找索引获取数据
      const index = store.index('fileHash')
      const request = index.get(fileHash)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        reject(new Error('Failed to get file metadata by hash'))
      }
    })
  }

  /**
   * 获取所有未完成的文件（用于恢复上传）
   */
  async getIncompleteFiles(): Promise<FileMetadata[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_FILES], 'readonly')
      const store = transaction.objectStore(STORE_FILES)
      const request = store.getAll()

      request.onsuccess = () => {
        const files = request.result.filter(
          (file: FileMetadata) => file.uploadedChunks.length < file.totalChunks
        )
        resolve(files)
      }

      request.onerror = () => {
        reject(new Error('Failed to get incomplete files'))
      }
    })
  }

  /**
   * 删除文件元数据
   */
  async deleteFileMetadata(fileId: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_FILES], 'readwrite')
      const store = transaction.objectStore(STORE_FILES)
      const request = store.delete(fileId)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete file metadata'))
      }
    })
  }

  /**
   * 清理所有数据（用于测试或重置）
   */
  async clearAll(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_CHUNKS, STORE_FILES], 'readwrite')
      
      const chunkStore = transaction.objectStore(STORE_CHUNKS)
      const fileStore = transaction.objectStore(STORE_FILES)

      const chunkRequest = chunkStore.clear()
      const fileRequest = fileStore.clear()

      let completed = 0
      const checkComplete = () => {
        completed++
        if (completed === 2) {
          resolve()
        }
      }

      chunkRequest.onsuccess = checkComplete
      fileRequest.onsuccess = checkComplete

      chunkRequest.onerror = () => reject(new Error('Failed to clear chunks'))
      fileRequest.onerror = () => reject(new Error('Failed to clear files'))
    })
  }
}

// 单例模式
export const indexedDBManager = new IndexedDBManager()

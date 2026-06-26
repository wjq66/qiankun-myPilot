/**
 * WebSocket 管理器
 * 
 * 为什么用 WebSocket？
 * - 实时双向通信
 * - 服务器可以主动推送消息（上传进度、错误等）
 * - 比轮询更高效
 */

export interface WebSocketMessage {
  type: 'progress' | 'complete' | 'error' | 'chunkUploaded' | 'mergeComplete'
  fileId?: string
  chunkIndex?: number
  progress?: number
  data?: any
  error?: string
}

export type WebSocketMessageHandler = (message: WebSocketMessage) => void

/**
 * WebSocket 管理器
 */
export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectInterval: number = 3000 // 重连间隔（毫秒）
  private maxReconnectAttempts: number = 5
  private reconnectAttempts: number = 0
  private messageHandlers: Set<WebSocketMessageHandler> = new Set()
  private isManualClose: boolean = false

  constructor(url: string) {
    this.url = url
  }

  /**
   * 连接 WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.isManualClose = false
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket closed')
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect()
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 重连 WebSocket
   */
  private reconnect(): void {
    this.reconnectAttempts++
    console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnect failed:', error)
      })
    }, this.reconnectInterval)
  }

  /**
   * 发送消息
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('Error in message handler:', error)
      }
    })
  }

  /**
   * 注册消息处理器
   */
  onMessage(handler: WebSocketMessageHandler): () => void {
    this.messageHandlers.add(handler)
    // 返回取消注册的函数
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  /**
   * 关闭连接
   */
  close(): void {
    this.isManualClose = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// 单例模式（根据实际需求，可能需要支持多个连接）
let wsManagerInstance: WebSocketManager | null = null

export function getWebSocketManager(url?: string): WebSocketManager {
  if (!wsManagerInstance && url) {
    wsManagerInstance = new WebSocketManager(url)
  }
  if (!wsManagerInstance) {
    throw new Error('WebSocketManager not initialized. Please provide URL.')
  }
  return wsManagerInstance
}

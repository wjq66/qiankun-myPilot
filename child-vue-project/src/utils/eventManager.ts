// src/utils/eventManager.ts - 事件管理器

/**
 * 全局事件管理器
 * 统一管理主应用和子应用之间的通信事件
 */

export interface EventCallback<T = any> {
  (data: T): void
}

class EventManager {
  private handlers = new Map<string, Set<EventCallback>>()

  /**
   * 监听事件
   */
  on(event: string, callback: EventCallback) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(callback)
    
    console.log(`[EventManager] 监听事件: ${event}`)
  }

  /**
   * 取消监听
   */
  off(event: string, callback: EventCallback) {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.delete(callback)
      if (handlers.size === 0) {
        this.handlers.delete(event)
      }
      console.log(`[EventManager] 取消监听: ${event}`)
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, data?: any) {
    const handlers = this.handlers.get(event)
    if (handlers) {
      console.log(`[EventManager] 触发事件: ${event}`, data)
      handlers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[EventManager] 事件处理失败: ${event}`, error)
        }
      })
    } else {
      console.warn(`[EventManager] 没有监听者: ${event}`)
    }
  }

  /**
   * 一次性监听
   */
  once(event: string, callback: EventCallback) {
    const wrapper = (data: any) => {
      callback(data)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }

  /**
   * 清除所有监听
   */
  clear() {
    this.handlers.clear()
    console.log('[EventManager] 清除所有监听')
  }
}

export const eventManager = new EventManager()

// 定义事件类型
export enum AppEvents {
  // 用户相关
  USER_LOGOUT = 'user:logout',
  USER_LOGIN = 'user:login',
  USER_INFO_UPDATE = 'user:info:update',
  
  // 子应用相关
  SUB_APP_LOADED = 'sub-app:loaded',
  SUB_APP_UNLOADED = 'sub-app:unloaded',
  
  // 数据同步
  DATA_SYNC = 'data:sync',
  
  // 系统通知
  NOTIFICATION = 'notification'
}

/**
 * 便捷方法
 */
export const onEvent = (event: string, callback: EventCallback) => {
  eventManager.on(event, callback)
}

export const offEvent = (event: string, callback: EventCallback) => {
  eventManager.off(event, callback)
}

export const emitEvent = (event: string, data?: any) => {
  eventManager.emit(event, data)
}

/**
 * 类型安全的事件监听
 */
export const onUserLogout = (callback: EventCallback) => {
  eventManager.on(AppEvents.USER_LOGOUT, callback)
}

export const emitUserLogout = (data?: any) => {
  eventManager.emit(AppEvents.USER_LOGOUT, data)
}

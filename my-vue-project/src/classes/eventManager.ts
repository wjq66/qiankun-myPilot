// src/utils/eventManager.ts - 主应用事件管理器

import type { MicroAppStateActions } from 'qiankun'

/**
 * 全局事件管理器
 */
export interface EventCallback<T = any> {
  (data: T): void
}

class EventManager {
  private handlers = new Map<string, Set<EventCallback>>()
  private qiankunActions: MicroAppStateActions | null = null

  /**
   * 设置 qiankun actions（用于跨应用通信）
   */
  setQiankunActions(actions: MicroAppStateActions) {
    this.qiankunActions = actions
  }

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
    }
  }

  /**
   * 触发事件（主应用内部）
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
    }

    // 同时通知子应用（如果有 qiankun actions）
    if (this.qiankunActions) {
      this.qiankunActions.setGlobalState({
        event,
        data,
        timestamp: Date.now()
      })
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
  }
}

export const eventManager = new EventManager()

// 定义事件类型
export enum AppEvents {
  USER_LOGOUT = 'user:logout',
  USER_LOGIN = 'user:login',
  USER_INFO_UPDATE = 'user:info:update',
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

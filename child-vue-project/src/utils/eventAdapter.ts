// src/utils/eventAdapter.ts - 子应用事件适配器

/**
 * 子应用事件适配器
 * 简化子应用中的事件监听
 */
class EventAdapter {
  private handlers: Map<string, Set<Function>> = new Map()
  
  /**
   * 初始化适配器
   * @param onGlobalStateChange qiankun 提供的状态变化监听函数
   */
  init(onGlobalStateChange?: Function) {
    if (!onGlobalStateChange) {
      console.warn('[EventAdapter] onGlobalStateChange 未提供')
      return
    }
    
    // 监听全局状态变化
    onGlobalStateChange(
      (state: any, prev: any) => {
        console.log('[EventAdapter] 收到状态变化:', state)
        
        // 遍历所有监听器，分发事件
        for (const [eventName, handlers] of this.handlers.entries()) {
          if (state[eventName]) {
            const eventData = state[eventName]
            handlers.forEach(handler => {
              try {
                handler(eventData)
              } catch (error) {
                console.error(`[EventAdapter] 事件处理失败:`, error)
              }
            })
          }
        }
      },
      true // 立即触发一次
    )
    
    console.log('[EventAdapter] 初始化完成')
  }
  
  /**
   * 监听事件
   */
  on(eventName: string, handler: Function) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set())
    }
    
    this.handlers.get(eventName)!.add(handler)
    console.log(`[EventAdapter] 添加监听: ${eventName}`)
  }
  
  /**
   * 取消监听
   */
  off(eventName: string, handler: Function) {
    const handlers = this.handlers.get(eventName)
    if (handlers) {
      handlers.delete(handler)
      console.log(`[EventAdapter] 移除监听: ${eventName}`)
    }
  }
  
  /**
   * 监听一次
   */
  once(eventName: string, handler: Function) {
    const wrapper = () => {
      handler()
      this.off(eventName, wrapper)
    }
    this.on(eventName, wrapper)
  }
  
  /**
   * 清除所有监听
   */
  clear() {
    this.handlers.clear()
    console.log('[EventAdapter] 已清除所有监听')
  }
}

export const eventAdapter = new EventAdapter()

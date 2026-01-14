# 📚 全局事件管理器详细讲解

## 🎯 核心设计思想

整个事件管理器基于**发布-订阅模式**（观察者模式），设计成**主应用事件管理器 + 子应用事件适配器**的双层架构。

```
┌─────────────────────────────────────────────────────────┐
│                      主应用 (Main App)                    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │          eventManager (事件管理器)                │  │
│  │  - on() 监听事件                                  │  │
│  │  - emit() 发送事件                                │  │
│  │  - off() 取消监听                                 │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │    actions.setGlobalState() 设置全局状态         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓ 全局状态变化
┌─────────────────────────────────────────────────────────┐
│                       子应用 (Child App)                  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │      eventAdapter (事件适配器)                   │  │
│  │  - init() 初始化                                 │  │
│  │  - on() 监听事件                                  │  │
│  │  - 自动分发到监听器                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📖 第一部分：主应用事件管理器 (EventManager)

### **1. 类结构**

```typescript
class EventManager {
  private actions: MicroAppStateActions | null = null
  private listeners: Map<string, Set<Function>> = new Map()
}
```

#### **详细说明：**

- `actions`: 存储 qiankun 的 Actions 对象，用于设置全局状态
- `listeners`: 事件名称 → 监听器集合的映射

**数据结构：**
```
listeners = {
  'user-logout': Set([ handler1, handler2, handler3 ]),
  'user-login': Set([ handler4, handler5 ]),
  'data-refresh': Set([ handler6 ])
}
```

---

### **2. init() - 初始化方法**

```typescript
init(actions: MicroAppStateActions) {
  this.actions = actions
  
  // 监听全局状态变化，分发事件
  actions.onGlobalStateChange((state: any, prev: any) => {
    console.log('[EventManager] 全局状态变化:', state)
    
    // 分发事件
    for (const [eventName, handlers] of this.listeners.entries()) {
      if (state[eventName] !== undefined) {
        handlers.forEach(handler => {
          try {
            handler(state[eventName], prev[eventName])
          } catch (error) {
            console.error(`[EventManager] 事件处理失败:`, error)
          }
        })
      }
    }
  })
  
  console.log('[EventManager] 初始化完成')
}
```

#### **工作原理：**

1. 保存 Actions 对象
2. 监听全局状态变化
3. 遍历本地的 listeners
4. 若状态包含该事件名，调用所有监听器

**执行流程：**
```
全局状态变化 → actions.onGlobalStateChange 触发
  ↓
检查 state 中是否有已注册的事件名
  ↓
找到 'user-logout'，state['user-logout'] 有值
  ↓
遍历 Set 中的 handler，逐个调用
  ↓
handler1(state['user-logout']) 
handler2(state['user-logout'])
handler3(state['user-logout'])
```

---

### **3. on() - 监听事件**

```typescript
on<T extends keyof GlobalEvents>(
  eventName: T,
  handler: (data: GlobalEvents[T]) => void
): () => void {
  if (!this.listeners.has(eventName as string)) {
    this.listeners.set(eventName as string, new Set())
  }
  
  this.listeners.get(eventName as string)!.add(handler)
  
  console.log(`[EventManager] 添加监听: ${eventName as string}`)
  
  // 返回取消监听的函数
  return () => {
    this.off(eventName, handler)
  }
}
```

#### **详细解析：**

**第 1 步：类型约束**
```typescript
<T extends keyof GlobalEvents>
```
- 确保 eventName 是已定义的事件名

**第 2 步：创建监听器集合**
```typescript
if (!this.listeners.has(eventName)) {
  this.listeners.set(eventName, new Set())
}
```
- 若无集合，创建并注册

**第 3 步：添加处理器**
```typescript
this.listeners.get(eventName)!.add(handler)
```

**第 4 步：返回清理函数**
```typescript
return () => {
  this.off(eventName, handler)
}
```
- 可直接调 off()

**使用示例：**
```typescript
// 添加监听
const off = eventManager.on('user-logout', (data) => {
  console.log('用户退出:', data)
})

// 10秒后取消监听
setTimeout(off, 10000)
```

---

### **4. emit() - 触发事件**

```typescript
emit<T extends keyof GlobalEvents>(
  eventName: T,
  data: GlobalEvents[T]
) {
  if (!this.actions) {
    console.warn('[EventManager] Actions 未初始化')
    return
  }
  
  console.log(`[EventManager] 触发事件: ${eventName as string}`, data)
  
  // 通过 Actions 设置全局状态
  this.actions.setGlobalState({
    [eventName as string]: {
      ...data,
      _timestamp: Date.now(),
      _eventId: `${eventName}-${Date.now()}`
    }
  })
}
```

#### **工作流程：**

1. 检查是否初始化
2. 通过 Actions 设置全局状态
3. 将事件作为状态中的一个 key

**数据变化：**
```typescript
// 发送前
globalState = {
  userInfo: { id: 1 }
}

// 调用 emit('user-logout', { timestamp: 123 })
this.actions.setGlobalState({
  'user-logout': { 
    timestamp: 123,
    _timestamp: 1699999999,
    _eventId: 'user-logout-1699999999'
  }
})

// 发送后（状态合并）
globalState = {
  userInfo: { id: 1 },
  'user-logout': { timestamp: 123, ... }
}
```

#### **为什么用 setGlobalState？**
- 全局状态变化会自动触发 Actions 监听
- 子应用可通过 `onGlobalStateChange` 接收
- 实现主应用 → 子应用的通知

---

### **5. once() - 只监听一次**

```typescript
once<T extends keyof GlobalEvents>(
  eventName: T,
  handler: (data: GlobalEvents[T]) => void
) {
  const wrapper = (data: GlobalEvents[T]) => {
    handler(data)        // 先执行用户定义的 handler
    this.off(eventName, wrapper)  // 然后移除监听
  }
  this.on(eventName, wrapper)
}
```

#### **实现思路：**
- 包装 handler，调用后立刻移除自身

**执行流程：**
```
用户调用 once('user-logout', handler)
  ↓
创建 wrapper = (data) => { handler(data); off(...) }
  ↓
将 wrapper 注册为监听器
  ↓
事件触发 → wrapper 执行
  ↓
执行 handler(data)
  ↓
自动调用 off() 移除监听
```

---

---

## 📖 第二部分：子应用事件适配器 (EventAdapter)

### **6. init() - 初始化方法**

```typescript
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
```

#### **工作机制：**
- 主应用调用 `setGlobalState` 后，qiankun 触发全局状态变化
- 子应用接收新 state，适配器遍历 handlers 判断是否存在对应 eventName
- 存在则取出事件数据，调用已注册的 handler

#### **为什么需要 adapter？**
- 子应用不需要发送事件（仅监听）
- API 更简洁，类型更轻量

---

### **7. on() - 监听事件（简化版）**

```typescript
on(eventName: string, handler: Function) {
  if (!this.handlers.has(eventName)) {
    this.handlers.set(eventName, new Set())
  }
  
  this.handlers.get(eventName)!.add(handler)
  console.log(`[EventAdapter] 添加监听: ${eventName}`)
}
```

#### **与主应用的 on() 对比：**
| 特性 | EventManager | EventAdapter |
|------|-------------|-------------|
| 类型约束 | ✅ 强类型 | ❌ 简单类型 |
| 返回清理函数 | ✅ | ❌ |
| once() | ✅ 有实现 | ✅ 有实现 |
| 用途 | 发送+监听 | 仅监听 |

---

---

## 🔄 完整数据流示例

### **场景：用户退出登录**

#### **步骤 1：主应用触发事件**
```typescript
// my-vue-project/src/App.vue
eventManager.emit('user-logout', {
  timestamp: Date.now()
})
```

#### **步骤 2：EventManager 处理**
```typescript
// EventManager.emit()
this.actions.setGlobalState({
  'user-logout': {
    timestamp: 1699999999,
    _timestamp: 1699999999,
    _eventId: 'user-logout-1699999999'
  }
})
```

#### **步骤 3：qiankun 分发到子应用**
- qiankun 检测全局状态变化
- 调用所有已注册的 `onGlobalStateChange`
- 传递新 `state` 和旧 `state`

#### **步骤 4：子应用 EventAdapter 接收**
```typescript
// EventAdapter.init() 中的回调
onGlobalStateChange((state, prev) => {
  // state = { 'user-logout': { timestamp: ... }, ... }
  
  // 遍历所有已注册的监听器
  for (const [eventName, handlers] of this.handlers.entries()) {
    // 检查是否有这个事件的数据
    if (state['user-logout']) {
      // 调用所有监听器
      handlers.forEach(handler => {
        handler(state['user-logout']) // 传递事件数据
      })
    }
  }
})
```

#### **步骤 5：执行业务逻辑**
```typescript
// child-vue-project/src/main.ts
eventAdapter.on('user-logout', (data) => {
  console.log('收到退出登录事件:', data)
  userStore.clearUserInfo() // 清理用户数据
})
```

---

## 🎓 关键概念总结

### **1. 为什么用 Map + Set？**
```typescript
Map<string, Set<Function>>
```
- Map：事件名 → 处理器集合
- Set：去重，避免重复注册

### **2. 为什么需要两个类？**
- 主应用 EventManager：发送与监听
- 子应用 EventAdapter：只监听（简化实现）

### **3. 核心机制**
```
主应用 emit() 
  → setGlobalState() 
  → qiankun 全局状态变化
  → 所有 onGlobalStateChange 触发
  → 子应用 adapter 分发事件
  → 业务 handler 执行
```

### **4. 优势**
- 类型安全
- API 类似 mitt
- 跨微应用通信
- 支持一次监听、统计数量、清理、错误处理

---

## 💡 使用建议

### **何时用 EventManager**
- 主应用内部组件通信
- 跨多个子应用通信
- 主应用 → 子应用通信

### **何时用 EventAdapter**
- 子应用监听主应用事件
- 子应用内部不发送事件
- 简单场景

### **类型定义**
```typescript
interface GlobalEvents {
  'user-logout': { timestamp: number }
  'user-login': { userInfo: any; timestamp: number }
  'data-refresh': { dataType: string }
}
```

扩展时只需修改此处。

---

通过此实现，事件管理类似于 mitt，并适配 qiankun 的全局状态机制。

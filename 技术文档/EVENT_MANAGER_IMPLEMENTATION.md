# 🎯 面试问题：怎么实现的事件管理

## 📚 完整回答思路

---

## 1️⃣ 核心设计思路

**一句话回答**：
我实现了一个基于发布-订阅模式的事件管理器，使用 Map + Set 存储监听器，通过封装 qiankun Actions 提供类似 mitt 的 emit/on API。

**设计原则**：
1. **发布-订阅模式**：解耦发送方和接收方
2. **封装抽象**：隐藏底层 Actions 实现细节
3. **类型安全**：完整的 TypeScript 类型定义
4. **易用性**：类似 mitt 的 API，学习成本低

---

## 2️⃣ 数据结构设计

### **核心数据结构**

```typescript
class EventManager {
  // 存储监听器：事件名 → 处理器集合
  private listeners: Map<string, Set<Function>> = new Map()
  
  // qiankun Actions 对象
  private actions: MicroAppStateActions | null = null
}
```

### **为什么用 Map + Set？**

**Map**：
- 键值对结构，快速查找事件对应的监听器
- O(1) 时间复杂度查找

**Set**：
- 自动去重，避免同一个监听器被注册多次
- O(1) 时间复杂度添加/删除

**数据结构示例**：
```javascript
listeners = {
  'user-logout': Set([ handler1, handler2, handler3 ]),
  'user-login': Set([ handler4, handler5 ]),
  'data-refresh': Set([ handler6 ])
}
```

---

## 3️⃣ 关键方法实现

### **方法 1：on() - 注册监听器**

```typescript
on<T extends keyof GlobalEvents>(
  eventName: T,
  handler: (data: GlobalEvents[T]) => void
): () => void {
  // 1. 如果事件不存在，创建新的 Set
  if (!this.listeners.has(eventName as string)) {
    this.listeners.set(eventName as string, new Set())
  }
  
  // 2. 添加监听器到 Set（自动去重）
  this.listeners.get(eventName as string)!.add(handler)
  
  // 3. 返回取消监听的函数（闭包）
  return () => {
    this.off(eventName, handler)
  }
}
```

**关键点**：
- **类型约束**：`T extends keyof GlobalEvents` 确保事件名有效
- **自动去重**：Set 自动处理重复监听器
- **返回清理函数**：方便手动取消监听

---

### **方法 2：emit() - 发送事件**

```typescript
emit<T extends keyof GlobalEvents>(
  eventName: T,
  data: GlobalEvents[T]
) {
  if (!this.actions) {
    console.warn('[EventManager] Actions 未初始化')
    return
  }
  
  // 通过 Actions 设置全局状态
  this.actions.setGlobalState({
    [eventName as string]: {
      ...data,
      _timestamp: Date.now(),        // 时间戳
      _eventId: `${eventName}-${Date.now()}`  // 事件ID
    }
  })
}
```

**关键点**：
- **状态键名**：事件名作为全局状态的键
- **元数据**：添加 timestamp 和 eventId，方便调试
- **状态合并**：不会覆盖其他事件的状态

---

### **方法 3：初始化 - 监听全局状态变化**

```typescript
init(actions: MicroAppStateActions) {
  this.actions = actions
  
  // 监听 qiankun 全局状态变化
  actions.onGlobalStateChange((state: any, prev: any) => {
    // 遍历所有注册的监听器
    for (const [eventName, handlers] of this.listeners.entries()) {
      // 检查状态中是否有这个事件
      if (state[eventName] !== undefined) {
        // 遍历该事件的所有监听器
        handlers.forEach(handler => {
          try {
            // 执行监听器，传递新状态和旧状态
            handler(state[eventName], prev[eventName])
          } catch (error) {
            console.error(`[EventManager] 事件处理失败:`, error)
          }
        })
      }
    }
  })
}
```

**关键点**：
- **遍历所有监听器**：检查每个事件名是否在状态中
- **错误处理**：try-catch 防止一个监听器出错影响其他
- **状态对比**：同时传递新状态和旧状态

---

### **方法 4：once() - 只监听一次**

```typescript
once<T extends keyof GlobalEvents>(
  eventName: T,
  handler: (data: GlobalEvents[T]) => void
) {
  // 创建包装函数
  const wrapper = (data: GlobalEvents[T]) => {
    handler(data)              // 先执行用户的 handler
    this.off(eventName, wrapper)  // 然后移除监听
  }
  
  // 注册包装函数而不是原函数
  this.on(eventName, wrapper)
}
```

**关键点**：
- **包装模式**：包装原函数，执行后自动移除
- **闭包**：wrapper 闭包保存了 eventName 和 handler

---

### **方法 5：off() - 取消监听**

```typescript
off<T extends keyof GlobalEvents>(
  eventName: T,
  handler: (data: GlobalEvents[T]) => void
) {
  const handlers = this.listeners.get(eventName as string)
  if (handlers) {
    handlers.delete(handler)  // Set 的 delete 方法
    console.log(`[EventManager] 移除监听: ${eventName as string}`)
  }
}
```

**关键点**：
- **Set.delete()**：O(1) 时间复杂度
- **安全检查**：先检查 handlers 是否存在

---

## 4️⃣ 完整数据流

### **流程图**

```
用户调用 emit('user-logout', data)
  ↓
EventManager.emit()
  ↓
actions.setGlobalState({ 'user-logout': { ...data, _timestamp } })
  ↓
qiankun 全局状态更新
  ↓
actions.onGlobalStateChange 触发
  ↓
EventManager.init() 中的回调执行
  ↓
遍历 listeners Map
  ↓
找到 'user-logout' 对应的 Set
  ↓
遍历 Set 中的所有 handler
  ↓
执行 handler(state['user-logout'], prev['user-logout'])
  ↓
业务逻辑处理
```

### **可视化**

```
┌─────────────────────────────────────┐
│  用户调用 emit('logout', data)      │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  EventManager.emit()                 │
│  setGlobalState({                    │
│    'logout': { data, timestamp }     │
│  })                                  │
└──────────────┬──────────────────────┘
               │
               ↓ qiankun 状态更新
┌─────────────────────────────────────┐
│  onGlobalStateChange 回调            │
│  state = { 'logout': {...} }        │
└──────────────┬──────────────────────┘
               │
               ↓ 遍历 listeners
┌─────────────────────────────────────┐
│  listeners Map:                     │
│  {                                  │
│    'logout': Set([ handler1,        │
│                     handler2 ]),    │
│    'login': Set([ handler3 ])      │
│  }                                  │
└──────────────┬──────────────────────┘
               │
               ↓ 找到 'logout' 的 Set
┌─────────────────────────────────────┐
│  遍历 Set 中的 handler              │
│  handler1(data)                     │
│  handler2(data)                     │
└─────────────────────────────────────┘
```

---

## 5️⃣ 类型安全设计

### **事件类型定义**

```typescript
export interface GlobalEvents {
  'user-logout': { timestamp: number }
  'user-login': { userInfo: any; timestamp: number }
  'data-refresh': { dataType: string }
  'menu-change': { menu: string }
  [key: string]: any  // 允许扩展
}
```

### **类型约束**

```typescript
// emit 时类型检查
emit<T extends keyof GlobalEvents>(
  eventName: T,
  data: GlobalEvents[T]  // ✅ 必须是该事件类型的数据
)

// on 时类型推断
on('user-logout', (data) => {
  // data 自动推断为 { timestamp: number }
  console.log(data.timestamp)  // ✅ 类型安全
})
```

**优势**：
- 编译时类型检查，减少运行时错误
- IDE 自动补全和提示
- 重构时自动更新

---

## 6️⃣ 性能优化

### **1. 数据结构选择**

- Map：O(1) 查找事件
- Set：O(1) 添加/删除监听器，自动去重

### **2. 延迟执行**

只在状态变化时才遍历监听器，不是实时监听。

### **3. 错误隔离**

```typescript
try {
  handler(state[eventName], prev[eventName])
} catch (error) {
  console.error(`[EventManager] 事件处理失败:`, error)
  // ✅ 一个监听器出错不影响其他
}
```

---

## 🎯 面试回答模板（1-2分钟版本）

### **简洁版回答**：

```
我实现的事件管理器基于发布-订阅模式，核心数据结构是 Map + Set：

1. **数据结构**：
   - Map<string, Set<Function>> 存储监听器
   - 键是事件名，值是该事件的所有监听器集合
   - Set 自动去重，避免重复注册

2. **关键方法**：
   - on()：注册监听器，添加到 Set，返回清理函数
   - emit()：调用 setGlobalState，将事件名作为状态键
   - init()：监听全局状态变化，遍历监听器自动分发

3. **工作流程**：
   emit → setGlobalState → 状态更新 → onGlobalStateChange 触发 
   → 遍历 Map 找到对应事件 → 遍历 Set 执行所有监听器

4. **设计亮点**：
   - 类型安全：TypeScript 类型约束
   - 自动去重：Set 特性
   - 错误隔离：try-catch 保护
   - 返回清理函数：方便管理
```

---

### **详细版回答**：

```
我实现的事件管理器基于发布-订阅模式，核心包括：

**1. 数据结构设计**
使用 Map + Set 的组合：
- Map：事件名 → 监听器集合，O(1) 查找
- Set：存储监听器，自动去重，O(1) 添加/删除

数据结构示例：
```javascript
listeners = {
  'user-logout': Set([ handler1, handler2 ]),
  'user-login': Set([ handler3 ])
}
```

**2. 核心方法实现**
- **on()**：检查 Map 中是否存在事件，不存在则创建 Set，添加监听器，返回清理函数
- **emit()**：调用 setGlobalState，将事件名作为状态键，数据作为值
- **init()**：监听 onGlobalStateChange，遍历 Map 和 Set，自动分发事件
- **once()**：包装原函数，执行后自动移除

**3. 完整数据流**
用户 emit → setGlobalState → qiankun 状态更新 
→ onGlobalStateChange 触发 → 遍历 listeners Map 
→ 找到对应事件的 Set → 遍历执行所有 handler

**4. 类型安全**
定义了 GlobalEvents 接口，emit 和 on 都有类型约束，编译时检查。

**5. 设计亮点**
- 性能：Map + Set，O(1) 时间复杂度
- 错误隔离：try-catch 保护，一个出错不影响其他
- 自动去重：Set 特性避免重复注册
- 返回清理函数：方便手动管理
```

---

## 📝 关键代码片段（快速参考）

### **核心实现**

```typescript
class EventManager {
  private listeners: Map<string, Set<Function>> = new Map()
  
  on(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }
    this.listeners.get(eventName).add(handler)
    return () => this.off(eventName, handler)
  }
  
  emit(eventName, data) {
    this.actions.setGlobalState({
      [eventName]: { ...data, _timestamp: Date.now() }
    })
  }
  
  init(actions) {
    actions.onGlobalStateChange((state, prev) => {
      for (const [eventName, handlers] of this.listeners.entries()) {
        if (state[eventName]) {
          handlers.forEach(handler => handler(state[eventName]))
        }
      }
    })
  }
}
```

---

## 💡 加分回答（深入问题）

### **如果问：为什么用 Map + Set？**

```
1. Map：键值对结构，适合用事件名作为键快速查找，O(1) 时间复杂度
2. Set：自动去重，避免同一个监听器被注册多次，O(1) 添加/删除
3. 组合使用：既保证了查找效率，又保证了存储唯一性

如果用数组：
- 查找需要遍历，O(n) 时间复杂度
- 需要手动去重逻辑
```

### **如果问：如何保证事件不丢失？**

```
1. qiankun Actions 会持久化全局状态，即使子应用未挂载也能获取
2. onGlobalStateChange 第二个参数设为 true，立即触发一次获取最新状态
3. 事件数据中添加 timestamp，可以判断事件时效性
4. 如果子应用后加载，可以在 mount 时获取当前状态
```

### **如果问：如何处理内存泄漏？**

```
1. 提供 off() 方法手动移除监听器
2. on() 返回清理函数，组件卸载时调用
3. 提供 clear() 方法清除所有监听器
4. 在 unmount 生命周期中自动清理
```

---

## ✅ 关键要点总结

1. ✅ **设计模式**：发布-订阅模式
2. ✅ **数据结构**：Map + Set，高性能
3. ✅ **核心方法**：on、emit、init、once、off
4. ✅ **数据流**：emit → setGlobalState → 状态更新 → 分发事件
5. ✅ **类型安全**：TypeScript 类型约束
6. ✅ **错误处理**：try-catch 隔离

---

**🎉 记住核心：Map + Set 数据结构 + 发布-订阅模式 + qiankun Actions 封装！**

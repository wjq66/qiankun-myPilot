# 🎯 面试问题：怎么实现跨应用通信

## 📚 完整回答思路

---

## 1️⃣ 首先说明跨应用通信的几种方式

**一句话回答**：
在 qiankun 微前端架构中，跨应用通信主要有**全局 Actions**、**自定义事件**、**localStorage** 等方式，我使用的是基于 qiankun Actions 封装的事件管理器。

**方式对比**：

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Actions** | 官方推荐，响应式，类型安全 | 需要配置 | 状态同步、双向通信 |
| **自定义事件** | 简单直接 | 类型不安全，只适合通知 | 简单事件通知 |
| **localStorage** | 持久化 | 只能存字符串，性能一般 | 配置共享 |
| **Props** | 类型安全，直接 | 单向，初始化时传递 | 初始化数据 |

---

## 2️⃣ 我实现的方案：基于 Actions 的事件管理器

### **核心架构**

```
主应用 (eventManager)
    ↓ 封装 Actions
    ↓ setGlobalState()
    ↓
qiankun 全局状态
    ↓ 自动分发
    ↓
子应用 (eventAdapter)
    ↓ 监听状态变化
    ↓ 分发事件
    ↓
业务组件
```

---

## 3️⃣ 具体实现方式

### **主应用侧（发送方）**

#### **步骤 1：初始化全局 Actions**

```javascript
// my-vue-project/src/qiankun.js
import { initGlobalState } from 'qiankun'

// 初始化全局状态
const actions = initGlobalState({
  userInfo: null,
  timestamp: Date.now()
})

// 通过 props 传递给子应用
registerMicroApps([
  {
    name: 'son-vue3',
    props: {
      setGlobalState: actions.setGlobalState,        // 发送方法
      onGlobalStateChange: actions.onGlobalStateChange  // 监听方法
    }
  }
])
```

#### **步骤 2：封装事件管理器**

```typescript
// my-vue-project/src/utils/eventManager.ts
class EventManager {
  private actions: MicroAppStateActions | null = null
  
  init(actions: MicroAppStateActions) {
    this.actions = actions
    // 监听全局状态变化，自动分发事件
    actions.onGlobalStateChange((state, prev) => {
      // 遍历所有监听器，分发事件
      for (const [eventName, handlers] of this.listeners.entries()) {
        if (state[eventName]) {
          handlers.forEach(handler => handler(state[eventName]))
        }
      }
    })
  }
  
  // 发送事件
  emit(eventName: string, data: any) {
    this.actions.setGlobalState({
      [eventName]: {
        ...data,
        _timestamp: Date.now()
      }
    })
  }
  
  // 监听事件
  on(eventName: string, handler: Function) {
    // 注册监听器
  }
}

export const eventManager = new EventManager()
```

#### **步骤 3：使用事件管理器**

```typescript
// my-vue-project/src/App.vue
import { eventManager } from './utils/eventManager'

// 退出登录时通知子应用
eventManager.emit('user-logout', {
  timestamp: Date.now()
})
```

---

### **子应用侧（接收方）**

#### **步骤 1：初始化事件适配器**

```typescript
// child-vue-project/src/main.ts
import { eventAdapter } from './utils/eventAdapter'

function render(props: any = {}) {
  // 初始化适配器
  if (props?.onGlobalStateChange) {
    eventAdapter.init(props.onGlobalStateChange)
    
    // 监听退出登录事件
    eventAdapter.on('user-logout', (data) => {
      console.log('收到退出登录事件:', data)
      userStore.clearUserInfo()
    })
  }
}
```

#### **步骤 2：事件适配器实现**

```typescript
// child-vue-project/src/utils/eventAdapter.ts
class EventAdapter {
  private handlers: Map<string, Set<Function>> = new Map()
  
  init(onGlobalStateChange: Function) {
    // 监听全局状态变化
    onGlobalStateChange((state: any, prev: any) => {
      // 遍历所有监听器，分发事件
      for (const [eventName, handlers] of this.handlers.entries()) {
        if (state[eventName]) {
          handlers.forEach(handler => handler(state[eventName]))
        }
      }
    }, true) // true 表示立即触发一次
  }
  
  on(eventName: string, handler: Function) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set())
    }
    this.handlers.get(eventName)!.add(handler)
  }
}
```

---

## 4️⃣ 工作原理（数据流）

### **完整流程**

```
用户操作（主应用）
  ↓
eventManager.emit('user-logout', data)
  ↓
actions.setGlobalState({ 'user-logout': data })
  ↓
qiankun 全局状态更新
  ↓
自动触发所有注册的 onGlobalStateChange
  ↓
子应用 eventAdapter 收到状态变化
  ↓
遍历 handlers，找到对应的监听器
  ↓
执行回调函数 handler(data)
  ↓
业务逻辑处理（清理用户数据）
```

### **可视化流程图**

```
┌─────────────────┐
│   主应用        │
│                 │
│ emit('logout')  │
└────────┬────────┘
         │
         ↓ setGlobalState
┌─────────────────┐
│  qiankun Actions│
│  全局状态       │
└────────┬────────┘
         │
         ↓ 状态变化通知
┌─────────────────┐
│   子应用        │
│                 │
│ on('logout')    │
│ → 执行回调      │
└─────────────────┘
```

---

## 5️⃣ 为什么这样设计？

### **优势**

1. **封装抽象**：类似 mitt 的 API，使用简单
2. **类型安全**：TypeScript 类型约束
3. **解耦**：主应用和子应用通过事件解耦
4. **可扩展**：容易添加新的事件类型
5. **调试友好**：完整日志输出

### **与原生 Actions 的区别**

| 特性 | 原生 Actions | 事件管理器 |
|------|-------------|-----------|
| **API** | setGlobalState / onGlobalStateChange | emit / on（类似 mitt） |
| **使用复杂度** | 需要手动检查状态键 | 直接监听事件名 |
| **类型安全** | ❌ | ✅ |
| **易用性** | 一般 | 简单直观 |

---

## 🎯 面试回答模板（1-2分钟版本）

### **简洁版回答**：

```
在 qiankun 微前端中，跨应用通信主要有几种方式：

1. **全局 Actions**（官方推荐）：
   - 使用 initGlobalState 创建全局状态
   - 主应用通过 setGlobalState 发送数据
   - 子应用通过 onGlobalStateChange 监听变化

2. **我的实现方案**：
   基于 Actions 封装了事件管理器，类似 mitt 的 API：
   - 主应用：eventManager.emit('event-name', data)
   - 子应用：eventAdapter.on('event-name', handler)
   
   底层还是使用 Actions，但提供了更简单易用的接口。

3. **工作原理**：
   - 主应用 emit → setGlobalState → qiankun 全局状态更新
   - 子应用通过 onGlobalStateChange 监听 → 适配器分发事件 → 执行回调

这样设计的好处是：
- API 简洁，类似熟悉的事件总线
- 类型安全，支持 TypeScript
- 解耦，主应用和子应用通过事件名通信
- 扩展性强，容易添加新的事件类型
```

---

### **详细版回答**：

```
在 qiankun 微前端架构中，跨应用通信有几种方式：

**方式 1：全局 Actions（官方推荐）**
qiankun 提供了 initGlobalState 来创建全局状态：
- 主应用调用 actions.setGlobalState() 更新状态
- 子应用通过 onGlobalStateChange 监听状态变化
- 这是官方推荐的方案

**方式 2：我的实现（基于 Actions 的事件管理器）**
我在项目中对 Actions 进行了封装，提供类似 mitt 的 API：

1. **主应用侧**：
   - 创建 EventManager 类，封装了 emit/on 方法
   - emit 时将事件名作为状态键，数据作为值
   - 监听全局状态变化，自动分发事件

2. **子应用侧**：
   - 创建 EventAdapter 适配器
   - 通过 props 接收 onGlobalStateChange
   - 监听状态变化，根据事件名分发到对应的监听器

3. **数据流**：
   主应用 emit('user-logout', data)
   → setGlobalState({ 'user-logout': data })
   → qiankun 全局状态更新
   → 子应用 onGlobalStateChange 触发
   → 适配器遍历 handlers，找到对应监听器
   → 执行回调函数

4. **优势**：
   - API 简洁，类似 mitt，开发体验好
   - 类型安全，完整的 TypeScript 支持
   - 解耦，通过事件名通信，不依赖具体实现
   - 可扩展，容易添加新的事件类型

实际使用：
- 主应用：eventManager.emit('user-logout', { timestamp })
- 子应用：eventAdapter.on('user-logout', (data) => { ... })
```

---

## 📝 关键要点总结

1. ✅ **底层原理**：基于 qiankun Actions 的全局状态机制
2. ✅ **实现方式**：封装为事件管理器，提供类似 mitt 的 API
3. ✅ **数据流**：emit → setGlobalState → 状态更新 → 监听触发 → 事件分发
4. ✅ **优势**：API 简洁、类型安全、解耦、易扩展

---

## 💡 加分回答（如果面试官深入提问）

### **如果问：为什么不直接用 Actions？**

```
直接使用 Actions 也可以，但有几个问题：
1. 需要在 onGlobalStateChange 中手动判断状态键
2. 类型不够安全，容易出错
3. API 不够直观

封装成事件管理器后：
1. 直接监听事件名，更直观
2. TypeScript 类型约束，更安全
3. 类似 mitt 的 API，学习成本低
```

### **如果问：如何保证事件不丢失？**

```
1. qiankun Actions 会保存全局状态，即使子应用未挂载也能获取最新状态
2. onGlobalStateChange 的第二个参数设为 true，会立即触发一次，获取最新状态
3. 在事件数据中添加 timestamp，可以判断事件的时效性
```

### **如果问：子应用之间如何通信？**

```
可以通过主应用作为中转：
- 子应用 A 通过 setGlobalState 发送事件
- 主应用可以监听并转发
- 子应用 B 通过 onGlobalStateChange 接收

或者直接通过 Actions：
- 所有子应用都通过 props 获取同一个 actions 对象
- 可以直接互相调用 setGlobalState 和监听
```

---

## 🔧 代码示例（快速参考）

### **主应用发送事件**
```typescript
// 初始化
eventManager.init(actions)

// 发送事件
eventManager.emit('user-logout', { timestamp: Date.now() })
```

### **子应用监听事件**
```typescript
// 初始化
eventAdapter.init(props.onGlobalStateChange)

// 监听事件
eventAdapter.on('user-logout', (data) => {
  console.log('收到事件:', data)
  // 处理业务逻辑
})
```

---

**🎉 准备充分，面试稳了！记住关键点：基于 Actions、封装事件管理器、类似 mitt 的 API。**

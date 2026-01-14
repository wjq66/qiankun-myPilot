# 🎯 全局事件管理器使用指南

## 📦 功能特性

- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **类似 mitt**：熟悉的 API，简单易用
- ✅ **跨应用通信**：主应用和子应用之间通信
- ✅ **自动清理**：支持一次性监听和手动取消
- ✅ **调试友好**：完整的日志输出

---

## 🚀 主应用使用方法

### **1. 发送事件**

```typescript
import { eventManager } from './utils/eventManager'

// 发送退出登录事件
eventManager.emit('user-logout', {
  timestamp: Date.now()
})

// 发送数据刷新事件
eventManager.emit('data-refresh', {
  dataType: 'users',
  action: 'create'
})
```

### **2. 监听事件**

```typescript
import { eventManager } from './utils/eventManager'

// 监听用户登录
const offLogin = eventManager.on('user-login', (data) => {
  console.log('用户登录:', data)
})

// 只监听一次
eventManager.once('user-logout', (data) => {
  console.log('用户退出:', data)
})

// 取消监听
offLogin()
```

### **3. 内置事件类型**

```typescript
// src/utils/eventManager.ts
export interface GlobalEvents {
  'user-logout': { timestamp: number }
  'user-login': { userInfo: any; timestamp: number }
  'data-refresh': { dataType: string }
  'menu-change': { menu: string }
}

// 使用时会自动类型检查
eventManager.emit('user-logout', {
  timestamp: Date.now() // ✅ 类型正确
})

eventManager.emit('user-logout', {
  name: 'test' // ❌ 类型错误，缺少 timestamp
})
```

---

## 🔧 子应用使用方法

### **1. 初始化事件适配器**

已经在 `main.ts` 中自动初始化，无需手动调用。

### **2. 监听事件**

```typescript
import { eventAdapter } from './utils/eventAdapter'

// 监听退出登录事件
eventAdapter.on('user-logout', (data) => {
  console.log('收到退出登录事件:', data)
  // 清理本地数据
  clearUserData()
})

// 监听数据刷新事件
eventAdapter.on('data-refresh', (data) => {
  if (data.dataType === 'users') {
    // 刷新用户列表
    refreshUserList()
  }
})
```

---

## 📝 完整示例

### **主应用：用户操作通知子应用**

```typescript
// my-vue-project/src/App.vue
import { eventManager } from './utils/eventManager'

function handleLogout() {
  // 执行退出逻辑
  authStore.logout()
  
  // 通知子应用
  eventManager.emit('user-logout', {
    timestamp: Date.now()
  })
  
  router.push('/login')
}
```

### **子应用：接收通知并清理数据**

```typescript
// child-vue-project/src/main.ts
import { eventAdapter } from './utils/eventAdapter'

// 在 render 函数中初始化
if (props?.onGlobalStateChange) {
  eventAdapter.init(props.onGlobalStateChange)
  
  // 监听各种事件
  eventAdapter.on('user-logout', (data) => {
    console.log('清理本地数据')
    userStore.clearUserInfo()
  })
  
  eventAdapter.on('data-refresh', (data) => {
    if (data.dataType === 'users') {
      fetchUsers()
    }
  })
}
```

---

## 🎨 高级用法

### **1. 自定义事件类型**

```typescript
// 在主应用中添加新事件类型
import { EventManager } from './utils/eventManager'

declare module './utils/eventManager' {
  interface GlobalEvents {
    'custom-event': { customData: string }
  }
}

// 使用
eventManager.emit('custom-event', {
  customData: 'hello'
})
```

### **2. 统计监听器**

```typescript
// 获取特定事件的监听器数量
console.log(eventManager.listenerCount('user-logout')) // 2

// 获取所有事件的监听器总数
console.log(eventManager.listenerCount()) // 10
```

### **3. 清除所有监听**

```typescript
// 清除所有事件监听
eventManager.clear()
```

---

## 🔍 调试

事件管理器会输出详细的日志：

```
[EventManager] 初始化完成
[EventManager] 添加监听: user-logout
[EventManager] 触发事件: user-logout {timestamp: 1234567890}
[EventAdapter] 收到状态变化: {...}
[EventAdapter] 添加监听: user-logout
[子应用] 收到退出登录事件 {...}
```

---

## 📊 对比

| 特性 | 直接使用 Actions | 事件管理器 |
|------|----------------|-----------|
| **类型安全** | ❌ | ✅ |
| **API 简洁** | ❌ | ✅ |
| **调试友好** | ❌ | ✅ |
| **类似 mitt** | ❌ | ✅ |
| **自动清理** | ❌ | ✅ |

---

## ✅ 总结

现在你可以像使用 mitt 一样使用事件管理器了！

```typescript
// 发送
eventManager.emit('event-name', data)

// 监听
eventManager.on('event-name', (data) => { ... })
```

简单易用，类型安全！🎉

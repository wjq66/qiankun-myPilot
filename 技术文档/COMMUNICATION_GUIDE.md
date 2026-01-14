# qiankun 子应用向主应用传递数据的几种方式

## 方式 1：通过 Actions 机制传递（推荐）✨

这是 **qiankun 官方推荐的通信方式**，支持双向通信。

### **子应用配置**

```typescript
// child-vue-project/src/main.ts
import { initGlobalState, MicroAppStateActions } from 'qiankun'

let actions: MicroAppStateActions | null = null

export async function mount(props: any) {
  console.log('[child-vue-project] 子应用挂载', props)
  
  // 初始化 Actions（只在独立运行或首次挂载时）
  if (!actions && props?.setGlobalState) {
    actions = props
  } else if (!window.__POWERED_BY_QIANKUN__) {
    // 独立运行时初始化
    actions = initGlobalState({})
  }
  
  render(props)
  
  // 子应用向主应用发送数据
  if (actions) {
    actions.setGlobalState({
      from: 'child-vue-project',
      message: '子应用已挂载',
      timestamp: Date.now()
    })
  }
}

export async function unmount(props: any) {
  // 子应用卸载时通知主应用
  if (actions) {
    actions.setGlobalState({
      from: 'child-vue-project',
      message: '子应用已卸载',
      timestamp: Date.now()
    })
  }
}
```

### **主应用配置**

```typescript
// my-vue-project/src/qiankun.js
import { initGlobalState } from 'qiankun'

// 初始化全局状态
const actions = initGlobalState({
  from: 'main-app',
  message: '初始化'
})

// 监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态变化:', state)
  console.log('[主应用] 上一状态:', prev)
  
  // 处理子应用传来的数据
  if (state.from === 'child-vue-project') {
    console.log('[主应用] 收到子应用消息:', state.message)
  }
})

export function registerQiankunApps() {
  registerMicroApps([
    {
      name: 'son-vue3',
      entry: '//localhost:5174',
      container: '#container',
      activeRule: '/son-vue3',
      props: {
        // 将 actions 传递给子应用
        setGlobalState: actions.setGlobalState,
        onGlobalStateChange: actions.onGlobalStateChange,
      }
    }
  ])
  
  start()
}
```

---

## 方式 2：自定义事件传递

通过原生 `CustomEvent` API 通信。

### **子应用发送数据**

```typescript
// child-vue-project/src/views/UserListView.vue
import { ref } from 'vue'

const selectedUserCount = ref(0)

// 发送自定义事件
function sendDataToMainApp() {
  const event = new CustomEvent('child-app-message', {
    detail: {
      from: 'child-vue-project',
      data: {
        selectedUsers: selectedUserCount.value,
        timestamp: Date.now()
      }
    }
  })
  
  window.dispatchEvent(event)
  console.log('[子应用] 已发送数据到主应用')
}
```

### **主应用接收数据**

```typescript
// my-vue-project/src/main.ts
import { onMounted, onUnmounted } from 'vue'

function handleChildAppMessage(event: CustomEvent) {
  console.log('[主应用] 收到子应用消息:', event.detail)
  
  if (event.detail.from === 'child-vue-project') {
    console.log('[主应用] 子应用数据:', event.detail.data)
  }
}

onMounted(() => {
  window.addEventListener('child-app-message', handleChildAppMessage as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('child-app-message', handleChildAppMessage as EventListener)
})
```

---

## 方式 3：通过 localStorage/sessionStorage 传递

适用于简单的数据共享。

### **子应用存储数据**

```typescript
// child-vue-project/src/views/UserListView.vue
function updateUserList(data: any) {
  // 存储到 localStorage
  localStorage.setItem('child-app-data', JSON.stringify({
    from: 'child-vue-project',
    timestamp: Date.now(),
    data: data
  }))
  
  // 触发存储事件
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'child-app-data',
    newValue: JSON.stringify(data)
  }))
}
```

### **主应用监听存储变化**

```typescript
// my-vue-project/src/main.ts
function handleStorageChange(event: StorageEvent) {
  if (event.key === 'child-app-data') {
    const data = JSON.parse(event.newValue || '{}')
    console.log('[主应用] 收到子应用数据:', data)
  }
}

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
})
```

---

## 方式 4：通过 BroadcastChannel 传递

适用于跨标签页通信。

### **子应用发送**

```typescript
// child-vue-project/src/utils/channel.ts
const channel = new BroadcastChannel('main-child-channel')

export function sendToMainApp(data: any) {
  channel.postMessage({
    from: 'child-vue-project',
    payload: data
  })
}

// 监听主应用消息
channel.onmessage = (event) => {
  console.log('[子应用] 收到主应用消息:', event.data)
}
```

### **主应用接收**

```typescript
// my-vue-project/src/utils/channel.ts
const channel = new BroadcastChannel('main-child-channel')

export function listenToChildApp(callback: (data: any) => void) {
  channel.onmessage = (event) => {
    if (event.data.from === 'child-vue-project') {
      callback(event.data.payload)
    }
  }
}

// 发送消息到子应用
export function sendToChildApp(data: any) {
  channel.postMessage({
    from: 'main-app',
    payload: data
  })
}
```

---

## 方式 5：通过 props 回调传递

让子应用通过回调函数通知主应用。

### **主应用配置**

```typescript
// my-vue-project/src/qiankun.js
registerMicroApps([
  {
    name: 'son-vue3',
    entry: '//localhost:5174',
    container: '#container',
    activeRule: '/son-vue3',
    props: {
      // 传递回调函数
      onDataChange: (data: any) => {
        console.log('[主应用] 收到子应用数据:', data)
      },
      onUserSelect: (users: any[]) => {
        console.log('[主应用] 选中的用户:', users)
      }
    }
  }
])
```

### **子应用使用**

```typescript
// child-vue-project/src/main.ts
function render(props: any = {}) {
  // 将回调函数存储到全局
  window.MAIN_APP_CALLBACKS = {
    onDataChange: props.onDataChange,
    onUserSelect: props.onUserSelect
  }
  
  // ... 其他逻辑
}
```

### **在子应用中使用回调**

```typescript
// child-vue-project/src/views/UserListView.vue
function handleUserSelect(users: any[]) {
  if (window.MAIN_APP_CALLBACKS?.onUserSelect) {
    window.MAIN_APP_CALLBACKS.onUserSelect(users)
  }
}
```

---

## 方式 6：通过消息总线（Event Bus）

使用 Pinia 或自定义事件总线。

### **创建消息总线**

```typescript
// child-vue-project/src/utils/messageBus.ts
class MessageBus {
  private listeners: Map<string, Function[]> = new Map()
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }
  
  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach(callback => callback(data))
  }
  
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event) || []
    this.listeners.set(event, callbacks.filter(cb => cb !== callback))
  }
}

export const messageBus = new MessageBus()
```

### **子应用发送**

```typescript
// child-vue-project/src/views/UserListView.vue
import { messageBus } from '@/utils/messageBus'

function notifyMainApp() {
  messageBus.emit('user-selected', {
    count: 10,
    users: ['user1', 'user2']
  })
}
```

### **主应用接收**

```typescript
// my-vue-project/src/main.ts
import { messageBus } from './utils/messageBus'

messageBus.on('user-selected', (data) => {
  console.log('[主应用] 选中的用户:', data)
})
```

---

## 📊 方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Actions** | 官方推荐，类型安全，支持响应式 | 需要配置 | 双向通信，状态同步 |
| **自定义事件** | 简单直接，不需额外配置 | 类型不安全 | 简单事件通知 |
| **localStorage** | 持久化，简单 | 只能存字符串 | 静态配置共享 |
| **BroadcastChannel** | 跨标签页 | 浏览器兼容性 | 多标签页通信 |
| **props 回调** | 类型安全，直接 | 单向通信 | 子应用通知主应用 |
| **消息总线** | 解耦，灵活 | 需要实现 | 复杂事件系统 |

---

## 🎯 推荐使用方案

### **对于你的项目，推荐：**

1. **Actions 机制**（复杂数据通信）
   - 用户信息同步
   - 状态变化通知

2. **自定义事件**（简单通知）
   - 用户操作完成
   - 页面跳转通知

---

## 💡 实际应用示例

### **场景：子应用中的用户操作同步到主应用**

```typescript
// child-vue-project/src/main.ts
export async function mount(props: any) {
  render(props)
  
  // 监听子应用内部事件
  window.addEventListener('user-operation', (event: any) => {
    // 通过 Actions 传递给主应用
    if (props.setGlobalState) {
      props.setGlobalState({
        from: 'child-vue-project',
        type: event.detail.type, // 'create', 'update', 'delete'
        data: event.detail.data
      })
    }
  })
}
```

```typescript
// child-vue-project/src/views/UserListView.vue
function handleCreateUser() {
  // 创建用户
  await createUser(userData)
  
  // 通知主应用
  window.dispatchEvent(new CustomEvent('user-operation', {
    detail: {
      type: 'create',
      data: userData
    }
  }))
}
```

这样主应用就可以实时收到子应用的用户操作信息了！🎉

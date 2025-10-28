# 🧠 设计思想快速入门

## 📚 从 useAuthStore 学到的设计思想

### 🔍 什么是 Store？

**简单理解**：Store 就是一个"数据仓库"，用来统一管理应用的状态和逻辑。

```typescript
// Store = 数据仓库
const authStore = {
  数据: { currentUser, isAuthenticated },
  操作: { login, logout, register }
}
```

---

## 💡 核心设计思想

### 1️⃣ **单一数据源（Single Source of Truth）**

**含义**：同一个数据只在一个地方管理

#### ❌ 错误示例
```typescript
// 组件A
const username = ref('张三')

// 组件B  
const username = ref('李四')  // 数据不一致！

// 组件C
const username = ref('王五')  // 又不一样！
```

#### ✅ 正确示例
```typescript
// Store（唯一数据源）
export const useAuthStore = () => {
  const username = ref('张三')  // 只在这里定义一次
  
  return { username }
}

// 所有组件都使用同一个数据
componentA.username = authStore.username  // "张三"
componentB.username = authStore.username  // "张三"
componentC.username = authStore.username  // "张三"
```

**好处**：
- ✅ 数据一致性
- ✅ 易于维护
- ✅ 不会出现数据不同步的问题

---

### 2️⃣ **关注点分离（Separation of Concerns）**

**含义**：不同职责的代码分开写

```
┌─────────────────────────────────┐
│         UI 层（组件）            │
│  • 负责显示                        │
│  • 负责用户交互                    │
│  • 不关心数据处理                  │
└─────────────┬───────────────────┘
              │ 调用
              ↓
┌─────────────────────────────────┐
│      业务逻辑层（Store）          │
│  • 负责数据处理                    │
│  • 负责业务逻辑                    │
│  • 不关心如何显示                  │
└─────────────┬───────────────────┘
              │ 请求
              ↓
┌─────────────────────────────────┐
│        数据层（API）              │
│  • 负责获取数据                    │
│  • 负责保存数据                    │
└─────────────────────────────────┘
```

#### 示例对比

```vue
<!-- ❌ 不分离：组件中既有 UI 又有逻辑 -->
<template>
  <button @click="handleLogin">登录</button>
</template>

<script>
export default {
  methods: {
    handleLogin() {
      // 业务逻辑混在组件中
      const response = await fetch('/api/login')
      const data = await response.json()
      this.user = data
      localStorage.setItem('user', JSON.stringify(data))
      // ... 更多逻辑
    }
  }
}
</script>
```

```vue
<!-- ✅ 分离：UI 和逻辑分开 -->
<template>
  <button @click="authStore.login()">登录</button>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
// 逻辑在 Store 中
</script>
```

---

### 3️⃣ **数据驱动视图**

**含义**：数据变化，视图自动更新

#### 传统方式（命令式）
```javascript
// 1. 获取 DOM
const button = document.getElementById('counter')
// 2. 监听事件
button.addEventListener('click', () => {
  // 3. 获取值
  const oldValue = parseInt(document.getElementById('count').textContent)
  // 4. 计算新值
  const newValue = oldValue + 1
  // 5. 手动更新 DOM
  document.getElementById('count').textContent = newValue
})
```

#### Vue 方式（声明式）
```vue
<template>
  <button @click="count++">+</button>
  <span>{{ count }}</span>
</template>

<script setup>
const count = ref(0)  // 只需要定义数据
// 视图会自动更新，不需要手动操作 DOM
</script>
```

**核心思想**：
- 传统：告诉电脑"怎么做"
- Vue：告诉电脑"要什么状态"，让它自己更新

---

## 🎯 设计 Store 的步骤

### **步骤1：需求分析**
```
我要做什么功能？
需要管理什么数据？
需要哪些操作？
```

### **步骤2：定义数据结构**
```typescript
// 用接口定义数据形状
interface User {
  id: number
  username: string
  email: string
}
```

### **步骤3：组织 Store**
```typescript
export const useAuthStore = defineStore('auth', () => {
  // 1. 状态（数据）
  const currentUser = ref(null)
  const isAuthenticated = ref(false)
  
  // 2. 计算属性（派生数据）
  const userInfo = computed(() => ({
    username: currentUser.value?.username
  }))
  
  // 3. 方法（操作）
  const login = () => { /* ... */ }
  const logout = () => { /* ... */ }
  
  // 4. 返回所有需要的
  return { currentUser, isAuthenticated, login, logout }
})
```

---

## 🎨 实战练习：购物车示例

### **需求分析**
```
功能：购物车
数据：商品列表、总价、数量
操作：添加商品、删除商品、清空、结算
```

### **实现代码**
```typescript
export const useCartStore = defineStore('cart', () => {
  // 1. 状态
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  
  // 2. 计算属性
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => 
      sum + item.price * item.quantity, 0)
  })
  
  const itemCount = computed(() => items.value.length)
  
  // 3. 方法
  const addItem = (item: CartItem) => {
    items.value.push(item)
  }
  
  const removeItem = (id: number) => {
    items.value = items.value.filter(i => i.id !== id)
  }
  
  const clearCart = () => {
    items.value = []
  }
  
  // 4. 返回
  return {
    items,
    loading,
    totalPrice,
    itemCount,
    addItem,
    removeItem,
    clearCart
  }
})
```

---

## 📖 思维方式转变

### **从"我"的角度 → 从"数据"的角度**

#### 传统思维（过程式）
```
我需要显示用户名：
1. 获取数据
2. 处理数据
3. 渲染到页面
4. 更新事件监听
```

#### Store 思维（声明式）
```
我需要显示用户名：
1. 数据在 store 中
2. 组件读取 store
3. 数据变化，视图自动更新
```

---

## 🔑 关键要点

### **5 个黄金原则**

1. **🏗️ 结构清晰**
   - 状态 → 计算属性 → 方法

2. **🎯 职责单一**
   - 每个方法只做一件事

3. **🔄 响应式**
   - 使用 ref/computed 创建响应式数据

4. **🔌 解耦**
   - Store 不依赖组件，可独立测试

5. **📦 复用**
   - 多个组件可以共享同一个 Store

---

## 💪 立即实践

### **练习1：主题切换 Store**
```typescript
// 需求：支持亮色/暗色主题切换
// 需要管理的：当前主题
// 需要的操作：切换主题、保存主题

export const useThemeStore = defineStore('theme', () => {
  // 你的代码...
})
```

### **练习2：通知 Store**
```typescript
// 需求：管理系统通知
// 需要管理的：通知列表
// 需要的操作：添加通知、删除通知、清空通知

export const useNotificationStore = defineStore('notification', () => {
  // 你的代码...
})
```

---

## 🎓 学习路径

```
Level 1: 理解基本概念
  └─ 什么是 Store？
  └─ 为什么需要 Store？

Level 2: 学会创建 Store
  └─ ref/reactive 定义状态
  └─ 编写方法
  └─ 返回数据

Level 3: 掌握高级用法
  └─ 计算属性
  └─ 异步操作
  └─ Store 间通信

Level 4: 工程化实践
  └─ 类型安全
  └─ 错误处理
  └─ 性能优化
```

---

记住：**多看多练，从模仿到理解到创新！** 🚀

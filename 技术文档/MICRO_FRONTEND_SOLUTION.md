# 🚀 Qiankun 微前端集成完整方案

> 本文档记录微前端项目的核心实现方案、遇到的问题及解决方案，重点关注**主应用与子应用的集成**。

---

## 📋 目录

1. [项目架构](#项目架构)
2. [主应用配置](#主应用配置)
3. [子应用配置](#子应用配置)
4. [路由配置](#路由配置)
5. [通信机制](#通信机制)
6. [问题与解决方案](#问题与解决方案)
7. [最佳实践](#最佳实践)

---

## 🏗️ 项目架构

### **整体架构图**

```
┌─────────────────────────────────────────────────────────┐
│                   主应用 (my-vue-project)                │
│  - Vue 3 + Vite + Router + Pinia                        │
│  - 端口: 5173                                            │
│  - 路由: History 模式                                    │
└─────────────────────────────────────────────────────────┘
                        ↓ qiankun
                   全局状态 Actions
                        ↓
┌─────────────────────────────────────────────────────────┐
│                 子应用 (child-vue-project)               │
│  - Vue 3 + Vite + Router + Pinia                        │
│  - 端口: 5174                                            │
│  - 路由: Hash 模式 (qiankun 环境)                       │
└─────────────────────────────────────────────────────────┘
```

### **技术栈**

| 应用 | 技术栈 |
|------|--------|
| **主应用** | Vue 3 + Vite + Vue Router + Pinia + Qiankun |
| **子应用** | Vue 3 + Vite + Vue Router + Pinia + Element Plus + vite-plugin-qiankun |

---

## 🎯 主应用配置

### **1. 安装依赖**

```bash
npm install qiankun
```

### **2. qiankun.js - 核心配置**

```javascript
// my-vue-project/src/qiankun.js
import { registerMicroApps, start, initGlobalState } from 'qiankun'
import { useAuthStore } from './stores/auth'
import { eventManager } from './utils/eventManager'

// 初始化全局状态
const actions = initGlobalState({
  userInfo: null,
  isLoggedOut: false,
  timestamp: Date.now()
})

// 初始化事件管理器
eventManager.init(actions)

export function registerQiankunApps() {
  // 确保容器存在
  if (!document.querySelector('#container')) {
    console.warn('[qiankun] 容器不存在，延迟注册')
    return
  }
  
  const authStore = useAuthStore()
  
  registerMicroApps([
    {
      name: 'son-vue3',                    // 子应用名称（必须与 vite-plugin-qiankun 配置一致）
      entry: '//localhost:5174',           // 子应用入口地址
      container: '#container',              // 挂载容器
      activeRule: (location) => location.pathname.startsWith('/son-vue3'),  // 激活规则
      props: {
        userInfo: authStore.userInfo,       // 传递用户信息
        setGlobalState: actions.setGlobalState,              // 传递 Actions 方法
        onGlobalStateChange: actions.onGlobalStateChange     // 传递监听方法
      },
      loader: (loading) => {
        console.log('子应用加载中...', loading)
      }
    }
  ], {
    beforeLoad: [app => console.log('[主应用] 开始加载', app.name)],
    beforeMount: [app => console.log('[主应用] 开始挂载', app.name)],
    afterMount: [app => console.log('[主应用] 挂载完成', app.name)],
    beforeUnmount: [app => console.log('[主应用] 开始卸载', app.name)],
    afterUnmount: [app => console.log('[主应用] 卸载完成', app.name)]
  })

  // 启动 qiankun
  start({
    sandbox: {
      strictStyleIsolation: false,         // CSS 沙箱隔离（关闭避免样式冲突）
      experimentalStyleIsolation: false
    },
    singular: false,                        // 允许同时激活多个微应用
    prefetch: 'all'                         // 预加载所有微应用
  })
  
  return actions
}

// 导出 actions 供其他模块使用
export { actions }
export { eventManager }
```

### **3. main.ts - 延迟注册**

```typescript
// my-vue-project/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerQiankunApps } from './qiankun.js'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// ✅ 关键：路由挂载完成后再注册 qiankun
router.isReady().then(() => {
  registerQiankunApps()
})

app.mount('#app')
```

### **4. 路由配置**

```typescript
// my-vue-project/src/router/index.ts
{
  path: '/son-vue3',
  name: 'son-vue3',
  component: () => import('../views/MicroAppView.vue'),
  meta: { requiresAuth: true }
}
```

### **5. 容器组件**

```vue
<!-- my-vue-project/src/views/MicroAppView.vue -->
<template>
  <div class="micro-app-view">
    <div id="container" class="micro-container"></div>
  </div>
</template>

<style scoped>
.micro-app-view {
  width: 100%;
  height: 100%;
}

.micro-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
```

---

## 📦 子应用配置

### **1. 安装依赖**

```bash
npm install vite-plugin-qiankun
```

### **2. vite.config.ts - Vite 配置**

```typescript
// child-vue-project/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun(`son-vue3`, {  // ✅ 必须与主应用的 name 一致
      useDevMode: true      // 开发模式
    })
  ],
  server: {
    port: 5174,              // ✅ 必须与主应用 entry 端口一致
    cors: true,              // 允许跨域
    headers: {
      'Access-Control-Allow-Origin': '*'  // CORS 头
    }
  },
  base: './'                 // 相对路径
})
```

### **3. public-path.js - 动态设置 publicPath**

```javascript
// child-vue-project/src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  // qiankun 环境
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}
```

### **4. main.ts - qiankun 生命周期**

```typescript
// child-vue-project/src/main.ts
import './public-path'
import { createApp, type App as AppInstance } from 'vue'
import { createPinia } from 'pinia'
import { renderWithQiankun, qiankunWindow } from "vite-plugin-qiankun/dist/helper"
import { useLoginStore } from './stores/login'
import { eventAdapter } from './utils/eventAdapter'
import App from './App.vue'
import router from './router'

let instance: AppInstance | null = null

/**
 * 渲染函数
 */
function render(props: any = {}) {
  const { container } = props || {}
  
  // 获取挂载容器
  const mountContainer = container 
    ? container.querySelector('#app') || container
    : document.querySelector('#app')
  
  if (!mountContainer) {
    console.error('[子应用] 未找到挂载容器')
    return
  }

  // 清空容器
  if (instance) {
    instance.unmount()
  }
  
  if (mountContainer instanceof HTMLElement) {
    mountContainer.innerHTML = ''
  }

  // 创建应用实例
  instance = createApp(App)
  
  // 注册插件
  const pinia = createPinia()
  instance.use(pinia)
  instance.use(router)
  instance.use(ElementPlus)

  // 初始化用户信息
  const userStore = useLoginStore()
  if (props?.userInfo) {
    userStore.initFromProps(props)
  } else {
    userStore.restoreUserInfo()
  }

  // 初始化事件适配器
  if (props?.onGlobalStateChange) {
    eventAdapter.init(props.onGlobalStateChange)
    
    // 监听退出登录事件
    eventAdapter.on('user-logout', (data: any) => {
      userStore.clearUserInfo()
    })
  }

  // 挂载应用
  instance.mount(mountContainer)
}

// 独立运行时
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun 生命周期
renderWithQiankun({
  bootstrap() {
    console.log('[child-vue-project] 子应用启动')
  },
  mount(props) {
    console.log('[child-vue-project] 子应用挂载', props)
    render(props)
  },
  update(props) {
    console.log('[child-vue-project] 子应用更新', props)
  },
  unmount(props) {
    console.log('[child-vue-project] 子应用卸载', props)
    if (instance) {
      instance.unmount()
      const container = props?.container || document
      const appContainer = container.querySelector('#app')
      if (appContainer) {
        appContainer.innerHTML = ''
      }
      instance = null
    }
  }
})
```

### **5. 路由配置 - Hash 模式**

```typescript
// child-vue-project/src/router/index.ts
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper"

const router = createRouter({
  // ✅ 关键：qiankun 环境使用 hash 模式，避免路由冲突
  history: qiankunWindow.__POWERED_BY_QIANKUN__ 
    ? createWebHashHistory() 
    : createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/user-management', name: 'user-management', component: () => import('@/views/UserManagement/UserListView.vue') },
    // ... 其他路由
  ]
})

export default router
```

---

## 🔗 通信机制

### **方案 1：全局 Actions（官方推荐）**

#### **主应用发送**

```typescript
// my-vue-project/src/qiankun.js
const actions = initGlobalState({
  userInfo: null,
  isLoggedOut: false
})

// 传递给子应用
props: {
  setGlobalState: actions.setGlobalState,
  onGlobalStateChange: actions.onGlobalStateChange
}
```

#### **主应用触发事件**

```typescript
// my-vue-project/src/App.vue
import { eventManager } from './utils/eventManager'

eventManager.emit('user-logout', {
  timestamp: Date.now()
})
```

#### **子应用监听**

```typescript
// child-vue-project/src/main.ts
if (props?.onGlobalStateChange) {
  eventAdapter.init(props.onGlobalStateChange)
  
  eventAdapter.on('user-logout', (data) => {
    userStore.clearUserInfo()
  })
}
```

### **方案 2：Props 传递**

```typescript
// 主应用
props: {
  userInfo: authStore.userInfo,
  token: localStorage.getItem('token')
}

// 子应用接收
if (props?.userInfo) {
  userStore.initFromProps(props)
}
```

---

## 🐛 问题与解决方案

### **问题 1：容器不存在错误**

#### **错误信息**
```
Target container with #container not existed while son-vue3 loading!
```

#### **原因**
在路由挂载前就注册了 qiankun，容器尚未创建。

#### **解决方案**
```typescript
// ✅ 正确：等待路由准备完成
router.isReady().then(() => {
  registerQiankunApps()
})

// ✅ 在注册时检查容器
if (!document.querySelector('#container')) {
  console.warn('[qiankun] 容器不存在，延迟注册')
  return
}
```

---

### **问题 2：路由模式冲突**

#### **错误信息**
- 子应用路由不跳转
- 404 错误
- 只显示导航栏，内容区域空白

#### **原因**
主应用使用 History 模式，子应用也使用 History 模式，路由冲突。

#### **解决方案**
```typescript
// ✅ 子应用路由使用 Hash 模式
history: qiankunWindow.__POWERED_BY_QIANKUN__ 
  ? createWebHashHistory() 
  : createWebHistory()
```

**URL 示例：**
- 主应用：`http://localhost:5173/son-vue3`
- 子应用内部路由：`http://localhost:5173/son-vue3#/user-management`

---

### **问题 3：样式冲突**

#### **错误信息**
- 样式不生效
- 样式覆盖问题

#### **解决方案**
```typescript
// qiankun.js
start({
  sandbox: {
    strictStyleIsolation: false,  // 关闭严格隔离
    experimentalStyleIsolation: false
  }
})
```

---

### **问题 4：子应用名称不一致**

#### **错误信息**
```
application 'son-vue3' died in status LOADING_SOURCE_CODE
```

#### **原因**
主应用的 `name` 与子应用 vite-plugin-qiankun 配置不一致。

#### **解决方案**
```typescript
// ✅ 主应用
registerMicroApps([
  {
    name: 'son-vue3',  // 必须一致
    // ...
  }
])

// ✅ 子应用 vite.config.ts
qiankun(`son-vue3`, {  // 必须一致
  useDevMode: true
})
```

---

### **问题 5：CORS 跨域问题**

#### **错误信息**
- 子应用加载失败
- CORS policy 错误

#### **解决方案**
```typescript
// ✅ 子应用 vite.config.ts
server: {
  port: 5174,
  cors: true,
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}
```

---

### **问题 6：Element Plus 组件报错**

#### **错误信息**
```
Failed to resolve component: el-button
```

#### **原因**
子应用未正确引入 Element Plus。

#### **解决方案**
```typescript
// ✅ 子应用 main.ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

instance.use(ElementPlus)

// 注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  instance.component(key, component)
}
```

---

### **问题 7：生命周期函数错误**

#### **错误信息**
```
The requested module does not provide an export named 'createHashHistory'
```

#### **解决方案**
```typescript
// ❌ 错误
import { createHashHistory } from 'vue-router'

// ✅ 正确
import { createWebHashHistory } from 'vue-router'
```

---

## ✅ 最佳实践

### **1. 命名规范**

| 配置项 | 要求 |
|--------|------|
| **应用名称** | 主应用 `name` 与子应用 vite-plugin-qiankun 名称必须一致 |
| **端口号** | 主应用 `entry` 端口与子应用 `server.port` 必须一致 |
| **容器 ID** | 主应用 `container` 与子应用挂载容器必须一致 |

### **2. 路由策略**

- **主应用**：使用 History 模式
- **子应用**：qiankun 环境使用 Hash 模式，独立运行使用 History 模式

### **3. 状态管理**

- 使用全局 Actions 传递基础数据（用户信息、配置等）
- 使用事件管理器传递事件通知（退出登录、数据刷新等）

### **4. 生命周期管理**

- 确保容器存在后再注册 qiankun
- 子应用卸载时清空容器内容
- 监听路由变化，控制子应用激活/卸载

### **5. 开发调试**

- 开启生命周期日志，方便调试
- 检查控制台错误信息
- 使用 Network 面板检查资源加载

---

## 📊 配置检查清单

### **主应用检查项**

- [ ] 安装 `qiankun` 依赖
- [ ] `qiankun.js` 中配置了正确的 `name`、`entry`、`container`
- [ ] `router.isReady()` 后再注册 qiankun
- [ ] 容器 `#container` 存在于路由组件中
- [ ] 全局 Actions 已初始化并传递给子应用

### **子应用检查项**

- [ ] 安装 `vite-plugin-qiankun` 依赖
- [ ] `vite.config.ts` 中配置了正确的应用名称和端口
- [ ] `public-path.js` 已创建并导入
- [ ] `main.ts` 中导出了生命周期函数
- [ ] 路由在 qiankun 环境使用 Hash 模式
- [ ] CORS 配置正确
- [ ] Element Plus 已正确引入

---

## 🎯 关键文件清单

### **主应用**
- `src/qiankun.js` - qiankun 配置
- `src/main.ts` - 应用入口（延迟注册）
- `src/router/index.ts` - 路由配置（子应用路由）
- `src/views/MicroAppView.vue` - 容器组件
- `src/utils/eventManager.ts` - 事件管理器

### **子应用**
- `vite.config.ts` - Vite 配置（qiankun 插件）
- `src/public-path.js` - 动态路径配置
- `src/main.ts` - 应用入口（生命周期）
- `src/router/index.ts` - 路由配置（Hash 模式）
- `src/utils/eventAdapter.ts` - 事件适配器

---

## 📝 总结

### **核心要点**

1. ✅ **命名一致性**：应用名称、端口号、容器 ID 必须完全一致
2. ✅ **路由策略**：子应用在 qiankun 环境必须使用 Hash 模式
3. ✅ **生命周期**：确保容器存在后再注册，卸载时清理
4. ✅ **通信机制**：使用全局 Actions + 事件管理器实现跨应用通信
5. ✅ **错误处理**：完善的容器检查、错误捕获和日志输出

### **技术亮点**

- 🔄 基于 qiankun Actions 的事件管理器
- 🎯 类型安全的事件定义
- 🔧 简化的子应用事件适配器
- 📦 完整的生命周期管理
- 🐛 完善的错误处理和调试支持

---

## 🚀 下一步

- [ ] 扩展更多事件类型
- [ ] 实现子应用向主应用传递数据
- [ ] 优化预加载策略
- [ ] 添加性能监控
- [ ] 完善错误处理机制

---

**🎉 恭喜完成微前端集成！**

如有问题，请参考本文档或查看项目中的具体实现代码。

# ✅ Qiankun 微前端项目 - 最终状态

## 📋 项目结构

```
qiankun/
├── my-vue-project/          # 主应用
│   ├── src/
│   │   ├── main.ts         # 应用入口
│   │   ├── App.vue         # 根组件（后台布局）
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── views/          # 页面组件
│   │   └── qiankun.js      # qiankun 配置
│   └── package.json
│
└── child-vue-project/        # 子应用（用户中心）
    ├── src/
    │   ├── main.ts         # qiankun 生命周期
    │   ├── App.vue         # 子应用根组件
    │   ├── router/         # 子应用路由（hash 模式）
    │   ├── stores/         # 子应用状态管理
    │   └── views/          # 子应用页面
    └── package.json
```

---

## 🔧 修复的关键问题

### 1. **路由模式冲突** ✅
- **问题**：主应用使用 history 模式，子应用也使用 history 模式，导致路由冲突
- **解决**：子应用在 qiankun 环境中使用 hash 模式
```typescript
// child-vue-project/src/router/index.ts
history: window.__POWERED_BY_QIANKUN__ 
  ? createWebHashHistory() 
  : createWebHistory()
```

### 2. **容器挂载问题** ✅
- **问题**：子应用只显示导航栏，内容区域不显示
- **解决**：优化挂载逻辑，清空容器后再挂载
```typescript
if (mountContainer instanceof HTMLElement) {
  mountContainer.innerHTML = ''
}
instance.mount(mountContainer)
```

### 3. **Node.js 版本** ✅
- **问题**：Vite 需要 Node.js 20.19+ 或 22.12+
- **解决**：切换 node 版本
```bash
nvm use 22
```

### 4. **用户信息传递** ✅
- **方案**：通过 Pinia Store 管理用户信息
- **实现**：主应用通过 props 传递，子应用接收并存储

---

## 🚀 启动步骤

### 1. 确保 Node.js 版本
```bash
nvm use 22
# 或
nvm use 20.19
```

### 2. 启动子应用（端口 5174）
```bash
cd child-vue-project
npm run dev
```

### 3. 启动主应用（端口 5173）
```bash
cd my-vue-project
npm run dev
```

### 4. 访问流程
1. 打开主应用：http://localhost:5173
2. 登录（用户名：admin，密码：123456）
3. 点击左侧菜单"用户中心"
4. 点击"进入用户中心管理系统"按钮
5. 跳转到子应用，URL 变为 `/son-vue3#/`

---

## 📦 核心配置

### **主应用 (my-vue-project)**

#### qiankun.js
```javascript
import { registerMicroApps, start } from 'qiankun';

export function registerQiankunApps() {
  registerMicroApps([
    {
      name: 'son-vue3',
      entry: '//localhost:5174',
      container: '#container',
      activeRule: (location) => location.pathname.startsWith('/son-vue3'),
      props: {
        userInfo: authStore.userInfo,
        token: localStorage.getItem('token')
      }
    }
  ])
  
  start({
    sandbox: { strictStyleIsolation: false },
    singular: false
  })
}
```

#### 路由配置
- `/` - 首页
- `/users` - 用户中心
- `/son-vue3` - 子应用容器（跳转后 URL 变为 `/son-vue3#/`）
- `/login` - 登录页
- `/register` - 注册页

---

### **子应用 (child-vue-project)**

#### vite.config.ts
```typescript
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun(`son-vue3`, {
      useDevMode: true
    })
  ],
  server: {
    port: 5174,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

#### main.ts - qiankun 生命周期
```typescript
renderWithQiankun({
  bootstrap() {
    console.log('[child-vue-project] 子应用启动')
  },
  mount(props) {
    console.log('[child-vue-project] 子应用挂载')
    render(props)
  },
  update(props) {
    console.log('[child-vue-project] 子应用更新')
  },
  unmount(props) {
    console.log('[child-vue-project] 子应用卸载')
    if (instance) {
      instance.unmount()
      instance = null
    }
  }
})
```

#### 路由配置
```typescript
// 使用 hash 模式避免冲突
history: window.__POWERED_BY_QIANKUN__ 
  ? createWebHashHistory() 
  : createWebHistory()

routes: [
  { path: '/', name: 'home', component: HomeView },
  { path: '/user-management', name: 'user-management', component: UserListView },
  { path: '/job-management', name: 'job-management', component: JobListView },
  { path: '/department-management', name: 'department-management', component: DepartmentTreeView },
  { path: '/role-management', name: 'role-management', component: RoleListView }
]
```

---

## 🎯 当前状态

### ✅ 已完成
- [x] 主应用后台布局（顶部导航 + 左侧菜单）
- [x] 登录/注册/忘记密码功能
- [x] 子应用 qiankun 集成
- [x] 路由配置（hash 模式）
- [x] 用户信息传递
- [x] Element Plus UI 组件
- [x] Pinia 状态管理

### 🔄 待完善
- [ ] 子应用用户管理功能完善
- [ ] API 请求工具集成
- [ ] 权限控制实现
- [ ] 样式优化

---

## 📝 重要提示

1. **URL 变化**
   - 主应用：http://localhost:5173/son-vue3
   - 子应用加载后：http://localhost:5173/son-vue3#/
   - 子应用内部路由：http://localhost:5173/son-vue3#/user-management

2. **开发调试**
   - 打开浏览器控制台查看 qiankun 生命周期日志
   - 子应用导航栏正常显示说明挂载成功
   - 内容不显示检查路由配置和容器挂载

3. **常见问题**
   - **404 错误**：检查 qiankun activeRule 配置
   - **白屏**：检查容器是否存在
   - **路由不跳转**：检查 hash/history 模式配置

---

## 🎉 总结

项目已完成基本的 qiankun 微前端集成：
- ✅ 主应用可以加载子应用
- ✅ 子应用路由正常工作
- ✅ 用户信息可以传递
- ✅ 两个应用可以独立运行

**现在可以开始完善具体的业务功能了！** 🚀

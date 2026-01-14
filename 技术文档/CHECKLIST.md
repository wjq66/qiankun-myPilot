# 🚀 Qiankun 微前端完整配置指南

## ✅ 已完成的配置

### **主应用（my-vue-project）**

#### **1. main.ts** ✅
```typescript
import { registerQiankunApps } from './qiankun.js'
registerQiankunApps()
```

#### **2. qiankun.js** ✅
```typescript
registerMicroApps([
  {
    name: 'child-vue-project',
    entry: '//localhost:5174',
    container: '#container',
    activeRule: '/child-vue-project',
  }
]);
start();
```

#### **3. 路由配置** ✅
- ✅ 添加了 `/child-vue-project` 路由
- ✅ 创建了 `MicroAppView.vue` 容器组件
- ✅ 菜单项配置了"用户中心"跳转

#### **4. 菜单配置** ✅
- ✅ 左侧菜单添加"用户中心"项
- ✅ 点击跳转到子应用

---

### **子应用（child-vue-project）**

#### **1. main.ts** ✅
- ✅ 导出 qiankun 生命周期函数
- ✅ 支持独立运行
- ✅ 正确的容器挂载

#### **2. vite.config.ts** ✅
- ✅ 使用了 `vite-plugin-qiankun`
- ✅ 配置了开发端口 5174
- ✅ CORS 跨域支持
- ✅ UMD 格式构建

#### **3. 路由配置** ✅
- ✅ 使用 hash 模式（qiankun 环境）
- ✅ 使用 history 模式（独立运行）

---

## 🎯 配置清单

### **需要确认的配置**

#### **子应用需要安装依赖**
```bash
cd child-vue-project
npm install vite-plugin-qiankun
```

#### **主应用需要配置 qiankun**
已经安装，检查 `package.json` 中是否有 `qiankun`

---

## 📋 启动步骤

### **1. 启动子应用**
```bash
cd child-vue-project
npm run dev
```
访问：http://localhost:5174

### **2. 启动主应用**
```bash
cd my-vue-project
npm run dev
```
访问：http://localhost:5173

### **3. 访问子应用**
在主应用中点击"用户中心"菜单，会自动加载子应用

---

## 🔍 检查要点

### **主应用检查**
- ✅ App.vue 中有容器 `<div id="container"></div>`
- ✅ 路由配置了 `/child-vue-project` 路由
- ✅ qiankun 已配置并启动
- ✅ 菜单项正确配置

### **子应用检查**
- ✅ main.ts 导出生命周期函数
- ✅ vite.config.ts 使用 qiankun 插件
- ✅ 路由使用 hash 模式（qiankun 环境）
- ✅ public-path.js 配置正确

---

## 🐛 常见问题

### **问题1：子应用加载失败**
- 检查子应用是否在 5174 端口运行
- 检查 CORS 配置
- 检查 entry 路径是否正确

### **问题2：路由跳转问题**
- 确认子应用使用 hash 路由
- 确认主应用路由正确配置

### **问题3：样式丢失**
- 检查子应用的 CSS 是否正确加载
- 检查 Element Plus 样式

---

## 🎯 当前状态

### **主应用** ✅
- 后台布局完成
- 顶部导航栏
- 左侧菜单栏
- qiankun 配置完成

### **子应用** ✅
- 用户中心功能完整
- 用户/岗位/部门/角色管理
- 批量操作功能
- qiankun 配置完成

### **集成** ✅
- 路由配置完成
- 菜单跳转完成
- 容器页面完成

**现在可以启动项目测试了！** 🚀

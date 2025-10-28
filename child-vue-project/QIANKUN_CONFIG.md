# 🎯 Qiankun 子应用配置说明

## ✅ 已完成配置

### **1. main.ts 配置** ✅
- ✅ 导出生命周期函数（bootstrap, mount, unmount）
- ✅ 支持独立运行
- ✅ 动态容器挂载
- ✅ 正确的卸载逻辑

### **2. vite.config.ts 配置** ✅
- ✅ 端口设置（5174）
- ✅ CORS 跨域
- ✅ Base 路径配置

### **3. public-path.js** ✅
- ✅ 动态 publicPath
- ✅ 支持主应用注入路径

### **4. 全局类型声明** ✅
- ✅ TypeScript 支持
- ✅ Window 接口扩展

---

## 🎯 关键代码说明

### **main.ts 核心逻辑**

```typescript
let instance: AppInstance | null = null

// 渲染函数
function render(props: any = {}) {
  const { container } = props
  const mountContainer = container 
    ? container.querySelector('#app')  // qiankun 模式
    : document.querySelector('#app')    // 独立运行
  
  instance = createApp(App)
  instance.use(createPinia())
  instance.use(router)
  instance.use(ElementPlus)
  instance.mount(mountContainer)
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// Qiankun 生命周期
export async function bootstrap() { /* ... */ }
export async function mount(props) { render(props) }
export async function unmount() { instance.unmount() }
```

---

## 🚀 启动方式

### **方式1：独立运行**
```bash
cd child-vue-project
npm run dev
# 访问 http://localhost:5174
```

### **方式2：作为微应用运行**
```bash
# 启动主应用
cd my-vue-project
npm run dev

# 启动子应用
cd child-vue-project
npm run dev

# 访问 http://localhost:5173/child-vue-project
```

---

## 📋 主应用配置要点

主应用（my-vue-project）需要：

```typescript
registerMicroApps([
  {
    name: 'child-vue-project',
    entry: '//localhost:5174',
    container: '#container',
    activeRule: '/child-vue-project',
  },
]);

start();
```

注意：主应用的容器元素需要存在：
```vue
<div id="container"></div>
```

---

## ✅ 检查清单

- ✅ main.ts 导出生命周期函数
- ✅ 支持独立运行和微应用运行
- ✅ Vite 配置端口和 CORS
- ✅ public-path.js 动态路径
- ✅ 主应用注册子应用
- ✅ 容器元素存在

现在子应用已经可以正常工作了！🎉

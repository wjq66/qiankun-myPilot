# 🎯 面试问题：UMD 构建是怎么实现的

## 📚 完整回答思路

---

## 1️⃣ 首先说明什么是 UMD

**一句话回答**：
UMD（Universal Module Definition）是一种通用的模块定义格式，它可以在浏览器、Node.js、AMD、CommonJS 等多种环境中运行。

**深入说明**：
```javascript
// UMD 格式的核心特点：
// 1. 兼容多种模块系统
// 2. 可以作为全局变量使用
// 3. 支持浏览器直接通过 <script> 标签引入
```

---

## 2️⃣ 为什么微前端需要 UMD？

**关键点**：
- qiankun 需要将子应用作为**全局变量**加载
- UMD 格式可以**独立运行**，不依赖外部模块系统
- 浏览器环境可以直接**动态加载和执行**

**回答示例**：
```
微前端架构中，主应用需要动态加载子应用。qiankun 的工作原理是：
1. 通过 fetch 加载子应用的 JS 文件
2. 通过 eval 或 Function 构造函数执行代码
3. 期望子应用暴露为全局变量（如 window.son-vue3）

如果使用 ES Module 格式，浏览器无法直接执行，需要模块打包器的支持。
UMD 格式既可以作为模块使用，也可以作为全局变量，正好满足这个需求。
```

---

## 3️⃣ 在 Vite 中如何配置 UMD

### **配置文件**

```typescript
// child-vue-project/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'umd',        // ✅ 关键：指定输出格式为 UMD
        name: 'son-vue3',     // ✅ 关键：全局变量名（必须与 qiankun 注册的 name 一致）
        entryFileNames: `static/js/[name]-[hash].js`,
        chunkFileNames: `static/js/[name]-[hash].js`,
        assetFileNames: `static/[ext]/[name]-[hash].[ext]`,
      },
    },
  },
})
```

---

## 4️⃣ UMD 构建的实现原理

### **构建后的代码结构**

```javascript
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, 
   factory(global.son-vue3 = {}));  // ✅ 这里就是全局变量
}(this, (function (exports) {
  'use strict';

  // 子应用的代码
  // Vue 组件、路由、业务逻辑等
  // ...
  
  // 导出生命周期函数
  exports.bootstrap = bootstrap;
  exports.mount = mount;
  exports.unmount = unmount;
})));
```

### **工作原理图解**

```
构建阶段：
源码 (ES Module) 
  ↓ Vite/Rollup
  ↓ 
UMD 格式的 JS 文件
  ↓ 包含
  - 模块检测逻辑（AMD/CommonJS/全局变量）
  - 全局变量名（window.son-vue3）
  - 实际代码内容

运行阶段：
qiankun 加载 
  ↓ fetch('http://localhost:5174/index.js')
  ↓ 执行代码
  ↓ 
子应用暴露为全局变量
  ↓ window.son-vue3 = { bootstrap, mount, unmount }
  ↓
qiankun 调用生命周期函数
```

---

## 5️⃣ 关键配置项说明

### **format: 'umd'**
指定 Rollup 输出格式为 UMD

### **name: 'son-vue3'**
- 全局变量名称
- **必须**与 qiankun 注册时的 `name` 一致
- qiankun 通过 `window[name]` 获取子应用

### **完整配置示例**

```typescript
export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
        format: 'umd',                    // UMD 格式
        name: 'son-vue3',                 // 全局变量名
        entryFileNames: `[name]-[hash].js`,
        globals: {
          vue: 'Vue',                     // 外部依赖的全局变量名
        },
      },
      external: ['vue', 'vue-router'],   // 可选：外部依赖（如果使用 CDN）
    },
  },
})
```

---

## 6️⃣ 验证 UMD 构建是否成功

### **方法 1：检查构建产物**

```bash
# 构建后
npm run build

# 查看 dist 目录下的 JS 文件
cat dist/static/js/main-xxx.js | head -20

# 应该看到类似这样的代码：
# (function (global, factory) { ... })(this, (function (exports) { ... }))
```

### **方法 2：浏览器控制台**

```javascript
// 在浏览器中直接访问子应用的 index.html
// 打开控制台，应该能看到：
window.son-vue3  // ✅ 存在说明 UMD 构建成功
```

---

## 7️⃣ 常见问题和解决方案

### **问题 1：找不到全局变量**

**原因**：`name` 配置与 qiankun 注册不一致

**解决**：
```typescript
// vite.config.ts
name: 'son-vue3',  // ✅ 必须一致

// qiankun.js
registerMicroApps([{
  name: 'son-vue3',  // ✅ 必须一致
}])
```

### **问题 2：依赖未正确打包**

**原因**：某些依赖被标记为 external

**解决**：
```typescript
// 移除 external 配置，让所有依赖都打包进去
rollupOptions: {
  // external: ['vue'],  // ❌ 删除这行
}
```

---

## 🎯 面试回答模板（1-2分钟版本）

### **简洁版回答**：

```
UMD（Universal Module Definition）是一种通用模块格式，可以在多种环境中运行。

在微前端中，qiankun 需要将子应用作为全局变量加载和执行。我通过在 Vite 的配置中：

1. 设置 build.rollupOptions.output.format 为 'umd'
2. 设置 name 为子应用名称（如 'son-vue3'）
3. 这样构建出来的 JS 文件会暴露为全局变量 window.son-vue3

构建后的代码会自动包含模块检测逻辑，既能作为模块使用，也能作为全局变量，正好满足 qiankun 动态加载子应用的需求。
```

### **详细版回答**：

```
UMD 是一种通用模块格式，可以在浏览器、Node.js、AMD、CommonJS 等多种环境中运行。

在微前端架构中，qiankun 的工作原理是动态加载子应用的 JS 文件并执行，期望子应用暴露为全局变量。

我实现的方式是：

1. 在 Vite 配置中设置输出格式：
   - format: 'umd' - 指定为 UMD 格式
   - name: 'son-vue3' - 设置全局变量名，必须与 qiankun 注册的 name 一致

2. 构建后的代码结构：
   - 外层是立即执行函数，检测当前的模块环境
   - 自动适配 AMD、CommonJS、全局变量等多种方式
   - 将子应用的代码包装为全局变量 window.son-vue3

3. qiankun 加载流程：
   - 通过 fetch 加载子应用的 JS 文件
   - 执行代码，子应用暴露为 window.son-vue3
   - qiankun 通过 window[name] 获取并调用生命周期函数

这样设计的优势是：
- 子应用可以独立运行，也可以在微前端环境中运行
- 不需要额外的模块加载器
- 兼容性好，支持多种环境
```

---

## 📝 关键要点总结

1. ✅ **UMD 是什么**：通用模块格式，兼容多种环境
2. ✅ **为什么用 UMD**：qiankun 需要全局变量，UMD 可以满足
3. ✅ **如何配置**：Vite 的 rollupOptions.output.format 和 name
4. ✅ **工作原理**：构建时包装代码，运行时暴露全局变量
5. ✅ **注意事项**：name 必须与 qiankun 注册名称一致

---

## 💡 加分回答（如果时间允许）

**可以提到**：
- 了解其他构建格式的区别（ES Module、CommonJS）
- 知道如何验证 UMD 构建是否成功
- 遇到过配置错误并成功解决的经验

**示例**：
```
除了 UMD，我也了解 ES Module 和 CommonJS 的区别。在项目中遇到过一次因为 name 配置不一致导致子应用加载失败的问题，通过检查构建产物和对比配置解决。这让我深入理解了 UMD 的工作原理。
```

---

**🎉 准备充分，面试稳了！**

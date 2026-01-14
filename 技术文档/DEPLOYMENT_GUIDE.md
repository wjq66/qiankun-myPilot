# 🚀 微前端部署上线完整指南

> 本文档详细说明 Qiankun 微前端项目在生产环境部署时需要注意的所有关键点。

---

## 📋 目录

1. [构建配置](#构建配置)
2. [路径配置](#路径配置)
3. [部署环境配置](#部署环境配置)
4. [Nginx 配置](#nginx-配置)
5. [跨域处理](#跨域处理)
6. [版本管理](#版本管理)
7. [监控与日志](#监控与日志)
8. [安全检查](#安全检查)
9. [性能优化](#性能优化)
10. [回滚策略](#回滚策略)

---

## 🔧 构建配置

### **1. 主应用构建**

```bash
# my-vue-project
npm run build
```

#### **重要配置检查**

```javascript
// vite.config.ts (主应用)
export default defineConfig({
  base: '/',                    // ✅ 生产环境路径
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    // 确保资源路径正确
  }
})
```

---

### **2. 子应用构建**

```bash
# child-vue-project
npm run build
```

#### **关键配置**

```typescript
// child-vue-project/vite.config.ts
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper"

export default defineConfig({
  base: qiankunWindow.__POWERED_BY_QIANKUN__ 
    ? '/child-vue-project/'  // ✅ qiankun 环境下的基础路径
    : '/',                    // ✅ 独立运行时的基础路径
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,          // ⚠️ 生产环境关闭 sourcemap
    rollupOptions: {
      output: {
        format: 'umd',          // ✅ 必须使用 UMD 格式
        name: 'son-vue3',       // ✅ 必须与注册名称一致
        entryFileNames: `static/js/[name]-[hash].js`,
        chunkFileNames: `static/js/[name]-[hash].js`,
        assetFileNames: `static/[ext]/[name]-[hash].[ext]`,
      },
    },
  },
})
```

#### **⚠️ 关键点**

1. **UMD 格式**：子应用必须构建为 UMD 格式，否则 qiankun 无法加载
2. **应用名称**：`name` 必须与主应用注册的名称完全一致
3. **基础路径**：根据运行环境动态设置 `base`

---

## 📁 路径配置

### **1. public-path.js 配置**

```javascript
// child-vue-project/src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  // qiankun 环境：使用运行时注入的路径
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
} else {
  // 独立运行：使用构建时的 base 配置
  // Vite 会自动处理，无需手动设置
}
```

### **2. 主应用 entry 配置**

```javascript
// my-vue-project/src/qiankun.js

// 开发环境
const isDev = process.env.NODE_ENV === 'development'

registerMicroApps([
  {
    name: 'son-vue3',
    entry: isDev 
      ? '//localhost:5174'                    // ✅ 开发环境
      : 'https://child-app.example.com',     // ✅ 生产环境（完整域名）
    // 或使用相对路径
    // entry: '/child-vue-project/',         // ✅ 同域名下
    container: '#container',
    activeRule: '/child-vue-project',
    // ...
  }
])
```

#### **entry 路径选择**

| 场景 | 配置 | 说明 |
|------|------|------|
| **开发环境** | `//localhost:5174` | 本地开发服务器 |
| **生产同域名** | `/child-vue-project/` | 相对路径，自动识别协议和域名 |
| **生产跨域名** | `https://child-app.example.com` | 完整 URL |

---

## 🌐 部署环境配置

### **场景 1：同域名部署（推荐）**

#### **目录结构**
```
/var/www/html/
├── index.html              # 主应用入口
├── static/                 # 主应用静态资源
├── child-vue-project/      # 子应用目录
│   ├── index.html          # 子应用入口（可选）
│   └── static/             # 子应用静态资源
└── ...
```

#### **主应用 entry 配置**
```javascript
entry: '/child-vue-project/',  // 相对路径
```

#### **子应用 base 配置**
```typescript
base: qiankunWindow.__POWERED_BY_QIANKUN__ 
  ? '/child-vue-project/'      // ✅ 与目录路径一致
  : '/',
```

---

### **场景 2：跨域名部署**

#### **域名分配**
- 主应用：`https://main-app.example.com`
- 子应用：`https://child-app.example.com`

#### **主应用 entry 配置**
```javascript
entry: 'https://child-app.example.com',
```

#### **⚠️ 跨域问题**
必须配置 CORS（见下方 Nginx 配置）

---

## 🔌 Nginx 配置

### **主应用 Nginx 配置**

```nginx
server {
    listen 80;
    server_name main-app.example.com;
    
    # 主应用根目录
    root /var/www/html/main-app/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 子应用代理（如果同域名）
    location /child-vue-project/ {
        alias /var/www/html/child-vue-project/dist/;
        try_files $uri $uri/ /child-vue-project/index.html;
        
        # 子应用需要的响应头
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }
}
```

---

### **子应用 Nginx 配置（独立部署）**

```nginx
server {
    listen 80;
    server_name child-app.example.com;
    
    # 子应用根目录
    root /var/www/html/child-vue-project/dist;
    index index.html;
    
    # ✅ 关键：允许跨域
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    
    # OPTIONS 预检请求
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    # 支持 index.html 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # ✅ 重要：确保 HTML 文件不被缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

---

## 🌍 跨域处理

### **问题场景**

当主应用和子应用不在同一域名下时，会遇到 CORS 问题。

### **解决方案**

#### **方案 1：Nginx 配置 CORS 头（推荐）**

```nginx
# 子应用 Nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
```

#### **方案 2：子应用 Vite 配置**

```typescript
// vite.config.ts
server: {
  cors: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  }
}
```

⚠️ **注意**：生产环境建议限制 `Access-Control-Allow-Origin` 为特定域名，而不是 `*`

---

## 📦 版本管理

### **问题**

子应用更新后，浏览器可能缓存旧版本。

### **解决方案**

#### **1. HTML 文件不缓存**

```nginx
location ~* \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

#### **2. 静态资源使用 hash**

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: `static/js/[name]-[hash].js`,
      chunkFileNames: `static/js/[name]-[hash].js`,
      assetFileNames: `static/[ext]/[name]-[hash].[ext]`,
    },
  },
}
```

#### **3. 版本号管理**

```javascript
// qiankun.js
registerMicroApps([
  {
    name: 'son-vue3',
    entry: `//child-app.example.com/v${APP_VERSION}/`,  // 版本化路径
    // ...
  }
])
```

---

## 📊 监控与日志

### **1. 错误监控**

```javascript
// my-vue-project/src/qiankun.js
registerMicroApps([...], {
  beforeLoad: [(app) => {
    console.log('[主应用] 开始加载', app.name)
    // 发送监控日志
    sendMonitorLog('micro-app-loading', app.name)
  }],
  beforeMount: [(app) => {
    console.log('[主应用] 开始挂载', app.name)
  }],
  afterMount: [(app) => {
    console.log('[主应用] 挂载完成', app.name)
    sendMonitorLog('micro-app-mounted', app.name)
  }],
  beforeUnmount: [(app) => {
    console.log('[主应用] 开始卸载', app.name)
  }],
  afterUnmount: [(app) => {
    console.log('[主应用] 卸载完成', app.name)
  }],
  // ✅ 错误处理
  onError: (error) => {
    console.error('[主应用] 子应用错误:', error)
    // 发送错误日志到监控系统
    sendErrorLog('micro-app-error', error)
  }
})

start({
  // ...
  // ✅ 全局错误处理
  onGlobalStateChange: (state, prev) => {
    // 监控状态变化
  }
})
```

### **2. 性能监控**

```javascript
// 监控子应用加载时间
const loadStartTime = Date.now()

beforeLoad: [(app) => {
  window.__LOAD_START_TIME__ = Date.now()
}],

afterMount: [(app) => {
  const loadTime = Date.now() - window.__LOAD_START_TIME__
  console.log(`[监控] 子应用 ${app.name} 加载耗时: ${loadTime}ms`)
  // 发送性能数据
  sendPerformanceData({
    app: app.name,
    loadTime,
    timestamp: Date.now()
  })
}]
```

---

## 🔒 安全检查

### **1. CSP（内容安全策略）**

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
```

### **2. HTTPS**

生产环境必须使用 HTTPS，确保数据传输安全。

### **3. XSS 防护**

- 使用 Vue 的模板语法自动转义
- 避免使用 `v-html` 渲染用户输入
- 对传入子应用的 props 进行验证

### **4. 资源完整性校验**

```html
<script 
  src="/child-vue-project/static/js/main.js"
  integrity="sha384-..."
  crossorigin="anonymous">
</script>
```

---

## ⚡ 性能优化

### **1. 资源压缩**

```typescript
// vite.config.ts
build: {
  minify: 'terser',      // 代码压缩
  terserOptions: {
    compress: {
      drop_console: true,  // 移除 console
      drop_debugger: true,
    },
  },
  rollupOptions: {
    output: {
      manualChunks: {
        // 代码分割
        'vendor': ['vue', 'vue-router', 'pinia'],
      },
    },
  },
}
```

### **2. 预加载优化**

```javascript
// qiankun.js
start({
  prefetch: false,  // ⚠️ 关闭预加载，按需加载
  // 或
  prefetch: 'all',  // 预加载所有（根据需求选择）
})
```

### **3. CDN 加速**

```nginx
location /static/ {
    # 使用 CDN
    proxy_pass https://cdn.example.com;
    
    # 或直接配置 CDN 域名
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔄 回滚策略

### **方案 1：版本化部署**

```
/var/www/html/
├── main-app-v1.0.0/
├── main-app-v1.0.1/  # 当前版本
└── main-app/ -> main-app-v1.0.1/  # 软链接
```

出现问题时可快速切换：

```bash
ln -sfn main-app-v1.0.0 main-app
nginx -s reload
```

### **方案 2：备份构建产物**

每次构建前备份：

```bash
# 部署脚本
cp -r dist dist.backup.$(date +%Y%m%d%H%M%S)
npm run build
# 如果部署失败，恢复备份
```

---

## ✅ 部署检查清单

### **构建前**

- [ ] 检查 `vite.config.ts` 中的 `base` 配置
- [ ] 确认子应用使用 UMD 格式
- [ ] 验证应用名称一致性
- [ ] 检查环境变量配置

### **构建后**

- [ ] 检查构建产物完整性
- [ ] 验证静态资源路径
- [ ] 测试独立访问子应用
- [ ] 检查 HTML 文件中的资源路径

### **部署后**

- [ ] 验证主应用可访问
- [ ] 验证子应用可访问（独立访问）
- [ ] 验证主应用可以加载子应用
- [ ] 检查控制台无错误
- [ ] 测试路由跳转
- [ ] 验证通信机制（事件、状态）
- [ ] 检查跨域配置（如需要）
- [ ] 验证静态资源加载
- [ ] 测试不同浏览器

---

## 🎯 部署流程示例

### **1. 构建**

```bash
# 主应用
cd my-vue-project
npm run build
# 产物在 dist/ 目录

# 子应用
cd child-vue-project
npm run build
# 产物在 dist/ 目录
```

### **2. 上传**

```bash
# 上传主应用
scp -r dist/* user@server:/var/www/html/main-app/

# 上传子应用（同域名）
scp -r dist/* user@server:/var/www/html/child-vue-project/

# 或（跨域名）
scp -r dist/* user@server:/var/www/html/child-app/
```

### **3. 配置 Nginx**

根据部署方案配置 Nginx，参考上方配置。

### **4. 测试**

```bash
# 测试主应用
curl https://main-app.example.com

# 测试子应用
curl https://child-app.example.com
# 或
curl https://main-app.example.com/child-vue-project/
```

---

## 🐛 常见部署问题

### **问题 1：资源 404**

#### **原因**
路径配置不正确。

#### **解决**
```javascript
// 检查 base 配置
base: '/child-vue-project/'  // 必须与部署路径一致
```

---

### **问题 2：子应用加载失败**

#### **原因**
- entry 路径错误
- CORS 未配置
- UMD 格式未正确构建

#### **解决**
1. 检查 entry 配置
2. 配置 Nginx CORS 头
3. 确认构建为 UMD 格式

---

### **问题 3：路由不工作**

#### **原因**
Hash 路由配置错误。

#### **解决**
```typescript
// 确保子应用使用 Hash 路由
history: qiankunWindow.__POWERED_BY_QIANKUN__ 
  ? createWebHashHistory() 
  : createWebHistory()
```

---

### **问题 4：样式丢失**

#### **原因**
CSS 文件路径错误或未加载。

#### **解决**
- 检查 `public-path.js` 配置
- 验证 CSS 文件路径
- 检查 Nginx 配置允许加载 CSS

---

## 📝 总结

### **关键要点**

1. ✅ **路径一致性**：base、entry、部署路径必须一致
2. ✅ **UMD 格式**：子应用必须构建为 UMD
3. ✅ **CORS 配置**：跨域名部署必须配置 CORS
4. ✅ **版本管理**：HTML 不缓存，静态资源使用 hash
5. ✅ **错误处理**：完善的监控和日志
6. ✅ **性能优化**：压缩、CDN、按需加载

### **推荐部署方案**

- **小团队**：同域名部署，简单易维护
- **大团队**：跨域名部署，独立发布
- **高可用**：版本化部署 + 回滚机制

---

**🎉 部署顺利！如有问题，参考本文档或查看实际构建产物。**

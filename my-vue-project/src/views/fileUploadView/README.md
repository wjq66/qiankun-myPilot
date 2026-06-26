# 大文件上传功能设计总结

## 📁 文件结构

```
src/
├── views/
│   └── fileUploadView/
│       ├── index.vue                    # 主组件（UI展示）
│       └── composables/
│           ├── useFileList.ts          # 文件列表管理
│           ├── useDragAndDrop.ts       # 拖拽处理
│           └── useFileUpload.ts        # 上传控制
├── classes/
│   └── uploadFile.ts                  # 文件上传任务类
└── utils/
    └── fileUtils.ts                    # 工具函数
```

## 🎯 设计思路总结

### 1. Class（类）的职责

**FileUploadTask** - 单个文件的上传任务

**为什么用 Class？**
- ✅ 每个文件是独立对象，有自己的状态和行为
- ✅ 可以创建多个实例，互不干扰
- ✅ 便于管理生命周期（开始、暂停、继续、取消）

**职责：**
- 管理单个文件的上传状态（进度、状态、分片列表）
- 处理分片创建、上传、合并
- 支持断点续传
- 更新进度和状态（通过回调）

### 2. Composition（组合式函数）的职责

#### useFileList - 文件列表管理
**为什么放在 Composition？**
- ✅ fileList 是响应式状态，需要在模板中使用
- ✅ 这些方法是对列表的操作，不是单个文件的操作
- ✅ 可以在多个组件中复用

**职责：**
- 管理文件列表（添加、删除、清空）
- 计算总大小
- 根据ID查找文件

#### useDragAndDrop - 拖拽处理
**为什么放在 Composition？**
- ✅ 拖拽状态是 UI 相关的响应式状态
- ✅ 拖拽逻辑可以在多个组件中复用

**职责：**
- 管理拖拽状态（isDragOver）
- 处理拖拽事件（dragOver、drop、dragLeave）

#### useFileUpload - 上传控制
**为什么放在 Composition？**
- ✅ 需要管理多个任务实例（Map）
- ✅ 批量操作需要协调多个任务
- ✅ 连接 Class 和响应式状态

**职责：**
- 创建和管理 FileUploadTask 实例
- 批量操作（上传所有、暂停所有）
- 更新响应式状态（通过回调）

### 3. Utils（工具函数）的职责

**为什么放在 Utils？**
- ✅ 纯函数，无状态
- ✅ 可以在任何地方调用
- ✅ 易于测试

**职责：**
- 格式化文件大小
- 生成文件ID
- 创建文件分片
- 计算文件hash

## 🔄 数据流向

```
用户操作（点击/拖拽）
  ↓
Vue 组件（index.vue）
  ↓
Composition（useFileList / useDragAndDrop）
  ↓
添加文件到 fileList
  ↓
用户点击"开始上传"
  ↓
Composition（useFileUpload）
  ↓
创建 FileUploadTask 实例
  ↓
调用 task.start()
  ↓
Class 内部处理上传逻辑
  ├─ 创建分片
  ├─ 检查已上传分片（断点续传）
  ├─ 上传分片（并发控制）
  └─ 合并分片
  ↓
通过回调更新进度/状态
  ↓
Composition 更新响应式状态
  ↓
Vue 组件自动更新 UI
```

## 📝 使用示例

### 在组件中使用

```typescript
<script setup lang="ts">
import { ref } from 'vue'
import { useFileList } from './composables/useFileList'
import { useDragAndDrop } from './composables/useDragAndDrop'
import { useFileUpload } from './composables/useFileUpload'

// 1. 文件列表管理
const { fileList, totalSize, addFiles, removeFile, clearAll } = useFileList()

// 2. 拖拽处理
const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = 
  useDragAndDrop(addFiles)

// 3. 上传控制
const { 
  startUpload, 
  pauseUpload, 
  resumeUpload, 
  retryUpload,
  uploadAll, 
  pauseAll 
} = useFileUpload(fileList, (file) => {
  // 进度更新回调（可选）
  console.log('进度更新:', file.progress)
})

// 4. 文件选择处理
const fileInputRef = ref<HTMLInputElement | null>(null)
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    addFiles(Array.from(files))
  }
}

// 5. 删除文件（需要先取消上传）
const handleRemoveFile = (id: string) => {
  removeFile(id, (file) => {
    // 如果正在上传，先取消
    if (file.status === 'uploading' || file.status === 'paused') {
      pauseUpload(file)
    }
  })
}
</script>
```

## ✅ 已修复的问题

### 1. useFileList.ts
- ✅ 修复了 `removeFile` 中未定义的 `index` 变量
- ✅ 修复了 `generateFileId` 未导入的问题
- ✅ 实现了 `clearAll` 和 `getFileById` 方法
- ✅ 添加了 `onBeforeRemove` 回调参数

### 2. useDragAndDrop.ts
- ✅ 添加了 `handleDragLeave` 到返回值
- ✅ 完善了注释

### 3. useFileUpload.ts
- ✅ 修复了 `Ref` 类型导入
- ✅ 修复了参数类型问题
- ✅ 实现了真正的任务实例管理
- ✅ 添加了 `resumeUpload`、`retryUpload`、`cancelUpload` 方法
- ✅ 添加了 `cancelAll` 方法

### 4. fileUtils.ts
- ✅ 添加了 `ChunkInfo` 类型导入

## 🚀 下一步需要实现的功能

### 1. 服务器API集成
- [ ] 实现 `checkUploadedChunks()` - 检查已上传分片
- [ ] 实现 `uploadChunk()` - 上传单个分片
- [ ] 实现 `mergeChunks()` - 合并分片

### 2. Hash计算
- [ ] 实现 `calculateFileHash()` - 计算文件hash
- [ ] 实现 `calculateChunkHash()` - 计算分片hash
- [ ] 考虑使用 Web Worker 进行大文件hash计算

### 3. 错误处理
- [ ] 实现重试机制
- [ ] 实现错误提示
- [ ] 实现网络中断处理

### 4. 性能优化
- [ ] 大文件hash计算使用 Web Worker
- [ ] 分片上传的并发控制优化
- [ ] 内存管理（大文件分片）

## 💡 设计原则

1. **单一职责原则**
   - Class 负责单个文件的上传逻辑
   - Composition 负责状态管理和批量操作
   - Utils 负责纯函数工具

2. **关注点分离**
   - UI 逻辑在组件中
   - 业务逻辑在 Class 中
   - 状态管理在 Composition 中

3. **可复用性**
   - Composition 可以在多个组件中复用
   - Utils 可以在任何地方使用
   - Class 可以独立使用

4. **可测试性**
   - 纯函数易于测试
   - Class 可以独立测试
   - Composition 可以模拟测试

## 📚 相关文档

- [FileUploadTask Class 设计说明](../classes/FileUploadTask设计说明.md)

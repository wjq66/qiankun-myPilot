<template>
  <div class="file-upload-container">
    <div class="upload-header">
      <h1 class="upload-title">
        <span class="icon">📤</span>
        大文件上传
      </h1>
      <p class="upload-subtitle">支持拖拽上传，自动分片处理</p>
    </div>

    <!-- 上传区域 -->
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'has-files': fileList.length > 0 }"
      @drop="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="file-input"
        multiple
        @change="handleFileSelect"
      />
      
      <div v-if="fileList.length === 0" class="upload-placeholder">
        <div class="upload-icon">📁</div>
        <p class="upload-text">点击或拖拽文件到此处上传</p>
        <p class="upload-hint">支持多文件上传，单个文件最大 10GB</p>
      </div>

      <div v-else class="upload-content">
        <div class="upload-stats">
          <span class="stat-item">
            <span class="stat-label">总文件数：</span>
            <span class="stat-value">{{ fileList.length }}</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">总大小：</span>
            <span class="stat-value">{{ formatFileSize(totalSize) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="file-list">
      <div
        v-for="(file, index) in fileList"
        :key="file.id"
        class="file-item"
        :class="{ 'uploading': file.status === 'uploading', 'success': file.status === 'success', 'error': file.status === 'error' }"
      >
        <div class="file-info">
          <div class="file-icon">
            <span v-if="file.status === 'pending'">📄</span>
            <span v-else-if="file.status === 'uploading'">⏳</span>
            <span v-else-if="file.status === 'success'">✅</span>
            <span v-else-if="file.status === 'error'">❌</span>
          </div>
          <div class="file-details">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span v-if="file.status === 'uploading'" class="file-speed">
                速度: {{ formatFileSize(file.speed || 0) }}/s
              </span>
            </div>
          </div>
        </div>

        <div class="file-actions">
          <!-- 进度条 -->
          <div v-if="file.status === 'uploading'" class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${file.progress || 0}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ file.progress || 0 }}%</span>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button
              v-if="file.status === 'pending'"
              class="btn btn-primary"
              @click.stop="startUpload(file)"
            >
              开始上传
            </button>
            <button
              v-if="file.status === 'uploading'"
              class="btn btn-pause"
              @click.stop="pauseUpload(file)"
            >
              暂停
            </button>
            <button
              v-if="file.status === 'paused'"
              class="btn btn-resume"
              @click.stop="resumeUpload(file)"
            >
              继续
            </button>
            <button
              v-if="file.status === 'error'"
              class="btn btn-retry"
              @click.stop="retryUpload(file)"
            >
              重试
            </button>
            <button
              class="btn btn-remove"
              @click.stop="handleRemoveFile(index)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量操作 -->
    <div v-if="fileList.length > 0" class="batch-actions">
      <button class="btn btn-primary" @click="uploadAll">
        全部上传
      </button>
      <button class="btn btn-secondary" @click="pauseAll">
        全部暂停
      </button>
      <button class="btn btn-danger" @click="handleClearAll">
        清空列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type UploadFile } from '../../classes/uploadFile'
import { useFileList } from './composables/useFileList'
import { useDragAndDrop } from './composables/useDragAndDrop'
import { useFileUpload } from './composables/useFileUpload'
import { useResumeUpload } from './composables/useResumeUpload'
import { formatFileSize } from '../../utils/fileUtils'

// 配置（可以从环境变量或配置文件中读取）
const config = {
  wsUrl: 'ws://localhost:3000/upload',
  uploadUrl: '/api/upload/chunk',
  chunkSize: 2 * 1024 * 1024, // 2MB
  concurrent: 3 // 并发数
}

// 文件列表管理
const { fileList, totalSize, addFiles, addFile, removeFile, clearAll } = useFileList()

// 拖拽处理
const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop((files: File[]) => {
  addFiles(Array.from(files))
})

// 上传操作的按钮
const { 
  startUpload, 
  pauseUpload, 
  resumeUpload, 
  retryUpload, 
  cancelUpload,
  pauseAll, 
  uploadAll,
  cancelAll 
} = useFileUpload(
  fileList, 
  (file: UploadFile) => {
    // 进度更新回调
    console.log(`文件 ${file.name} 进度: ${file.progress}%`)
  },
  {
    wsUrl: config.wsUrl,
    uploadUrl: config.uploadUrl,
    chunkSize: config.chunkSize,
    concurrent: config.concurrent
  }
)

// 恢复上传（组件挂载时自动检查）
useResumeUpload(fileList, addFile, startUpload)

// 响应式数据
const fileInputRef = ref<HTMLInputElement | null>(null)

 
 

// ==================== 文件选择相关方法 ====================

/**
 * 触发文件选择
 */
const triggerFileInput = (): void => {
  fileInputRef.value?.click()
}

/**
 * 处理文件选择
 */
const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    addFiles(Array.from(files))
    // 清空input，允许重复选择同一文件
    target.value = ''
  }
}
 
 

/**
 * 删除文件
 * @param index 文件索引
 */
const handleRemoveFile = (index: number): void => {
  const file = fileList.value[index]
  // 如果正在上传，先取消上传
  if (file.status === 'uploading' || file.status === 'paused') {
    cancelUpload(file)
  }
  removeFile(file.id, () => {
    // 删除前的回调，已经在上面的 cancelUpload 中处理了
  })
}

/**
 * 清空文件列表
 */
const handleClearAll = (): void => {
  // 取消所有上传任务
  cancelAll()
  // 清空列表
  clearAll(() => {
    // 清空前回调，已经在上面的 cancelAll 中处理了
  })
}

 
</script>

<style scoped lang="scss">
.file-upload-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.upload-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;

  .upload-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .icon {
      font-size: 40px;
    }
  }

  .upload-subtitle {
    font-size: 16px;
    opacity: 0.9;
  }
}

.upload-area {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  margin-bottom: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px dashed #e0e0e0;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
  }

  &.drag-over {
    border-color: #667eea;
    background: #f0f4ff;
    transform: scale(1.02);
  }

  &.has-files {
    padding: 30px 20px;
  }

  .file-input {
    display: none;
  }

  .upload-placeholder {
    text-align: center;

    .upload-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .upload-text {
      font-size: 20px;
      color: #333;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .upload-hint {
      font-size: 14px;
      color: #999;
    }
  }

  .upload-content {
    .upload-stats {
      display: flex;
      justify-content: center;
      gap: 30px;

      .stat-item {
        .stat-label {
          color: #666;
          margin-right: 5px;
        }

        .stat-value {
          color: #667eea;
          font-weight: bold;
        }
      }
    }
  }
}

.file-list {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  background: #f8f9fa;
  transition: all 0.3s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f0f4ff;
    transform: translateX(5px);
  }

  &.uploading {
    background: #e8f4fd;
    border-left: 4px solid #409eff;
  }

  &.success {
    background: #f0f9ff;
    border-left: 4px solid #67c23a;
  }

  &.error {
    background: #fef0f0;
    border-left: 4px solid #f56c6c;
  }

  .file-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;

    .file-icon {
      font-size: 32px;
      margin-right: 15px;
      flex-shrink: 0;
    }

    .file-details {
      flex: 1;
      min-width: 0;

      .file-name {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-meta {
        display: flex;
        gap: 15px;
        font-size: 14px;
        color: #666;

        .file-size {
          color: #999;
        }

        .file-speed {
          color: #409eff;
        }
      }
    }
  }

  .file-actions {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-shrink: 0;

    .progress-container {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 200px;

      .progress-bar {
        flex: 1;
        height: 8px;
        background: #e4e7ed;
        border-radius: 4px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #409eff, #67c23a);
          transition: width 0.3s ease;
          border-radius: 4px;
        }
      }

      .progress-text {
        font-size: 12px;
        color: #666;
        min-width: 40px;
        text-align: right;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &.btn-primary {
    background: #409eff;
    color: white;

    &:hover {
      background: #66b1ff;
    }
  }

  &.btn-pause {
    background: #e6a23c;
    color: white;

    &:hover {
      background: #ebb563;
    }
  }

  &.btn-resume {
    background: #67c23a;
    color: white;

    &:hover {
      background: #85ce61;
    }
  }

  &.btn-retry {
    background: #f56c6c;
    color: white;

    &:hover {
      background: #f78989;
    }
  }

  &.btn-remove {
    background: #f56c6c;
    color: white;

    &:hover {
      background: #f78989;
    }
  }

  &.btn-secondary {
    background: #909399;
    color: white;

    &:hover {
      background: #a6a9ad;
    }
  }

  &.btn-danger {
    background: #f56c6c;
    color: white;

    &:hover {
      background: #f78989;
    }
  }
}

.batch-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
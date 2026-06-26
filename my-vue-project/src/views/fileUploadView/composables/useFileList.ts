// 文件管理列表
import { ref, computed } from "vue"
import { type UploadFile } from "../../../classes/uploadFile"
import { generateFileId } from "../../../utils/fileUtils"

/**
 * 文件列表管理 Composition
 * 
 * 为什么放在这里？
 * - fileList 是响应式状态，需要在模板中使用
 * - 这些方法是对列表的操作，不是单个文件的操作
 * - 可以在多个组件中复用
 */
export function useFileList() {
  const fileList = ref<UploadFile[]>([])

  const totalSize = computed(() => {
    return fileList.value.reduce((sum, file) => sum + file.size, 0)
  })

  /**
   * 添加文件到列表
   */
  function addFiles(files: File[]) { 
    files.forEach(file => {
      const uploadFile: UploadFile = {
        id: generateFileId(),
        name: file.name,
        size: file.size,
        file: file,
        status: 'pending',
        progress: 0,
        chunkList: [],
        uploadedChunks: 0
      }
      fileList.value.push(uploadFile)
    })
  }

  /**
   * 添加单个 UploadFile 对象到列表（用于恢复上传）
   */
  function addFile(uploadFile: UploadFile) {
    fileList.value.push(uploadFile)
  }

  /**
   * 根据ID删除文件
   * @param id 文件ID
   * @param onBeforeRemove 删除前的回调，用于取消上传等操作
   */
  function removeFile(id: string, onBeforeRemove?: (file: UploadFile) => void) {
    const index = fileList.value.findIndex(file => file.id === id)
    if (index === -1) return
    
    const file = fileList.value[index]
    
    // 如果提供了删除前的回调，执行它（比如取消上传）
    if (onBeforeRemove) {
      onBeforeRemove(file)
    }
    
    fileList.value.splice(index, 1)
  }

  /**
   * 清空文件列表
   * @param onBeforeClear 清空前回调，用于取消所有上传
   */
  function clearAll(onBeforeClear?: (files: UploadFile[]) => void) {
    if (onBeforeClear) {
      onBeforeClear([...fileList.value])
    }
    fileList.value = []
  }

  /**
   * 根据ID获取文件
   */
  function getFileById(id: string): UploadFile | undefined {
    return fileList.value.find(file => file.id === id)
  }
  
  return {
    fileList,
    totalSize,
    addFiles,
    addFile,
    removeFile,
    clearAll,
    getFileById
  }
}
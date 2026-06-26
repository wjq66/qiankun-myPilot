/**
 * 恢复上传 Composition
 * 
 * 为什么放在这里？
 * - 恢复上传逻辑需要在组件初始化时执行
 * - 需要访问 fileList 和上传控制方法
 * - 可以在多个组件中复用
 */

import { onMounted } from 'vue'
import { indexedDBManager, type FileMetadata } from '../../../utils/indexedDB'
import type { UploadFile } from '../../../classes/uploadFile'
import { generateFileId } from '../../../utils/fileUtils'

/**
 * 恢复上传功能
 */
export function useResumeUpload(
  fileList: { value: UploadFile[] },
  addFile: (file: UploadFile) => void,
  startUpload: (file: UploadFile) => Promise<void>
) {
  /**
   * 检查并恢复未完成的上传
   */
  async function checkAndResume(): Promise<void> {
    try {
      // 初始化 IndexedDB
      await indexedDBManager.init()

      // 获取所有未完成的文件
      const incompleteFiles = await indexedDBManager.getIncompleteFiles()

      if (incompleteFiles.length === 0) {
        console.log('没有未完成的上传任务')
        return
      }

      console.log(`发现 ${incompleteFiles.length} 个未完成的上传任务`)

      // 为每个未完成的文件创建 UploadFile 对象
      for (const metadata of incompleteFiles) {
        // 检查文件是否已经在列表中
        const exists = fileList.value.find(f => f.id === metadata.fileId || f.fileHash === metadata.fileHash)
        if (exists) {
          console.log(`文件 ${metadata.fileName} 已在列表中，跳过`)
          continue
        }

        // 从 IndexedDB 加载分片信息
        const chunks = await indexedDBManager.getAllChunks(metadata.fileId)

        if (chunks.length === 0) {
          console.warn(`文件 ${metadata.fileName} 没有分片数据，跳过`)
          continue
        }

        // 创建 UploadFile 对象
        // 注意：由于 File 对象无法从 IndexedDB 恢复，我们需要创建一个占位符
        // 实际使用时，可能需要用户重新选择文件，或者从服务器获取文件信息
        const uploadFile: UploadFile = {
          id: metadata.fileId,
          name: metadata.fileName,
          size: metadata.fileSize,
          file: new File([], metadata.fileName), // 占位符，实际文件需要重新获取
          status: 'paused', // 设置为暂停状态，等待用户确认
          progress: Math.round((metadata.uploadedChunks.length / metadata.totalChunks) * 100),
          chunkList: chunks,
          uploadedChunks: metadata.uploadedChunks.length,
          fileHash: metadata.fileHash
        }

        // 添加到列表
        addFile(uploadFile)

        console.log(`已恢复文件: ${metadata.fileName}, 进度: ${uploadFile.progress}%`)
      }
    } catch (error) {
      console.error('恢复上传失败:', error)
    }
  }

  /**
   * 在组件挂载时检查未完成的上传
   */
  onMounted(() => {
    checkAndResume()
  })

  return {
    checkAndResume
  }
}

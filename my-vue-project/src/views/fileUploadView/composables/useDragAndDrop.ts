// 拖拽处理
import { ref } from "vue"

/**
 * 拖拽处理 Composition
 * 
 * 为什么放在这里？
 * - 拖拽状态是 UI 相关的响应式状态
 * - 拖拽逻辑可以在多个组件中复用
 * - 封装了拖拽相关的所有逻辑
 */
export function useDragAndDrop(onFilesSelected: (files: File[]) => void) {
    const isDragOver = ref(false)

    /**
     * 处理拖拽进入
     */
    function handleDragOver(e: DragEvent) { 
        e.preventDefault()
        isDragOver.value = true
    }

    /**
     * 处理拖拽离开
     */
    function handleDragLeave(): void {
        isDragOver.value = false
    }

    /**
     * 处理文件拖放
     */
    function handleDrop(e: DragEvent) {
        e.preventDefault()
        isDragOver.value = false
        
        const files = e.dataTransfer?.files
        if (files && files.length > 0) {
            onFilesSelected(Array.from(files))
        }
    }
    
    return {
        isDragOver,
        handleDragOver,
        handleDragLeave,
        handleDrop
    }
}
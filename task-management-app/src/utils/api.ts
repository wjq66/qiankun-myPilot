// src/utils/api.ts - API 基础配置

// 模拟 API 延迟
export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms))

// 模拟 API 响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function mockApi<T>(data: T): Promise<ApiResponse<T>> {
  await mockDelay(300)
  return {
    code: 200,
    message: 'success',
    data
  }
}

// 生成唯一ID
let idCounter = 1000
export function generateId(): number {
  return idCounter++
}

// 格式化日期
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

// src/utils/request.ts - API 请求工具

import { useLoginStore } from '@/stores/login'

/**
 * 自定义 fetch，自动添加用户信息和 token
 */
export async function apiRequest(url: string, options: RequestInit = {}) {
  const userStore = useLoginStore()

  // 添加认证头
  const headers = new Headers(options.headers)
  
  if (userStore.token) {
    headers.set('Authorization', `Bearer ${userStore.token}`)
  }

  // 添加用户信息到请求体或查询参数
  if (userStore.userInfo) {
    headers.set('X-User-Id', String(userStore.userInfo.id))
    headers.set('X-Username', userStore.userInfo.username)
  }

  // 添加请求配置
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // 跨域时携带 cookie
  }

  try {
    const response = await fetch(url, config)
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 解析响应
    const data = await response.json()
    return data
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}

/**
 * GET 请求
 */
export async function apiGet(url: string, params?: Record<string, any>) {
  let requestUrl = url
  
  // 添加查询参数
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    requestUrl = `${url}?${searchParams.toString()}`
  }

  return apiRequest(requestUrl, {
    method: 'GET',
  })
}

/**
 * POST 请求
 */
export async function apiPost(url: string, data?: any) {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * PUT 请求
 */
export async function apiPut(url: string, data?: any) {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * DELETE 请求
 */
export async function apiDelete(url: string) {
  return apiRequest(url, {
    method: 'DELETE',
  })
}

export interface Job{
    id: number
  code: string          // 岗位编码
  name: string          // 岗位名称
  description?: string   // 岗位描述
  level: number         // 岗位级别（1-10）
  isSystem: boolean      // 是否系统预设岗位
  sort: number          // 排序
  createdAt: string
  updatedAt: string
}
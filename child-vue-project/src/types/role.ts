export interface Role {
    id: number
    code: string          // 角色编码
    name: string          // 角色名称
    description?: string   // 角色描述
    permissions: string[]  // 权限列表
    isSystem: boolean      // 是否系统预设角色
    createdAt: string
    updatedAt: string
  }
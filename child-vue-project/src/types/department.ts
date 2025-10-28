export interface Department {
    id: number
    code: string          // 部门编码
    name: string          // 部门名称
    parentId: number | null  // 父部门ID（null表示顶级部门）
    treePath: string      // 树路径（如：/1/2/3）
    level: number         // 部门层级
    description?: string   // 部门描述
    managerId?: number     // 部门负责人ID
    sort: number          // 排序
    isSystem: boolean      // 是否系统预设部门
    createdAt: string
    updatedAt: string
    
    // 关联数据
    children?: Department[]  // 子部门
    parent?: Department      // 父部门
  }
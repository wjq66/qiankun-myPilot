// 用户-岗位关联
export interface UserJob{
    id: number
    userId: number
    jobId: number
    isPrimary: boolean      // 是否主岗位
    createdAt: string
}
// 用户-部门关联
export interface UserDepartment {
    id: number
    userId: number
    departmentId: number
    isPrimary: boolean      // 是否主部门
    createdAt: string
  }
  
  // 用户-角色关联
  export interface UserRole {
    id: number
    userId: number
    roleId: number
    createdAt: string
  }
// 用户
import type {Job} from "./job"
import type {Department} from "./department"
import type {Role} from "./role"

export interface User{
  id: number
  username: string
  email: string
  password: string
  realName: string
  phone?: string
  avatar?: string
  status: 'active' | 'inactive' | 'resigned'  // 状态：在职/停用/离职
  createdAt: string
  updatedAt: string
}

// 用户关系
export interface UserWithRelations extends User{
    jobs: Job[]           // 用户的岗位列表
    departments: Department[]  // 用户的部门列表
    roles: Role[]         // 用户的角色列表
}
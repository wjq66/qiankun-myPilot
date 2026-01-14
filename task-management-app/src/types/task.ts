// src/types/task.ts - 任务类型定义

/**
 * 任务状态枚举
 */
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'

/**
 * 任务优先级枚举
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * 任务实体接口
 */
export interface Task {
  id: number
  title: string                    // 任务标题
  description?: string             // 任务描述
  status: TaskStatus              // 任务状态
  priority: TaskPriority          // 任务优先级
  assigneeId?: number             // 负责人ID
  assigneeName?: string           // 负责人姓名
  dueDate?: string                // 截止日期
  tags?: string[]                 // 标签
  createdAt: string               // 创建时间
  updatedAt: string               // 更新时间
}

/**
 * 创建任务的表单数据（不包含自动生成的字段）
 */
export type CreateTaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

/**
 * 更新任务的表单数据（所有字段可选）
 */
export type UpdateTaskData = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>

/**
 * 任务统计信息
 */
export interface TaskStats {
  total: number                   // 总任务数
  todo: number                    // 待办任务数
  inProgress: number              // 进行中任务数
  review: number                  // 待审核任务数
  done: number                    // 已完成任务数
}

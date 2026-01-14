export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task{
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

export type UpdateTaskData = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
//  TypeScript 提供的一个**工具类型（Utility Type）**，用于从现有类型中**排除（移除）指定的属性**，创建一个新的类型。


# 类型定义 vs Pinia Store - 职责划分指南

## 🎯 核心原则

### **类型定义文件（types/）** = "是什么"
- 定义数据结构
- 描述数据形状
- 纯类型信息

### **Pinia Store（stores/）** = "做什么"
- 管理状态
- 处理业务逻辑
- 数据操作

---

## 📁 类型定义文件（types/task.ts）- 放什么？

### ✅ 应该放在类型文件中的内容

#### 1. **数据类型定义**

```typescript
// ✅ 放在 types/task.ts
export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  // ...
}
```

**为什么？** 这是数据的"形状"定义，不涉及业务逻辑。

#### 2. **枚举类型**

```typescript
// ✅ 放在 types/task.ts
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
```

**为什么？** 这是类型约束，定义可能的值。

#### 3. **工具类型（基于现有类型）**

```typescript
// ✅ 放在 types/task.ts
export type CreateTaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTaskData = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
```

**为什么？** 这是类型转换，不涉及运行时逻辑。

#### 4. **响应类型定义**

```typescript
// ✅ 放在 types/task.ts
export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  // ...
}
```

**为什么？** 这是数据结构定义。

---

## 🗄️ Pinia Store（stores/task.ts）- 放什么？

### ✅ 应该放在 Store 中的内容

#### 1. **状态（State）**

```typescript
// ✅ 放在 stores/task.ts
export const useTaskStore = defineStore('task', () => {
  // 状态：实际的数据
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref('')
  
  return { tasks, isLoading, error }
})
```

**为什么？** 这是运行时的实际数据，需要响应式管理。

#### 2. **计算属性（Computed）**

```typescript
// ✅ 放在 stores/task.ts
const tasksByStatus = computed(() => {
  return {
    todo: tasks.value.filter(t => t.status === 'todo'),
    'in-progress': tasks.value.filter(t => t.status === 'in-progress'),
    // ...
  }
})

const taskStats = computed(() => ({
  total: tasks.value.length,
  todo: tasksByStatus.value.todo.length,
  // ...
}))
```

**为什么？** 这是基于状态的派生数据，需要响应式计算。

#### 3. **方法（Actions）**

```typescript
// ✅ 放在 stores/task.ts
const fetchTasks = async () => {
  isLoading.value = true
  try {
    const response = await taskService.getTasks()
    tasks.value = response.data
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

const createTask = async (taskData: CreateTaskData) => {
  // 业务逻辑
  const response = await taskService.createTask(taskData)
  tasks.value.push(response.data)
}
```

**为什么？** 这是业务逻辑和数据操作。

---

## 🔍 对比示例

### ❌ 错误示例

```typescript
// ❌ 错误：在 types/task.ts 中放业务逻辑
export interface Task {
  // ...
}

// ❌ 不应该在这里
export const tasks: Task[] = []  // 这是状态，应该放 Store
export function fetchTasks() { } // 这是方法，应该放 Store
```

```typescript
// ❌ 错误：在 stores/task.ts 中定义类型
export const useTaskStore = defineStore('task', () => {
  // ❌ 不应该在这里定义类型
  interface Task {  // 应该放在 types/task.ts
    id: number
    // ...
  }
  
  const tasks = ref<Task[]>([])
})
```

### ✅ 正确示例

```typescript
// ✅ 正确：types/task.ts - 只放类型定义
export interface Task {
  id: number
  title: string
  status: TaskStatus
}

export type CreateTaskData = Omit<Task, 'id' | 'createdAt'>
```

```typescript
// ✅ 正确：stores/task.ts - 放状态和逻辑
import type { Task, CreateTaskData } from '@/types/task'

export const useTaskStore = defineStore('task', () => {
  // 状态
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  
  // 计算属性
  const taskStats = computed(() => ({
    total: tasks.value.length
  }))
  
  // 方法
  const fetchTasks = async () => {
    // 业务逻辑
  }
  
  return { tasks, isLoading, taskStats, fetchTasks }
})
```

---

## 📊 决策流程图

```
需要定义的内容
    │
    ├─ 是数据结构/类型？ → 放在 types/
    │   ├─ interface
    │   ├─ type
    │   └─ enum
    │
    └─ 是运行时状态/逻辑？ → 放在 stores/
        ├─ 响应式状态（ref/reactive）
        ├─ 计算属性（computed）
        └─ 方法/业务逻辑（函数）
```

---

## 🎓 实际开发中的判断标准

### 判断标准 1：是否涉及运行时？

```typescript
// ✅ types/ - 编译时类型，不涉及运行时
export interface Task { ... }

// ✅ stores/ - 运行时状态和逻辑
const tasks = ref<Task[]>([])  // 运行时数据
const fetchTasks = async () => { }  // 运行时逻辑
```

### 判断标准 2：是否会被多个地方使用？

```typescript
// ✅ types/ - 类型定义会被多处引用
// 在组件、Store、Service 中都会用到
import type { Task } from '@/types/task'

// ✅ stores/ - Store 在组件中使用
import { useTaskStore } from '@/stores/task'
```

### 判断标准 3：是否需要响应式？

```typescript
// ✅ types/ - 不需要响应式
export interface Task { ... }  // 纯类型

// ✅ stores/ - 需要响应式
const tasks = ref<Task[]>([])  // 响应式状态
```

---

## 📋 完整示例对比

### types/task.ts（类型定义）

```typescript
// ========== 类型定义文件 ==========
// 职责：定义数据结构，不涉及业务逻辑

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
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: number
  assigneeName?: string
  dueDate?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 创建任务的表单数据
 */
export type CreateTaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

/**
 * 更新任务的表单数据
 */
export type UpdateTaskData = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>

/**
 * 任务统计信息（数据结构定义）
 */
export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  review: number
  done: number
}
```

### stores/task.ts（状态管理）

```typescript
// ========== Pinia Store ==========
// 职责：管理状态，处理业务逻辑

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService } from '@/services/taskService'
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus, TaskStats } from '@/types/task'

export const useTaskStore = defineStore('task', () => {
  // ========== 状态（State）==========
  const tasks = ref<Task[]>([])           // 实际的任务数据
  const isLoading = ref(false)            // 加载状态
  const error = ref('')                   // 错误信息

  // ========== 计算属性（Computed）==========
  /**
   * 按状态分组的任务（基于状态计算）
   */
  const tasksByStatus = computed(() => {
    return {
      todo: tasks.value.filter(t => t.status === 'todo'),
      'in-progress': tasks.value.filter(t => t.status === 'in-progress'),
      review: tasks.value.filter(t => t.status === 'review'),
      done: tasks.value.filter(t => t.status === 'done')
    }
  })

  /**
   * 任务统计信息（基于状态计算）
   */
  const taskStats = computed<TaskStats>(() => ({
    total: tasks.value.length,
    todo: tasksByStatus.value.todo.length,
    inProgress: tasksByStatus.value['in-progress'].length,
    review: tasksByStatus.value.review.length,
    done: tasksByStatus.value.done.length
  }))

  // ========== 方法（Actions）==========
  /**
   * 获取所有任务
   */
  const fetchTasks = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const response = await taskService.getTasks()
      tasks.value = response.data  // 更新状态
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建任务
   */
  const createTask = async (taskData: CreateTaskData) => {
    isLoading.value = true
    try {
      const response = await taskService.createTask(taskData)
      tasks.value.push(response.data)  // 更新状态
      return response
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    tasks,
    isLoading,
    error,
    // 计算属性
    tasksByStatus,
    taskStats,
    // 方法
    fetchTasks,
    createTask
  }
})
```

---

## 🎯 快速记忆口诀

> **types = 是什么（What）**  
> **stores = 做什么（How）**

- **types/** → 数据形状、类型约束
- **stores/** → 实际数据、业务逻辑

---

## 📝 检查清单

在决定放哪里时，问自己：

### 放在 types/ 的条件：
- [ ] 是类型定义（interface、type、enum）？
- [ ] 不涉及运行时逻辑？
- [ ] 会被多个地方引用？
- [ ] 只是描述"是什么"？

### 放在 stores/ 的条件：
- [ ] 是实际的数据（ref、reactive）？
- [ ] 需要响应式？
- [ ] 涉及业务逻辑？
- [ ] 需要计算或操作？

---

## 💡 常见误区

### ❌ 误区 1：在 types/ 中放默认值

```typescript
// ❌ 错误
export const defaultTask: Task = {
  id: 0,
  title: '',
  // ...
}

// ✅ 正确：放在 stores/ 或 utils/
export const getDefaultTask = (): CreateTaskData => ({
  title: '',
  status: 'todo',
  // ...
})
```

### ❌ 误区 2：在 stores/ 中重复定义类型

```typescript
// ❌ 错误：在 Store 中定义类型
export const useTaskStore = defineStore('task', () => {
  interface Task {  // 应该从 types/ 导入
    id: number
  }
})

// ✅ 正确：从 types/ 导入
import type { Task } from '@/types/task'
```

### ❌ 误区 3：在 types/ 中放工具函数

```typescript
// ❌ 错误：在 types/ 中放函数
export function formatTask(task: Task) {
  // ...
}

// ✅ 正确：放在 utils/ 或 stores/
// utils/taskUtils.ts
export function formatTask(task: Task) {
  // ...
}
```

---

## 🎓 总结

| 内容类型 | 放在哪里 | 原因 |
|---------|---------|------|
| `interface Task` | types/ | 类型定义 |
| `type TaskStatus` | types/ | 类型约束 |
| `type CreateTaskData` | types/ | 类型转换 |
| `const tasks = ref([])` | stores/ | 运行时状态 |
| `const stats = computed()` | stores/ | 计算属性 |
| `const fetchTasks = async ()` | stores/ | 业务逻辑 |

**记住：类型定义描述"是什么"，Store 管理"做什么"！** 🎯


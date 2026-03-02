// src/services/taskListMockData.ts - 任务列表 Mock 数据服务

/**
 * 任务列表数据类型
 */
export interface TaskListItem {
  id: number
  title: string
  description: string
  status: '待办' | '进行中' | '已完成' | '已取消'
  priority: '低' | '中' | '高' | '紧急'
  assignee: string
  dueDate: string
  createdAt: string
  progress: number
  path?: string[] // 树形路径
  group?: boolean // 是否为分组节点
  childrenLoaded?: boolean // 子节点是否已加载
  hasChildren?: boolean // 是否有子节点
}

/**
 * 生成随机状态
 */
const getRandomStatus = (): TaskListItem['status'] => {
  const statuses: TaskListItem['status'][] = ['待办', '进行中', '已完成', '已取消']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

/**
 * 生成随机优先级
 */
const getRandomPriority = (): TaskListItem['priority'] => {
  const priorities: TaskListItem['priority'][] = ['低', '中', '高', '紧急']
  return priorities[Math.floor(Math.random() * priorities.length)]
}

/**
 * 生成随机负责人
 */
const getRandomAssignee = (): string => {
  const assignees = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
  return assignees[Math.floor(Math.random() * assignees.length)]
}

/**
 * 生成随机日期（未来30天内）
 */
const getRandomDueDate = (): string => {
  return new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

/**
 * 生成随机创建日期（过去60天内）
 */
const getRandomCreatedDate = (): string => {
  return new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

/**
 * 生成主任务列表数据（50条，包含2条树形父节点）
 */
export const generateMainTaskList = (): TaskListItem[] => {
  const tasks: TaskListItem[] = []
  
  // 生成 50 条数据
  for (let i = 1; i <= 50; i++) {
    const isGroup = i === 1 || i === 2 // 前两条作为树形数据的父节点
    
    tasks.push({
      id: i,
      title: isGroup 
        ? `项目组 ${i === 1 ? 'A' : 'B'} - 主任务` 
        : `任务 ${i}`,
      description: isGroup 
        ? `这是项目组 ${i === 1 ? 'A' : 'B'} 的主任务，包含多个子任务，点击展开可查看子任务列表` 
        : `这是第 ${i} 个任务的详细描述信息，包含了任务的具体要求和执行步骤`,
      status: getRandomStatus(),
      priority: getRandomPriority(),
      assignee: getRandomAssignee(),
      dueDate: getRandomDueDate(),
      createdAt: getRandomCreatedDate(),
      progress: Math.floor(Math.random() * 101),
      // 树形数据：分组节点有 path，普通节点也有 path（作为顶级节点）
      path: isGroup ? [`项目组${i === 1 ? 'A' : 'B'}`] : [`任务 ${i}`],
      group: isGroup,
      hasChildren: isGroup, // 标记有子节点
      childrenLoaded: false // 子节点未加载
    })
  }
  
  return tasks
}

/**
 * 异步加载子节点数据
 * @param parentId 父节点ID
 * @param parentTitle 父节点标题
 * @returns Promise<TaskListItem[]>
 */
export const loadChildrenAsync = async (
  parentId: number, 
  parentTitle: string
): Promise<TaskListItem[]> => {
  // 模拟异步加载延迟（800ms）
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const children: TaskListItem[] = []
  // 每个父节点生成 3-7 个子任务
  const childCount = Math.floor(Math.random() * 5) + 3
  
  for (let i = 1; i <= childCount; i++) {
    const groupName = parentId === 1 ? 'A' : 'B'
    
    children.push({
      id: parentId * 1000 + i, // 确保子节点 ID 唯一
      title: `${parentTitle} - 子任务 ${i}`,
      description: `这是 ${parentTitle} 的第 ${i} 个子任务，详细描述了子任务的具体内容和要求`,
      status: getRandomStatus(),
      priority: getRandomPriority(),
      assignee: getRandomAssignee(),
      dueDate: getRandomDueDate(),
      createdAt: getRandomCreatedDate(),
      progress: Math.floor(Math.random() * 101),
      path: [`项目组${groupName}`, `子任务${i}`], // 路径包含父节点路径
      group: false,
      hasChildren: false,
      childrenLoaded: false
    })
  }
  
  return children
}

/**
 * Mock API 调用 - 获取任务列表
 */
export const fetchTaskList = async (): Promise<TaskListItem[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  return generateMainTaskList()
}

/**
 * Mock API 调用 - 获取子任务列表
 */
export const fetchChildTasks = async (
  parentId: number,
  parentTitle: string
): Promise<TaskListItem[]> => {
  return loadChildrenAsync(parentId, parentTitle)
}


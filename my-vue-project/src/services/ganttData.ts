/**
 * 甘特图示例数据
 * 用于学习和测试甘特图功能
 */

// 任务数据类型定义
export interface GanttTask {
  id: number | string
  text: string // 任务名称
  start_date: string // 开始日期 YYYY-MM-DD
  duration: number // 持续时间（天数）
  progress: number // 进度 0-100
  parent?: number | string // 父任务ID，0表示顶级任务
  type?: string // 任务类型：'project' | 'task' | 'milestone'
  open?: boolean // 是否展开
  color?: string // 任务颜色
  priority?: number // 优先级 1-5
  owner?: string // 负责人
  description?: string // 任务描述
}

// 任务链接类型定义（依赖关系）
export interface GanttLink {
  id: number | string
  source: number | string // 源任务ID
  target: number | string // 目标任务ID
  type: string // 链接类型：'0'=完成到开始, '1'=开始到开始, '2'=完成到完成, '3'=开始到完成
}

/**
 * 项目任务数据
 * 企业管理系统开发项目
 */
export const ganttTasks: GanttTask[] = [
  // 第一阶段：项目规划
  {
    id: 1,
    text: '项目规划阶段',
    start_date: '2024-01-01',
    duration: 15,
    progress: 100,
    parent: 0,
    type: 'project',
    open: true,
    color: '#409EFF',
    priority: 1,
    owner: '项目经理',
    description: '项目初期规划，包括需求分析、技术方案设计和项目排期'
  },
  {
    id: 2,
    text: '需求调研',
    start_date: '2024-01-01',
    duration: 5,
    progress: 100,
    parent: 1,
    type: 'task',
    owner: '产品经理',
    description: '深入调研用户需求，编写需求文档'
  },
  {
    id: 3,
    text: '技术方案设计',
    start_date: '2024-01-06',
    duration: 7,
    progress: 100,
    parent: 1,
    type: 'task',
    owner: '技术负责人',
    description: '设计系统架构和技术选型方案'
  },
  {
    id: 4,
    text: '项目排期',
    start_date: '2024-01-13',
    duration: 3,
    progress: 100,
    parent: 1,
    type: 'task',
    owner: '项目经理',
    description: '制定详细的项目时间计划和里程碑'
  },
  
  // 第二阶段：系统设计
  {
    id: 5,
    text: '系统设计阶段',
    start_date: '2024-01-16',
    duration: 20,
    progress: 80,
    parent: 0,
    type: 'project',
    open: true,
    color: '#67C23A',
    priority: 1,
    owner: '架构师',
    description: '完成系统详细设计，包括数据库、接口和UI设计'
  },
  {
    id: 6,
    text: '数据库设计',
    start_date: '2024-01-16',
    duration: 8,
    progress: 100,
    parent: 5,
    type: 'task',
    owner: '后端工程师',
    description: '设计数据库表结构和关系'
  },
  {
    id: 7,
    text: '接口设计',
    start_date: '2024-01-24',
    duration: 7,
    progress: 80,
    parent: 5,
    type: 'task',
    owner: '后端工程师',
    description: '设计RESTful API接口文档'
  },
  {
    id: 8,
    text: 'UI/UX设计',
    start_date: '2024-01-20',
    duration: 10,
    progress: 60,
    parent: 5,
    type: 'task',
    owner: 'UI设计师',
    description: '设计用户界面和交互流程'
  },
  
  // 第三阶段：开发阶段
  {
    id: 9,
    text: '开发阶段',
    start_date: '2024-02-05',
    duration: 35,
    progress: 30,
    parent: 0,
    type: 'project',
    open: true,
    color: '#E6A23C',
    priority: 1,
    owner: '开发团队',
    description: '核心开发阶段，包括后端、前端开发和接口联调'
  },
  {
    id: 10,
    text: '后端开发',
    start_date: '2024-02-05',
    duration: 20,
    progress: 40,
    parent: 9,
    type: 'task',
    owner: '后端团队',
    description: '实现业务逻辑和API接口'
  },
  {
    id: 11,
    text: '前端开发',
    start_date: '2024-02-10',
    duration: 25,
    progress: 25,
    parent: 9,
    type: 'task',
    owner: '前端团队',
    description: '实现用户界面和交互功能'
  },
  {
    id: 12,
    text: '接口联调',
    start_date: '2024-02-25',
    duration: 10,
    progress: 10,
    parent: 9,
    type: 'task',
    owner: '全栈工程师',
    description: '前后端接口联调和问题修复'
  },
  
  // 第四阶段：测试阶段
  {
    id: 13,
    text: '测试阶段',
    start_date: '2024-03-05',
    duration: 15,
    progress: 0,
    parent: 0,
    type: 'project',
    open: true,
    color: '#909399',
    priority: 2,
    owner: '测试团队',
    description: '全面测试系统功能和性能'
  },
  {
    id: 14,
    text: '单元测试',
    start_date: '2024-03-05',
    duration: 7,
    progress: 0,
    parent: 13,
    type: 'task',
    owner: '开发团队',
    description: '编写和执行单元测试用例'
  },
  {
    id: 15,
    text: '集成测试',
    start_date: '2024-03-12',
    duration: 5,
    progress: 0,
    parent: 13,
    type: 'task',
    owner: '测试工程师',
    description: '测试各模块之间的集成'
  },
  {
    id: 16,
    text: '用户验收测试',
    start_date: '2024-03-17',
    duration: 3,
    progress: 0,
    parent: 13,
    type: 'task',
    owner: '产品经理',
    description: '用户验收测试和反馈收集'
  },
  
  // 第五阶段：上线部署
  {
    id: 17,
    text: '上线部署阶段',
    start_date: '2024-03-20',
    duration: 11,
    progress: 0,
    parent: 0,
    type: 'project',
    open: true,
    color: '#F56C6C',
    priority: 1,
    owner: '运维团队',
    description: '生产环境部署和上线验证'
  },
  {
    id: 18,
    text: '生产环境部署',
    start_date: '2024-03-20',
    duration: 5,
    progress: 0,
    parent: 17,
    type: 'task',
    owner: '运维工程师',
    description: '部署应用到生产服务器'
  },
  {
    id: 19,
    text: '数据迁移',
    start_date: '2024-03-25',
    duration: 3,
    progress: 0,
    parent: 17,
    type: 'task',
    owner: 'DBA',
    description: '迁移历史数据到新系统'
  },
  {
    id: 20,
    text: '上线验证',
    start_date: '2024-03-28',
    duration: 3,
    progress: 0,
    parent: 17,
    type: 'task',
    owner: '项目经理',
    description: '验证系统上线后的稳定性和功能完整性'
  },
  
  // 里程碑任务
  {
    id: 21,
    text: '项目启动',
    start_date: '2024-01-01',
    duration: 0,
    progress: 100,
    parent: 0,
    type: 'milestone',
    color: '#E6A23C'
  },
  {
    id: 22,
    text: '开发完成',
    start_date: '2024-03-05',
    duration: 0,
    progress: 0,
    parent: 0,
    type: 'milestone',
    color: '#E6A23C'
  },
  {
    id: 23,
    text: '项目上线',
    start_date: '2024-03-31',
    duration: 0,
    progress: 0,
    parent: 0,
    type: 'milestone',
    color: '#E6A23C'
  }
]

/**
 * 任务依赖关系（链接）
 * type: '0' = 完成到开始 (Finish-to-Start)
 */
export const ganttLinks: GanttLink[] = [
  // 项目规划阶段的依赖
  { id: 1, source: 2, target: 3, type: '0' }, // 需求调研 -> 技术方案设计
  { id: 2, source: 3, target: 4, type: '0' }, // 技术方案设计 -> 项目排期
  
  // 系统设计阶段的依赖
  { id: 3, source: 6, target: 7, type: '0' }, // 数据库设计 -> 接口设计
  
  // 开发阶段的依赖
  { id: 4, source: 6, target: 10, type: '0' }, // 数据库设计 -> 后端开发
  { id: 5, source: 8, target: 11, type: '0' }, // UI/UX设计 -> 前端开发
  { id: 6, source: 10, target: 12, type: '0' }, // 后端开发 -> 接口联调
  { id: 7, source: 11, target: 12, type: '0' }, // 前端开发 -> 接口联调
  
  // 测试阶段的依赖
  { id: 8, source: 12, target: 14, type: '0' }, // 接口联调 -> 单元测试
  { id: 9, source: 14, target: 15, type: '0' }, // 单元测试 -> 集成测试
  { id: 10, source: 15, target: 16, type: '0' }, // 集成测试 -> 用户验收测试
  
  // 上线部署阶段的依赖
  { id: 11, source: 16, target: 18, type: '0' }, // 用户验收测试 -> 生产环境部署
  { id: 12, source: 18, target: 19, type: '0' }, // 生产环境部署 -> 数据迁移
  { id: 13, source: 19, target: 20, type: '0' }, // 数据迁移 -> 上线验证
  
  // 里程碑依赖
  { id: 14, source: 4, target: 21, type: '0' }, // 项目排期 -> 项目启动里程碑
  { id: 15, source: 12, target: 22, type: '0' }, // 接口联调 -> 开发完成里程碑
  { id: 16, source: 20, target: 23, type: '0' } // 上线验证 -> 项目上线里程碑
]

/**
 * 获取甘特图配置
 */
export const getGanttConfig = () => {
  return {
    // 时间轴配置
    scales: [
      { unit: 'month', step: 1, format: 'YYYY年MM月' },
      { unit: 'day', step: 1, format: 'DD日' }
    ],
    // 日期格式
    date_format: '%Y-%m-%d',
    // 列配置
    columns: [
      { name: 'text', label: '任务名称', width: 200, tree: true },
      { name: 'start_date', label: '开始日期', width: 100, align: 'center' },
      { name: 'duration', label: '持续时间', width: 80, align: 'center' },
      { name: 'progress', label: '进度', width: 80, align: 'center', template: (task: any) => `${task.progress}%` },
      { name: 'owner', label: '负责人', width: 100 }
    ],
    // 任务类型配置
    task_types: {
      project: 'project',
      task: 'task',
      milestone: 'milestone'
    }
  }
}


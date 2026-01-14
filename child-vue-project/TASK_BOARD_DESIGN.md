# 任务管理看板 - 组件设计与实现

## 📋 项目概述

这是一个完整的任务管理看板系统，使用 Vue 3 + TypeScript + Pinia + Element Plus 开发。该项目涵盖了 Vue 3 的核心特性，是学习 Vue 3 的绝佳实践项目。

## 🎯 功能需求

### 核心功能
1. **任务看板展示** - 四个状态列（待办、进行中、待审核、已完成）
2. **任务管理** - 创建、编辑、删除任务
3. **任务状态切换** - 在不同状态间移动任务
4. **任务筛选** - 按状态、优先级、负责人筛选
5. **任务统计** - 实时显示各状态任务数量

### 扩展功能
- 任务优先级标识（低、中、高、紧急）
- 任务标签系统
- 截止日期提醒
- 负责人分配
- 任务描述

## 🏗️ 组件架构设计

```
TaskBoardView (主视图)
├── TaskColumn (任务列) × 4
│   └── TaskCard (任务卡片) × N
└── TaskFormDialog (任务表单对话框)
```

### 组件层级关系

```
TaskBoardView
  ├── 工具栏（统计信息、操作按钮）
  ├── TaskColumn × 4
  │   └── TaskCard × N
  │       ├── 任务标题
  │       ├── 任务描述
  │       ├── 优先级标识
  │       ├── 标签
  │       └── 元信息（负责人、截止日期）
  └── TaskFormDialog
      └── 表单字段
          ├── 标题（必填）
          ├── 描述（可选）
          ├── 状态（必填）
          ├── 优先级（必填）
          ├── 负责人（可选）
          ├── 截止日期（可选）
          └── 标签（可选）
```

## 📁 文件结构

```
src/
├── types/
│   └── task.ts                    # 任务类型定义
├── services/
│   ├── taskService.ts             # 任务服务（API 调用）
│   └── mockData.ts                # 模拟数据（已更新）
├── stores/
│   └── task.ts                    # 任务状态管理（Pinia）
└── views/
    └── TaskManagement/
        ├── TaskBoardView.vue      # 主视图组件
        └── components/
            ├── TaskColumn.vue     # 任务列组件
            ├── TaskCard.vue       # 任务卡片组件
            └── TaskFormDialog.vue # 任务表单对话框
```

## 🎨 组件详细设计

### 1. TaskBoardView（主视图）

**职责：**
- 管理整个看板的状态
- 协调子组件之间的通信
- 处理任务 CRUD 操作

**Vue 3 特性：**
- ✅ Composition API (`<script setup>`)
- ✅ 响应式数据 (`ref`, `computed`)
- ✅ 生命周期钩子 (`onMounted`)
- ✅ Pinia 状态管理
- ✅ 事件处理

**关键代码片段：**
```typescript
// 使用 Pinia Store
const taskStore = useTaskStore()

// 生命周期钩子
onMounted(async () => {
  await taskStore.fetchTasks()
})

// 事件处理
const handleCreateTask = () => {
  currentTask.value = null
  dialogVisible.value = true
}
```

---

### 2. TaskColumn（任务列组件）

**职责：**
- 展示特定状态的任务列表
- 处理任务卡片的事件
- 向上传递事件

**Vue 3 特性：**
- ✅ Props 定义和类型检查
- ✅ Emits 事件定义
- ✅ 列表渲染 (`v-for`)
- ✅ 条件渲染 (`v-if`)
- ✅ TransitionGroup 动画

**Props：**
```typescript
interface Props {
  title: string        // 列标题
  status: TaskStatus   // 列状态
  tasks: Task[]       // 任务列表
  color?: string      // 列颜色
}
```

**Emits：**
```typescript
emit('task-click', task)
emit('task-edit', task)
emit('task-delete', task)
emit('status-change', taskId, status)
```

---

### 3. TaskCard（任务卡片组件）

**职责：**
- 展示单个任务的详细信息
- 处理用户交互（点击、编辑、删除）
- 显示任务优先级和状态

**Vue 3 特性：**
- ✅ Props 和 Emits
- ✅ 计算属性 (`computed`)
- ✅ 条件渲染
- ✅ 事件修饰符 (`@click.stop`)
- ✅ 样式绑定

**关键计算属性：**
```typescript
// 优先级文本
const priorityText = computed(() => {
  const map = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return map[props.task.priority]
})

// 是否过期
const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  const dueDate = new Date(props.task.dueDate)
  const today = new Date()
  return dueDate < today && props.task.status !== 'done'
})
```

---

### 4. TaskFormDialog（任务表单对话框）

**职责：**
- 创建和编辑任务
- 表单验证
- 数据提交

**Vue 3 特性：**
- ✅ v-model 双向绑定
- ✅ 表单验证
- ✅ watch 监听器
- ✅ 条件渲染

**v-model 实现：**
```typescript
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
```

**表单验证：**
```typescript
const rules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ]
}
```

---

## 🔄 数据流设计

### 状态管理（Pinia）

```typescript
// stores/task.ts
export const useTaskStore = defineStore('task', () => {
  // 状态
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref('')

  // 计算属性
  const tasksByStatus = computed(() => {
    return {
      todo: tasks.value.filter(t => t.status === 'todo'),
      'in-progress': tasks.value.filter(t => t.status === 'in-progress'),
      review: tasks.value.filter(t => t.status === 'review'),
      done: tasks.value.filter(t => t.status === 'done')
    }
  })

  // 方法
  const fetchTasks = async () => { ... }
  const createTask = async (taskData) => { ... }
  const updateTask = async (id, taskData) => { ... }
  const deleteTask = async (id) => { ... }
})
```

### 数据流向

```
用户操作
  ↓
组件事件处理
  ↓
调用 Store 方法
  ↓
调用 Service API
  ↓
更新 Store 状态
  ↓
响应式更新 UI
```

---

## 🎨 UI/UX 设计

### 颜色方案

- **待办** - 灰色 (#909399)
- **进行中** - 蓝色 (#409EFF)
- **待审核** - 橙色 (#E6A23C)
- **已完成** - 绿色 (#67C23A)

### 优先级颜色

- **低** - 灰色 (#909399)
- **中** - 蓝色 (#409EFF)
- **高** - 橙色 (#E6A23C)
- **紧急** - 红色 (#F56C6C)

### 响应式设计

- **桌面端** (> 1400px): 4 列布局
- **平板端** (768px - 1400px): 2 列布局
- **移动端** (< 768px): 1 列布局

---

## 📚 Vue 3 核心特性应用

### 1. Composition API

所有组件都使用 `<script setup>` 语法，代码更简洁：

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 代码自动暴露给模板
</script>
```

### 2. 响应式系统

- `ref` - 基本类型和对象
- `reactive` - 对象（未使用，但可用）
- `computed` - 计算属性

### 3. 生命周期

- `onMounted` - 组件挂载后获取数据

### 4. 组件通信

- **Props** - 父传子
- **Emits** - 子传父
- **Pinia** - 跨组件状态共享

### 5. 模板语法

- `v-if` / `v-show` - 条件渲染
- `v-for` - 列表渲染
- `v-model` - 双向绑定
- `@click` - 事件处理
- `:class` / `:style` - 动态绑定

---

## 🚀 使用指南

### 1. 启动项目

```bash
cd child-vue-project
npm install
npm run dev
```

### 2. 访问任务看板

导航到：`/task-management`

### 3. 功能操作

1. **创建任务** - 点击"新建任务"按钮
2. **编辑任务** - 点击任务卡片的下拉菜单 → 编辑
3. **删除任务** - 点击任务卡片的下拉菜单 → 删除
4. **查看任务** - 直接点击任务卡片
5. **更新状态** - 通过编辑任务修改状态

---

## 📝 学习要点总结

### Vue 3 核心概念

1. **Composition API** - 更灵活的代码组织方式
2. **响应式系统** - ref、reactive、computed
3. **生命周期** - onMounted、onUnmounted 等
4. **组件通信** - Props、Emits、Provide/Inject
5. **状态管理** - Pinia 的使用

### TypeScript 应用

- 类型定义 (`interface`, `type`)
- Props 类型检查
- Emits 类型定义
- 函数参数和返回值类型

### 最佳实践

- ✅ 组件职责单一
- ✅ Props 和 Emits 明确定义
- ✅ 使用计算属性缓存结果
- ✅ 错误处理
- ✅ 加载状态管理
- ✅ 响应式设计

---

## 🔧 扩展建议

### 可以添加的功能

1. **拖拽排序** - 使用 Sortable.js 实现任务拖拽
2. **任务搜索** - 添加搜索和筛选功能
3. **任务详情** - 点击任务查看详情弹窗
4. **批量操作** - 批量更新任务状态
5. **任务评论** - 添加评论功能
6. **任务附件** - 支持上传附件
7. **任务统计图表** - 使用 ECharts 展示统计图表
8. **任务提醒** - 截止日期提醒功能

### 技术优化

1. **虚拟滚动** - 任务列表很长时使用虚拟滚动
2. **懒加载** - 分页加载任务
3. **缓存优化** - 使用 computed 缓存计算结果
4. **防抖节流** - 搜索和筛选使用防抖

---

## 📖 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [TypeScript 文档](https://www.typescriptlang.org/zh/)

---

## ✅ 完成清单

- [x] 任务类型定义
- [x] 任务服务（API）
- [x] 任务 Store（状态管理）
- [x] 任务看板主视图
- [x] 任务列组件
- [x] 任务卡片组件
- [x] 任务表单对话框
- [x] 模拟数据
- [x] 路由配置（已存在）
- [x] 样式和响应式设计

---

**祝你学习愉快！🎉**


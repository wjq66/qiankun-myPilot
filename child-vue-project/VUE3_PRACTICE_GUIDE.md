# Vue 3 实践项目 - 任务管理看板

## 🎯 项目简介

这是一个完整的任务管理看板系统，专门为学习 Vue 3 而设计。通过这个项目，你将掌握 Vue 3 的核心特性和最佳实践。

## 📚 学习目标

完成这个项目后，你将能够：

- ✅ 理解和使用 Composition API
- ✅ 掌握响应式数据（ref、reactive、computed）
- ✅ 使用生命周期钩子
- ✅ 实现组件通信（Props、Emits）
- ✅ 使用 Pinia 进行状态管理
- ✅ 处理表单和验证
- ✅ 使用 TypeScript 增强代码质量

## 🚀 快速开始

### 1. 查看项目结构

```
child-vue-project/
├── src/
│   ├── types/task.ts              # 任务类型定义
│   ├── services/taskService.ts    # 任务服务
│   ├── stores/task.ts             # 任务状态管理
│   └── views/TaskManagement/     # 任务管理视图
│       ├── TaskBoardView.vue      # 主视图
│       └── components/            # 子组件
│           ├── TaskColumn.vue
│           ├── TaskCard.vue
│           └── TaskFormDialog.vue
```

### 2. 运行项目

```bash
# 进入项目目录
cd child-vue-project

# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

### 3. 访问任务看板

在浏览器中打开：`http://localhost:5173/#/task-management`

## 📖 学习路径

### 阶段 1：理解基础结构

1. **阅读类型定义** (`src/types/task.ts`)
   - 了解任务的数据结构
   - 学习 TypeScript 接口定义

2. **查看服务层** (`src/services/taskService.ts`)
   - 理解 API 调用模式
   - 学习异步操作处理

3. **研究状态管理** (`src/stores/task.ts`)
   - 学习 Pinia Store 的写法
   - 理解响应式状态和计算属性

### 阶段 2：学习组件开发

1. **TaskCard 组件** - 最简单的组件
   - 学习 Props 和 Emits
   - 理解计算属性
   - 掌握条件渲染

2. **TaskColumn 组件** - 列表组件
   - 学习列表渲染 (`v-for`)
   - 理解事件传递
   - 掌握 TransitionGroup 动画

3. **TaskFormDialog 组件** - 表单组件
   - 学习 v-model 双向绑定
   - 理解表单验证
   - 掌握 watch 监听器

4. **TaskBoardView 组件** - 主视图
   - 学习组件组合
   - 理解生命周期钩子
   - 掌握状态管理集成

### 阶段 3：实践和扩展

1. **添加新功能**
   - 任务搜索
   - 任务筛选
   - 批量操作

2. **优化体验**
   - 添加加载动画
   - 优化响应式布局
   - 添加错误提示

3. **性能优化**
   - 使用 computed 缓存
   - 优化列表渲染
   - 添加虚拟滚动

## 🎓 核心知识点

### 1. Composition API

```vue
<script setup lang="ts">
// 导入响应式 API
import { ref, computed, onMounted } from 'vue'

// 定义响应式数据
const count = ref(0)

// 定义计算属性
const doubleCount = computed(() => count.value * 2)

// 生命周期钩子
onMounted(() => {
  console.log('组件已挂载')
})
</script>
```

### 2. Props 和 Emits

```vue
<script setup lang="ts">
// 定义 Props
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 定义 Emits
const emit = defineEmits<{
  (e: 'update', value: number): void
}>()

// 触发事件
const handleClick = () => {
  emit('update', props.count + 1)
}
</script>
```

### 3. Pinia 状态管理

```typescript
// stores/task.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('task', () => {
  // 状态
  const tasks = ref([])
  
  // 计算属性
  const completedTasks = computed(() => 
    tasks.value.filter(t => t.completed)
  )
  
  // 方法
  const fetchTasks = async () => {
    // 获取数据
  }
  
  return {
    tasks,
    completedTasks,
    fetchTasks
  }
})
```

### 4. 表单处理

```vue
<template>
  <el-form :model="formData" :rules="rules" ref="formRef">
    <el-form-item label="标题" prop="title">
      <el-input v-model="formData.title" />
    </el-form-item>
    <el-button @click="handleSubmit">提交</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()
const formData = ref({ title: '' })

const rules = {
  title: [{ required: true, message: '请输入标题' }]
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  // 提交数据
}
</script>
```

## 💡 常见问题

### Q1: 为什么使用 `<script setup>`？

**A:** `<script setup>` 是 Vue 3 推荐的写法，它：
- 更简洁，不需要 return
- 更好的 TypeScript 支持
- 更好的性能

### Q2: ref 和 reactive 的区别？

**A:** 
- `ref` 用于基本类型和对象，访问需要 `.value`
- `reactive` 仅用于对象，直接访问属性
- 模板中 `ref` 自动解包，不需要 `.value`

### Q3: 什么时候使用 computed？

**A:** 当需要基于响应式数据计算派生值时使用：
- 过滤列表
- 统计数据
- 格式化数据

### Q4: 如何实现组件通信？

**A:** 
- **父传子**: Props
- **子传父**: Emits
- **跨层级**: Provide/Inject 或 Pinia

## 🔍 代码阅读建议

### 阅读顺序

1. **类型定义** → 了解数据结构
2. **服务层** → 了解数据获取
3. **Store** → 了解状态管理
4. **组件** → 从简单到复杂

### 重点关注

- ✅ 响应式数据的定义和使用
- ✅ 计算属性的应用场景
- ✅ 事件处理的模式
- ✅ 组件通信的方式
- ✅ 生命周期钩子的使用

## 📝 练习建议

### 初级练习

1. 修改任务卡片的样式
2. 添加新的任务字段
3. 修改任务状态的颜色

### 中级练习

1. 添加任务搜索功能
2. 实现任务筛选
3. 添加任务排序

### 高级练习

1. 实现任务拖拽排序
2. 添加任务详情弹窗
3. 实现任务评论功能
4. 添加任务统计图表

## 🎉 下一步

完成这个项目后，你可以：

1. **扩展功能** - 添加更多实用功能
2. **优化性能** - 学习性能优化技巧
3. **学习其他技术** - Vue Router、Vuex 等
4. **构建真实项目** - 将学到的知识应用到实际项目

## 📚 推荐资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue 3 API 参考](https://cn.vuejs.org/api/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [TypeScript 文档](https://www.typescriptlang.org/zh/)

---

**祝你学习愉快！如有问题，请查看代码注释或参考文档。** 🚀


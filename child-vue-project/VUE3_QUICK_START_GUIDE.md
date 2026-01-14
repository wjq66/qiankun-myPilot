# Vue 3 快速上手指南

## 📚 核心概念

### 1. Composition API vs Options API

**Vue 3 推荐使用 Composition API（组合式 API）**

#### Options API（Vue 2 风格）
```vue
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

#### Composition API（Vue 3 推荐）
```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => {
  count.value++
}
</script>
```

**优势：**
- ✅ 更好的 TypeScript 支持
- ✅ 逻辑复用更灵活（组合式函数）
- ✅ 代码组织更清晰
- ✅ 更好的性能优化

---

## 🎯 核心 API 详解

### 1. 响应式数据

#### `ref` - 用于基本类型和对象
```typescript
import { ref } from 'vue'

// 基本类型
const count = ref(0)
console.log(count.value) // 访问值需要 .value

// 对象也可以
const user = ref({ name: 'John', age: 25 })
user.value.name = 'Jane' // 修改
```

#### `reactive` - 仅用于对象
```typescript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue 3'
})

// 直接访问，不需要 .value
state.count++
```

**⚠️ 注意事项：**
- `ref` 返回的是包装对象，访问需要 `.value`
- `reactive` 不能解构，否则会失去响应性
- 模板中自动解包 `ref`，不需要 `.value`

---

### 2. 计算属性

```typescript
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

// 带 getter 和 setter
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val) => {
    const names = val.split(' ')
    firstName.value = names[0]
    lastName.value = names[1]
  }
})
```

---

### 3. 监听器

#### `watch` - 监听单个或多个数据源
```typescript
import { ref, watch } from 'vue'

const count = ref(0)

// 监听单个
watch(count, (newVal, oldVal) => {
  console.log(`从 ${oldVal} 变为 ${newVal}`)
})

// 监听多个
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  // 处理变化
})

// 立即执行 + 深度监听
watch(count, (newVal) => {
  // 逻辑
}, { immediate: true, deep: true })
```

#### `watchEffect` - 自动追踪依赖
```typescript
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  // 自动追踪 count，当 count 变化时执行
  console.log(`当前值: ${count.value}`)
})
```

---

### 4. 生命周期钩子

```typescript
import { onMounted, onUpdated, onUnmounted } from 'vue'

onMounted(() => {
  // 组件挂载后执行
  console.log('组件已挂载')
})

onUpdated(() => {
  // 组件更新后执行
})

onUnmounted(() => {
  // 组件卸载前执行，清理工作
})
```

**完整生命周期：**
- `onBeforeMount` - 挂载前
- `onMounted` - 挂载后
- `onBeforeUpdate` - 更新前
- `onUpdated` - 更新后
- `onBeforeUnmount` - 卸载前
- `onUnmounted` - 卸载后

---

### 5. 组件通信

#### Props（父传子）
```vue
<!-- 子组件 -->
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()
// 或使用 withDefaults
const props = withDefaults(defineProps<Props>(), {
  count: 0
})
</script>
```

#### Emits（子传父）
```vue
<!-- 子组件 -->
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'delete', id: number): void
}>()

const handleClick = () => {
  emit('update', 100)
}
</script>
```

#### Provide / Inject（跨层级）
```typescript
// 父组件
import { provide } from 'vue'
provide('theme', 'dark')

// 子组件（任意层级）
import { inject } from 'vue'
const theme = inject('theme', 'light') // 第二个参数是默认值
```

---

## ⚠️ 常见注意事项

### 1. 响应式丢失问题

❌ **错误示例：**
```typescript
const state = reactive({ count: 0 })
const { count } = state // 解构会丢失响应性
count++ // 不会触发更新
```

✅ **正确做法：**
```typescript
// 方法1：使用 toRefs
const state = reactive({ count: 0 })
const { count } = toRefs(state)
count.value++ // 保持响应性

// 方法2：直接访问
state.count++

// 方法3：使用 ref
const count = ref(0)
```

---

### 2. 模板中的 ref 访问

```vue
<template>
  <div ref="divRef">内容</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const divRef = ref<HTMLElement | null>(null)

onMounted(() => {
  // 此时可以访问 DOM
  console.log(divRef.value)
})
</script>
```

---

### 3. 条件渲染和列表渲染

```vue
<template>
  <!-- v-if vs v-show -->
  <div v-if="isVisible">条件渲染（DOM 中不存在）</div>
  <div v-show="isVisible">显示/隐藏（DOM 中存在）</div>

  <!-- 列表渲染 -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>

  <!-- 带索引 -->
  <div v-for="(item, index) in list" :key="item.id">
    {{ index }}: {{ item.name }}
  </div>
</script>
```

---

### 4. 事件处理

```vue
<template>
  <!-- 内联处理 -->
  <button @click="count++">点击</button>

  <!-- 方法处理 -->
  <button @click="handleClick">点击</button>

  <!-- 带参数 -->
  <button @click="handleClick(id, $event)">点击</button>

  <!-- 事件修饰符 -->
  <form @submit.prevent="handleSubmit">
    <input @keyup.enter="handleEnter" />
  </form>
</template>

<script setup lang="ts">
const handleClick = (id: number, event: Event) => {
  event.preventDefault()
  // 处理逻辑
}
</script>
```

---

### 5. 表单双向绑定

```vue
<template>
  <!-- v-model -->
  <input v-model="text" />
  <textarea v-model="message"></textarea>
  <select v-model="selected">
    <option value="A">选项A</option>
  </select>

  <!-- 复选框 -->
  <input type="checkbox" v-model="checked" />
  
  <!-- 单选框 -->
  <input type="radio" v-model="picked" value="one" />

  <!-- 自定义组件 v-model -->
  <CustomInput v-model="text" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const text = ref('')
const message = ref('')
const selected = ref('')
const checked = ref(false)
const picked = ref('')
</script>
```

---

## 🎨 最佳实践

### 1. 使用 `<script setup>` 语法

```vue
<script setup lang="ts">
// 所有导入自动暴露给模板
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

// 变量自动暴露
const count = ref(0)

// 函数自动暴露
const increment = () => count.value++
</script>
```

---

### 2. 组合式函数（Composables）

创建可复用的逻辑：

```typescript
// composables/useCounter.ts
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  return {
    count,
    increment,
    decrement,
    reset
  }
}

// 使用
import { useCounter } from '@/composables/useCounter'
const { count, increment } = useCounter(10)
```

---

### 3. TypeScript 类型定义

```typescript
// 定义接口
interface User {
  id: number
  name: string
  email?: string
}

// Props 类型
interface Props {
  user: User
  count?: number
}

const props = defineProps<Props>()

// Emits 类型
const emit = defineEmits<{
  (e: 'update', user: User): void
  (e: 'delete', id: number): void
}>()
```

---

### 4. 性能优化

```typescript
// 使用 computed 缓存计算结果
const expensiveValue = computed(() => {
  // 复杂计算
  return heavyCalculation(data.value)
})

// 使用 shallowRef 优化大对象
import { shallowRef } from 'vue'
const largeData = shallowRef({ /* 大对象 */ })

// 使用 markRaw 标记非响应式对象
import { markRaw } from 'vue'
const chart = markRaw(new Chart())
```

---

## 📦 状态管理 - Pinia

### 基本使用

```typescript
// stores/task.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTaskStore = defineStore('task', () => {
  // 状态
  const tasks = ref([])
  const isLoading = ref(false)
  
  // 计算属性
  const completedTasks = computed(() => 
    tasks.value.filter(t => t.completed)
  )
  
  // 方法
  const fetchTasks = async () => {
    isLoading.value = true
    // 获取数据
    isLoading.value = false
  }
  
  return {
    tasks,
    isLoading,
    completedTasks,
    fetchTasks
  }
})

// 组件中使用
import { useTaskStore } from '@/stores/task'
const taskStore = useTaskStore()
taskStore.fetchTasks()
```

---

## 🚀 快速开始清单

- [ ] 理解 Composition API 和 `<script setup>`
- [ ] 掌握 `ref`、`reactive`、`computed`
- [ ] 学会使用 `watch` 和 `watchEffect`
- [ ] 熟悉生命周期钩子
- [ ] 理解组件通信（props、emits、provide/inject）
- [ ] 掌握 Pinia 状态管理
- [ ] 了解 TypeScript 在 Vue 3 中的使用
- [ ] 学会创建组合式函数（Composables）

---

## 📖 推荐学习路径

1. **基础阶段**：响应式数据、计算属性、监听器
2. **进阶阶段**：组件通信、生命周期、组合式函数
3. **实战阶段**：状态管理、路由、表单处理
4. **高级阶段**：性能优化、自定义指令、插件开发

---

## 🔗 官方资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue 3 API 参考](https://cn.vuejs.org/api/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)


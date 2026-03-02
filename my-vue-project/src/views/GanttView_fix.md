# 展开/折叠功能修复说明

## 问题原因
在 dhtmlx-gantt 中，如果在列配置中使用自定义 `template`，会覆盖默认的展开/折叠按钮。

## 解决方案

### 1. 移除列配置中的 template
```typescript
// ❌ 错误：不要这样做
gantt.config.columns = [
  { 
    name: 'text', 
    tree: true,
    template: (task) => { ... } // 这会覆盖展开/折叠按钮
  }
]

// ✅ 正确：只设置 tree: true
gantt.config.columns = [
  { 
    name: 'text', 
    label: '任务名称', 
    width: 250, 
    tree: true // 只设置这个，不要用 template
  }
]
```

### 2. 使用 grid_folder 和 grid_file 模板自定义显示
```typescript
// 配置网格中的文件夹图标（有子任务的任务）
gantt.templates.grid_folder = (task) => {
  let icon = '📁'
  if (task.type === 'project') icon = '📁'
  return `<span style="display: flex; align-items: center; gap: 4px;">
    <span style="font-size: 14px;">${icon}</span>
    <span>${task.text}</span>
  </span>`
}

// 配置网格中的文件图标（普通任务）
gantt.templates.grid_file = (task) => {
  let icon = '📄'
  if (task.type === 'milestone') icon = '🎯'
  return `<span style="display: flex; align-items: center; gap: 4px;">
    <span style="font-size: 14px;">${icon}</span>
    <span>${task.text}</span>
  </span>`
}
```

### 3. 确保数据格式正确
```typescript
// 父任务
{
  id: 1,
  text: '项目规划阶段',
  parent: 0,  // 0 表示顶级任务
  type: 'project'
}

// 子任务
{
  id: 2,
  text: '需求调研',
  parent: 1,  // 指向父任务 ID
  type: 'task'
}
```

### 4. 添加类型检查禁用
在文件开头添加：
```typescript
// @ts-nocheck - dhtmlx-gantt 类型定义不完整
```

## 关键点
- `tree: true` 必须在列配置中
- 不要在列配置中使用 `template`
- 使用 `grid_folder` 和 `grid_file` 来自定义显示
- dhtmlx-gantt 会自动根据任务是否有子任务来决定使用哪个模板


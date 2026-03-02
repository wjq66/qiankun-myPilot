# AG Grid Vue 3 学习文档

## 📚 目录

1. [快速开始](#快速开始)
2. [核心概念](#核心概念)
3. [列定义 (Column Definitions)](#列定义-column-definitions)
4. [数据绑定](#数据绑定)
5. [排序和筛选](#排序和筛选)
6. [分页](#分页)
7. [行选择](#行选择)
8. [单元格渲染器](#单元格渲染器)
9. [单元格编辑器](#单元格编辑器)
10. [事件处理](#事件处理)
11. [API 方法](#api-方法)
12. [样式和主题](#样式和主题)
13. [高级功能](#高级功能)
14. [常见问题](#常见问题)

---

## 快速开始

### 1. 安装依赖

```bash
npm install ag-grid-community ag-grid-vue3
```

### 2. 基础使用

```vue
<template>
  <ag-grid-vue
    class="ag-theme-alpine"
    :columnDefs="columnDefs"
    :rowData="rowData"
    style="width: 100%; height: 500px;"
  />
</template>

<script setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'

// 注册所有社区模块（必须）
ModuleRegistry.registerModules([AllCommunityModule])

const columnDefs = ref([
  { field: 'name', headerName: '姓名' },
  { field: 'age', headerName: '年龄' }
])

const rowData = ref([
  { name: '张三', age: 25 },
  { name: '李四', age: 30 }
])
</script>
```

---

## 核心概念

### Grid API

AG Grid 提供了强大的 API 来控制表格行为：

```typescript
// 获取 Grid API
const gridApi = agGridRef.value?.api

// 常用 API 方法
gridApi?.refreshCells()           // 刷新单元格
gridApi?.sizeColumnsToFit()        // 自动调整列宽
gridApi?.exportDataAsCsv()         // 导出 CSV
gridApi?.getSelectedRows()         // 获取选中的行
gridApi?.setRowData(newData)       // 设置新数据
```

### Column API

列相关的 API：

```typescript
const columnApi = agGridRef.value?.columnApi

columnApi?.autoSizeAllColumns()    // 自动调整所有列宽
columnApi?.moveColumn('field', 0)  // 移动列位置
```

---

## 列定义 (Column Definitions)

### 基础列定义

```typescript
const columnDefs = ref([
  {
    field: 'id',              // 数据字段名
    headerName: 'ID',         // 列标题
    width: 100,               // 固定宽度
    sortable: true,           // 可排序
    filter: true,             // 可筛选
    resizable: true           // 可调整宽度
  }
])
```

### 列宽设置

```typescript
{
  width: 100,                 // 固定宽度（像素）
  minWidth: 80,              // 最小宽度
  maxWidth: 200,             // 最大宽度
  flex: 1,                   // 弹性宽度（自动分配剩余空间）
  autoSizeColumn: true       // 自动调整宽度
}
```

### 列固定

```typescript
{
  pinned: 'left',            // 固定在左侧
  pinned: 'right',           // 固定在右侧
  lockPosition: true         // 锁定位置（防止拖拽移动）
}
```

### 列对齐

```typescript
{
  cellStyle: { textAlign: 'center' },  // 单元格样式
  headerClass: 'text-center'           // 表头样式类
}
```

---

## 数据绑定

### 静态数据

```typescript
const rowData = ref([
  { id: 1, name: '任务1' },
  { id: 2, name: '任务2' }
])
```

### 动态数据加载

```typescript
import { onMounted } from 'vue'

const rowData = ref([])

const loadData = async () => {
  try {
    const response = await fetch('/api/tasks')
    const data = await response.json()
    rowData.value = data
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
```

### 更新数据

```typescript
// 方式1：直接更新 ref
rowData.value = newData

// 方式2：使用 API
agGridRef.value?.api.setRowData(newData)

// 方式3：更新单行
agGridRef.value?.api.applyTransaction({ update: [updatedRow] })
```

---

## 排序和筛选

### 排序配置

```typescript
{
  sortable: true,                    // 启用排序
  sort: 'asc',                       // 默认排序方向
  comparator: (valueA, valueB) => {  // 自定义排序逻辑
    return valueA.localeCompare(valueB)
  }
}
```

### 筛选器类型

```typescript
{
  // 文本筛选器
  filter: 'agTextColumnFilter',
  
  // 数字筛选器
  filter: 'agNumberColumnFilter',
  
  // 日期筛选器
  filter: 'agDateColumnFilter',
  
  // 集合筛选器（下拉多选）
  filter: 'agSetColumnFilter',
  
  // 自定义筛选器
  filter: CustomFilterComponent
}
```

### 浮动筛选器

```typescript
const defaultColDef = {
  floatingFilter: true  // 在表头下方显示筛选输入框
}
```

### 筛选事件

```vue
<ag-grid-vue
  @filter-changed="onFilterChanged"
/>

<script setup>
const onFilterChanged = (event) => {
  const filterModel = event.api.getFilterModel()
  console.log('当前筛选条件:', filterModel)
  console.log('显示的行数:', event.api.getDisplayedRowCount())
}
</script>
```

---

## 分页

### 基础分页

```vue
<ag-grid-vue
  :pagination="true"
  :paginationPageSize="20"
/>
```

### 分页配置

```typescript
{
  pagination: true,                    // 启用分页
  paginationPageSize: 20,              // 每页显示数量
  paginationPageSizeSelector: [10, 20, 50, 100],  // 每页数量选择器
  paginationAutoPageSize: false,       // 自动计算每页数量
  suppressPaginationPanel: false       // 隐藏分页面板
}
```

### 服务器端分页

```typescript
// 使用 Infinite Row Model
import { InfiniteRowModelModule } from 'ag-grid-community'

ModuleRegistry.registerModules([InfiniteRowModelModule])

const gridOptions = {
  rowModelType: 'infinite',
  datasource: {
    getRows: (params) => {
      // 从服务器加载数据
      fetch(`/api/tasks?start=${params.startRow}&end=${params.endRow}`)
        .then(response => response.json())
        .then(data => {
          params.successCallback(data.rows, data.lastRow)
        })
    }
  }
}
```

---

## 行选择

### 单选

```vue
<ag-grid-vue
  rowSelection="single"
  @selection-changed="onSelectionChanged"
/>
```

### 多选

```vue
<ag-grid-vue
  rowSelection="multiple"
  :suppressRowClickSelection="false"  // 允许点击行选择
  @selection-changed="onSelectionChanged"
/>
```

### 复选框列

```typescript
{
  headerCheckboxSelection: true,  // 表头显示全选复选框
  checkboxSelection: true,         // 行显示复选框
  width: 60
}
```

### 选择事件

```typescript
const onSelectionChanged = (event) => {
  const selectedRows = event.api.getSelectedRows()
  console.log('选中的行:', selectedRows)
}
```

### 编程式选择

```typescript
// 选择所有行
agGridRef.value?.api.selectAll()

// 取消选择所有行
agGridRef.value?.api.deselectAll()

// 选择指定行
agGridRef.value?.api.getRowNode('row-id')?.setSelected(true)
```

---

## 单元格渲染器

### 函数式渲染器

```typescript
{
  cellRenderer: (params) => {
    return `<span style="color: ${params.value > 50 ? 'red' : 'green'}">${params.value}</span>`
  }
}
```

### 组件渲染器

```typescript
// 1. 定义组件
const StatusRenderer = {
  template: `
    <span :style="{ color: color }">{{ status }}</span>
  `,
  setup(props) {
    const colorMap = {
      '待办': '#909399',
      '进行中': '#409eff',
      '已完成': '#67c23a'
    }
    return {
      status: props.value,
      color: colorMap[props.value] || '#909399'
    }
  }
}

// 2. 在列定义中使用
{
  cellRenderer: StatusRenderer
}
```

### 值格式化器

```typescript
{
  valueFormatter: (params) => {
    return new Date(params.value).toLocaleDateString('zh-CN')
  }
}
```

---

## 单元格编辑器

### 内置编辑器

```typescript
{
  editable: true,
  
  // 文本编辑器（默认）
  cellEditor: 'agTextCellEditor',
  
  // 数字编辑器
  cellEditor: 'agNumberCellEditor',
  cellEditorParams: {
    min: 0,
    max: 100
  },
  
  // 下拉选择编辑器
  cellEditor: 'agSelectCellEditor',
  cellEditorParams: {
    values: ['选项1', '选项2', '选项3']
  },
  
  // 日期编辑器
  cellEditor: 'agDateCellEditor'
}
```

### 自定义编辑器

```typescript
const CustomEditor = {
  template: `
    <input 
      v-model="value" 
      @keydown.enter="onEnter"
      @keydown.esc="onEscape"
    />
  `,
  setup(props) {
    const value = ref(props.value)
    
    const onEnter = () => {
      props.stopEditing()
    }
    
    const onEscape = () => {
      props.stopEditing(true)  // true 表示取消编辑
    }
    
    return { value, onEnter, onEscape }
  }
}

// 使用
{
  cellEditor: CustomEditor
}
```

### 编辑事件

```vue
<ag-grid-vue
  @cell-value-changed="onCellValueChanged"
  @cell-editing-started="onCellEditingStarted"
  @cell-editing-stopped="onCellEditingStopped"
/>
```

---

## 事件处理

### 常用事件

```vue
<ag-grid-vue
  @grid-ready="onGridReady"              // 表格就绪
  @row-clicked="onRowClicked"            // 行点击
  @row-double-clicked="onRowDoubleClicked" // 行双击
  @cell-clicked="onCellClicked"          // 单元格点击
  @cell-value-changed="onCellValueChanged" // 单元格值变化
  @selection-changed="onSelectionChanged"  // 选择变化
  @sort-changed="onSortChanged"           // 排序变化
  @filter-changed="onFilterChanged"       // 筛选变化
  @column-resized="onColumnResized"       // 列宽调整
  @column-moved="onColumnMoved"          // 列移动
/>
```

### 事件处理示例

```typescript
const onGridReady = (params) => {
  console.log('表格已就绪')
  params.api.sizeColumnsToFit()
}

const onRowDoubleClicked = (event) => {
  console.log('双击行:', event.data)
  // 打开详情对话框
}

const onCellValueChanged = (event) => {
  console.log('值已更改:', {
    oldValue: event.oldValue,
    newValue: event.newValue,
    field: event.colDef.field
  })
  // 保存到服务器
}
```

---

## API 方法

### 数据操作

```typescript
// 设置数据
api.setRowData(newData)

// 更新行
api.applyTransaction({ update: [updatedRow] })

// 添加行
api.applyTransaction({ add: [newRow] })

// 删除行
api.applyTransaction({ remove: [rowToRemove] })

// 刷新单元格
api.refreshCells({ rowNodes: [rowNode] })
```

### 选择和导航

```typescript
// 选择
api.selectAll()
api.deselectAll()
api.getSelectedRows()

// 导航
api.ensureNodeVisible(rowNode)
api.ensureIndexVisible(index)
```

### 导出

```typescript
// 导出 CSV
api.exportDataAsCsv({
  fileName: 'data.csv',
  onlySelected: false
})

// 导出 Excel（需要企业版）
api.exportDataAsExcel({
  fileName: 'data.xlsx'
})
```

### 列操作

```typescript
// 自动调整列宽
api.sizeColumnsToFit()
api.autoSizeAllColumns()

// 获取列状态
api.getColumnState()

// 设置列状态
api.applyColumnState({
  state: [{ colId: 'name', width: 200 }]
})
```

---

## 样式和主题

### 内置主题

AG Grid 提供多个内置主题：

- `ag-theme-alpine` - 现代简洁风格（推荐）
- `ag-theme-balham` - 经典风格
- `ag-theme-material` - Material Design 风格
- `ag-theme-quartz` - 最新主题

```vue
<ag-grid-vue class="ag-theme-alpine" />
```

### 自定义样式

```css
/* 覆盖 CSS 变量 */
.ag-theme-alpine {
  --ag-header-background-color: #f0f0f0;
  --ag-header-foreground-color: #333;
  --ag-border-color: #ddd;
  --ag-row-hover-color: #f5f5f5;
}

/* 自定义单元格样式 */
:deep(.ag-cell) {
  padding: 12px;
}

/* 自定义表头样式 */
:deep(.ag-header-cell) {
  font-weight: 600;
}
```

### 行样式

```typescript
{
  rowClass: 'custom-row-class',
  rowClassRules: {
    'row-highlight': (params) => params.data.status === 'urgent',
    'row-disabled': (params) => params.data.disabled
  }
}
```

---

## 高级功能

### 分组

```typescript
import { RowGroupingModule } from 'ag-grid-community'

ModuleRegistry.registerModules([RowGroupingModule])

const columnDefs = [
  {
    rowGroup: true,      // 启用分组
    hide: true           // 隐藏分组列
  }
]

const gridOptions = {
  groupDefaultExpanded: 1,  // 默认展开层级
  groupDisplayType: 'singleColumn'  // 分组显示方式
}
```

### 聚合

```typescript
{
  field: 'amount',
  aggFunc: 'sum',  // 聚合函数：sum, avg, min, max, count
  valueGetter: (params) => params.data.amount
}
```

### 虚拟滚动

AG Grid 默认启用虚拟滚动，可以高效处理大量数据：

```typescript
// 无需额外配置，自动启用
// 可以处理数万行数据而不影响性能
```

### 上下文菜单

```typescript
{
  contextMenuItems: [
    'copy',
    'copyWithHeaders',
    'paste',
    'separator',
    'export'
  ]
}
```

---

## 常见问题

### 1. 表格不显示

**问题**：表格区域空白

**解决方案**：
- 确保设置了明确的高度：`style="height: 500px;"`
- 检查数据是否正确绑定
- 检查列定义是否正确

### 2. 模块未注册错误

**问题**：`Module not found` 错误

**解决方案**：
```typescript
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])
```

### 3. 样式不生效

**问题**：主题样式未应用

**解决方案**：
- 确保引入了主题 CSS：`import 'ag-grid-community/styles/ag-grid.css'`
- 确保添加了主题类：`class="ag-theme-alpine"`

### 4. 中文显示问题

**问题**：分页、筛选等显示英文

**解决方案**：
```typescript
const localeText = {
  page: '页',
  more: '更多',
  // ... 其他中文本地化配置
}

<ag-grid-vue :localeText="localeText" />
```

### 5. 性能优化

**建议**：
- 使用虚拟滚动（默认启用）
- 避免在渲染器中进行复杂计算
- 使用 `valueGetter` 而不是在数据中预处理
- 合理使用 `suppressCellFocus` 提升性能

---

## 参考资源

### 官方文档

- [AG Grid Vue 官方文档](https://www.ag-grid.com/vue-data-grid/)
- [API 参考](https://www.ag-grid.com/vue-data-grid/grid-options/)
- [示例集合](https://www.ag-grid.com/vue-data-grid/example/)

### 中文资源

- [AG Grid 中文官网](https://www.aggrid.com.cn/)
- [Vue 3 中使用 AG Grid 教程](https://www.cnblogs.com/150536FBB/p/15793551.html)

### 社区支持

- [GitHub Issues](https://github.com/ag-grid/ag-grid/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/ag-grid)

---

## 总结

AG Grid 是一个功能强大、性能优秀的表格组件，特别适合处理大量数据和复杂交互场景。通过本文档的学习，你应该能够：

1. ✅ 快速集成 AG Grid 到 Vue 3 项目
2. ✅ 配置列定义和数据绑定
3. ✅ 实现排序、筛选、分页等功能
4. ✅ 使用单元格渲染器和编辑器
5. ✅ 处理各种事件和 API 调用
6. ✅ 自定义样式和主题

继续深入学习，可以探索更多高级功能，如服务器端分页、分组、聚合等。

---

**最后更新**: 2024年1月


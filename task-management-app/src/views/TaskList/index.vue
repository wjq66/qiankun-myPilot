<template>
  <div class="task-list-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增任务
      </el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除 ({{ selectedRows.length }})
      </el-button>
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- AG Grid 表格 -->
    <ag-grid-vue
      ref="agGridRef"
      class="ag-theme-alpine task-grid"
      style="height: 100%"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :treeData="true"
      :getDataPath="getDataPath"
      :isGroup="isGroup"
      :getChildCount="getChildCount"
      :isServerSideGroup="isServerSideGroup"
      :autoGroupColumnDef="autoGroupColumnDef"
      :getRowId="getRowId"
      :pagination="true"
      :paginationPageSize="20"
      :paginationPageSizeSelector="[10, 20, 50, 100]"
      :rowSelection="{ mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: false }"
      :animateRows="true"
      :rowHeight="50"
      :headerHeight="45"
      :localeText="localeText"
      @grid-ready="onGridReady"
      @selection-changed="onSelectionChanged"
      @row-double-clicked="onRowDoubleClicked"
      @cell-value-changed="onCellValueChanged"
      @sort-changed="onSortChanged"
      @filter-changed="onFilterChanged"
      @row-expanded="onRowExpanded"
    />
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'
import type { ColDef, GridReadyEvent, SelectionChangedEvent, RowDoubleClickedEvent, CellValueChangedEvent, SortChangedEvent, FilterChangedEvent } from 'ag-grid-community'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download, Refresh } from '@element-plus/icons-vue'
import { fetchTaskList, fetchChildTasks, type TaskListItem } from '../../services/taskListMockData'

// 注册 AG Grid 模块（社区版 + 企业版的 TreeDataModule）
ModuleRegistry.registerModules([AllCommunityModule, TreeDataModule as any])

// 表格引用
const agGridRef = ref<any>(null)

// 选中的行数据
const selectedRows = ref<any[]>([])

// 使用 TaskListItem 类型
type Task = TaskListItem

// 列定义
// 注意：在树形数据模式下，autoGroupColumnDef 会自动创建一列显示 title 和展开/折叠按钮
// 但如果所有节点都是顶级节点，可能不会自动创建，所以显式添加 title 列
const columnDefs = ref<ColDef[]>([
  // 显式添加 title 列，使用自定义 cellRenderer 显示展开/折叠按钮
  {
    headerName: '任务标题',
    field: 'title',
    pinned: 'left',
    lockPosition: true,
    cellRenderer: (params: any) => {
      const data = params.data
      const node = params.node
      const hasChildren = data?.hasChildren || data?.group
      const isExpanded = node?.expanded || false
      
      // 如果有子节点，显示展开/折叠按钮
      if (hasChildren) {
        const expandIcon = isExpanded ? '▼' : '▶'
        const icon = '📁'
        return `
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="cursor: pointer; user-select: none; font-size: 12px; color: #666; width: 16px; display: inline-block; text-align: center;" 
                  onclick="window.toggleRowExpansion(${data.id})">${expandIcon}</span>
            <span style="margin-right: 4px;">${icon}</span>
            <span style="font-weight: 600; color: #409eff;">${params.value || ''}</span>
          </div>
        `
      } else {
        const icon = '📄'
        return `
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 16px; display: inline-block;"></span>
            <span style="margin-right: 4px;">${icon}</span>
            <span style="font-weight: 500; color: #333;">${params.value || ''}</span>
          </div>
        `
      }
    },
    onCellClicked: (params: any) => {
      // 点击展开按钮区域时触发展开/折叠
      const target = params.event.target
      if (target && target.getAttribute('onclick')) {
        const dataId = parseInt(target.getAttribute('onclick').match(/\d+/)?.[0] || '0')
        if (dataId > 0) {
          toggleRowExpansion(dataId)
        }
      }
    },
    width: 300,
    minWidth: 200,
    maxWidth: 500,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true,
    resizable: true
  },
  {
    field: 'description',
    headerName: '描述',
    flex: 2,
    minWidth: 150,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: any) => {
      const desc = params.value || ''
      return desc.length > 50 ? `<span title="${desc}">${desc.substring(0, 50)}...</span>` : desc
    }
  },
  {
    field: 'status',
    headerName: '状态',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter', // 使用文本筛选器（社区版支持）
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'contains'], // 筛选选项
      defaultOption: 'equals' // 默认使用"等于"筛选
    },
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['待办', '进行中', '已完成', '已取消']
    },
    cellRenderer: (params: any) => {
      const statusMap: Record<string, { color: string; bg: string }> = {
        '待办': { color: '#909399', bg: '#f4f4f5' },
        '进行中': { color: '#409eff', bg: '#ecf5ff' },
        '已完成': { color: '#67c23a', bg: '#f0f9ff' },
        '已取消': { color: '#f56c6c', bg: '#fef0f0' }
      }
      const status = statusMap[params.value] || statusMap['待办']
      return `<span style="padding: 4px 12px; border-radius: 4px; background: ${status.bg}; color: ${status.color}; font-size: 12px;">${params.value}</span>`
    }
  },
  {
    field: 'priority',
    headerName: '优先级',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter', // 使用文本筛选器（社区版支持）
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'contains'], // 筛选选项
      defaultOption: 'equals' // 默认使用"等于"筛选
    },
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['低', '中', '高', '紧急']
    },
    cellRenderer: (params: any) => {
      const priorityMap: Record<string, { color: string; icon: string }> = {
        '低': { color: '#909399', icon: '⬇️' },
        '中': { color: '#409eff', icon: '➡️' },
        '高': { color: '#e6a23c', icon: '⬆️' },
        '紧急': { color: '#f56c6c', icon: '🔥' }
      }
      const priority = priorityMap[params.value] || priorityMap['中']
      return `<span style="color: ${priority.color}; font-weight: 500;">${priority.icon} ${params.value}</span>`
    }
  },
  {
    field: 'assignee',
    headerName: '负责人',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true
  },
  {
    field: 'progress',
    headerName: '进度',
    width: 150,
    sortable: true,
    filter: 'agNumberColumnFilter',
    editable: true,
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: {
      min: 0,
      max: 100
    },
    cellRenderer: (params: any) => {
      const progress = params.value || 0
      const color = progress < 30 ? '#f56c6c' : progress < 70 ? '#e6a23c' : '#67c23a'
      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;">
            <div style="width: ${progress}%; height: 100%; background: ${color}; transition: width 0.3s;"></div>
          </div>
          <span style="font-size: 12px; color: ${color}; font-weight: 500;">${progress}%</span>
        </div>
      `
    }
  },
  {
    headerName: '操作',
    width: 150,
    pinned: 'right', // 固定在右侧
    lockPosition: true,
    filter: false,
    cellRenderer: (params: any) => {
      return `
        <div style="display: flex; gap: 8px; justify-content: center;">
          <button class="action-btn edit-btn" data-action="edit" data-id="${params.data.id}">编辑</button>
          <button class="action-btn delete-btn" data-action="delete" data-id="${params.data.id}">删除</button>
        </div>
      `
    },
    onCellClicked: (event: any) => {
      const action = event.event.target.getAttribute('data-action')
      const id = parseInt(event.event.target.getAttribute('data-id'))
      if (action === 'edit') {
        handleEdit(id)
      } else if (action === 'delete') {
        handleDelete(id)
      }
    }
  }
])

// 默认列配置
const defaultColDef = ref<ColDef>({
  sortable: true,
  filter: true,
  resizable: true,
  editable: false,
  floatingFilter: true // 显示浮动过滤器
})

// 表格数据（从 mock 服务加载）
const rowData = ref<Task[]>([])

// 加载初始数据
const loadInitialData = async () => {
  try {
    console.log('开始加载数据...')
    const data = await fetchTaskList()
    console.log('数据加载完成，条数:', data.length)
    
    // 直接更新 rowData，AG Grid 会自动响应式更新
    rowData.value = data
    console.log('rowData 已更新，条数:', rowData.value.length)
    
    // 如果表格已经就绪，强制刷新树形数据
    if (agGridRef.value?.api) {
      // 在树形数据模式下，使用 refreshClientSideRowModel 刷新数据
      try {
        agGridRef.value.api.refreshClientSideRowModel('everything')
        console.log('表格数据已刷新（使用 refreshClientSideRowModel）')
      } catch (e) {
        console.warn('refreshClientSideRowModel 失败，尝试其他方法:', e)
        // 备用方法：使用 setGridOption
        try {
          agGridRef.value.api.setGridOption('rowData', rowData.value)
          console.log('表格数据已更新（使用 setGridOption）')
        } catch (e2) {
          console.warn('setGridOption 也失败:', e2)
        }
      }
      
      // 验证数据是否正确设置
      setTimeout(() => {
        const displayedRowCount = agGridRef.value?.api.getDisplayedRowCount()
        const rowCount = agGridRef.value?.api.getDisplayedRowCount()
        console.log('表格显示的行数:', displayedRowCount)
        console.log('实际数据条数:', rowData.value.length)
        
        // 检查所有节点
        const allNodes: any[] = []
        agGridRef.value?.api.forEachNode((node: any) => {
          allNodes.push({
            id: node.data?.id,
            title: node.data?.title,
            visible: node.rowVisible !== false
          })
        })
        console.log('节点总数:', allNodes.length)
        console.log('可见节点数:', allNodes.filter(n => n.visible !== false).length)
      }, 300)
    } else {
      console.log('表格尚未就绪，数据将在表格就绪后自动显示')
    }
    
    ElMessage.success(`数据加载成功，共 ${data.length} 条`)
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('数据加载失败')
  }
}

// 获取行 ID（用于 treeData，必需）
const getRowId = (params: any) => {
  return params.data.id.toString()
}

// 判断节点是否为分组节点（用于显示展开按钮）
const isGroup = (dataItem: Task): boolean => {
  // 如果节点标记为有子节点，则认为是分组节点
  return !!(dataItem.hasChildren || dataItem.group)
}

// 获取子节点数量（用于告诉 AG Grid 节点有子节点，即使还没加载）
const getChildCount = (dataItem: Task): number => {
  // 如果节点标记为有子节点，返回 1（表示有子节点，但数量未知）
  // 返回 > 0 的值会让 AG Grid 显示展开按钮
  if (dataItem.hasChildren || dataItem.group) {
    return 1 // 返回 1 表示有子节点，但具体数量未知（异步加载）
  }
  return 0 // 没有子节点
}

// 判断是否为服务器端分组节点（用于异步加载子节点）
const isServerSideGroup = (dataItem: Task): boolean => {
  // 如果节点标记为有子节点但子节点未加载，则认为是服务器端分组节点
  // 这会让 AG Grid 显示展开按钮，即使子节点还没加载
  return !!(dataItem.hasChildren || dataItem.group)
}

// 树形数据路径获取函数（必需，用于确定树形结构）
const getDataPath = (data: Task): string[] => {
  // 如果有 path 且不为空，直接返回
  if (data.path && Array.isArray(data.path) && data.path.length > 0) {
    return data.path
  }
  // 如果是分组节点但没有 path，生成一个
  if (data.group || data.hasChildren) {
    const groupName = data.id === 1 ? '项目组A' : data.id === 2 ? '项目组B' : `组${data.id}`
    return [groupName]
  }
  // 普通节点也返回 path（作为顶级节点显示）
  // 注意：AG Grid 树形数据模式下，返回空数组的节点不会显示
  // 所以普通节点也需要有 path
  return data.path || [`任务${data.id}`]
}

// 自动分组列定义（用于树形数据）
// 这个列会自动显示展开/折叠按钮（▶/▼）
const autoGroupColumnDef = ref<ColDef>({
  headerName: '任务标题',
  field: 'title',
  pinned: 'left', // 固定在左侧，确保显示在最前面
  lockPosition: true, // 锁定位置
  cellRenderer: 'agGroupCellRenderer',
  cellRendererParams: {
    suppressCount: true, // 不显示子节点数量
    // 注意：checkbox 由 rowSelection.checkboxes 控制，不需要在这里设置
    innerRenderer: (params: any) => {
      // 自定义内容渲染（在展开按钮后面显示的内容）
      const isGroup = params.data?.group || params.data?.hasChildren
      const icon = isGroup ? '📁' : '📄'
      const color = isGroup ? '#409eff' : '#333'
      const fontWeight = isGroup ? '600' : '500'
      return `<span style="font-weight: ${fontWeight}; color: ${color};">
        <span style="margin-right: 4px;">${icon}</span>${params.value || ''}
      </span>`
    }
  },
  width: 300, // 设置固定宽度，确保列可见
  minWidth: 200,
  maxWidth: 500,
  sortable: true,
  filter: 'agTextColumnFilter',
  editable: true,
  resizable: true // 允许调整宽度
})

// 切换行展开/折叠（自定义函数，供 cellRenderer 调用）
const toggleRowExpansion = async (taskId: number) => {
  if (!agGridRef.value?.api) return
  
  let targetNode: any = null
  agGridRef.value.api.forEachNode((node: any) => {
    if (node.data?.id === taskId) {
      targetNode = node
    }
  })
  
  if (!targetNode) {
    console.warn('未找到节点:', taskId)
    return
  }
  
  const data = targetNode.data as Task
  
  // 如果是父节点且子节点未加载，先加载子节点
  if (data.hasChildren && !data.childrenLoaded) {
    try {
      ElMessage.info(`正在加载 ${data.title} 的子任务...`)
      
      // 异步加载子节点
      const children = await fetchChildTasks(data.id, data.title)
      
      // 获取父节点的路径
      const parentPath = getDataPath(data)
      
      // 为每个子节点设置正确的路径（包含父节点路径）
      children.forEach((child, index) => {
        child.path = [...parentPath, `子任务${index + 1}`]
        child.group = false
        child.hasChildren = false
        child.childrenLoaded = false
      })
      
      // 更新数据：标记子节点已加载
      const allData = [...rowData.value]
      const parentIndex = allData.findIndex(item => item.id === data.id)
      
      if (parentIndex !== -1) {
        // 标记父节点已加载
        allData[parentIndex].childrenLoaded = true
        
        // 在父节点后插入子节点
        allData.splice(parentIndex + 1, 0, ...children)
        rowData.value = allData
        
        // 刷新表格数据
        agGridRef.value.api.refreshClientSideRowModel('everything')
        
        // 延迟展开节点，确保数据已更新
        setTimeout(() => {
          agGridRef.value?.api.forEachNode((node: any) => {
            if (node.data?.id === taskId) {
              node.setExpanded(true)
              // 刷新单元格以更新展开图标
              agGridRef.value?.api.refreshCells({ rowNodes: [node], columns: ['title'] })
            }
          })
        }, 100)
      }
      
      ElMessage.success(`已加载 ${children.length} 个子任务`)
    } catch (error) {
      console.error('加载子节点失败:', error)
      ElMessage.error('加载子任务失败')
    }
  } else {
    // 如果子节点已加载，直接切换展开状态
    const isExpanded = targetNode.expanded
    targetNode.setExpanded(!isExpanded)
    
    // 刷新单元格以更新展开图标
    agGridRef.value.api.refreshCells({ rowNodes: [targetNode], columns: ['title'] })
  }
}

// 将函数暴露到全局，供 cellRenderer 中的 onclick 调用
if (typeof window !== 'undefined') {
  (window as any).toggleRowExpansion = toggleRowExpansion
}

// 行展开事件 - 异步加载子节点（保留作为备用）
const onRowExpanded = async (event: any) => {
  const node = event.node
  const data = node.data as Task
  
  // 如果是父节点且子节点未加载
  if (data.hasChildren && !data.childrenLoaded) {
    await toggleRowExpansion(data.id)
  }
}

// 中文本地化配置
const localeText = ref({
  // 分页相关
  page: '页',
  more: '更多',
  to: '到',
  of: '共',
  next: '下一页',
  last: '最后一页',
  first: '第一页',
  previous: '上一页',
  loadingOoo: '加载中...',
  // 筛选相关
  selectAll: '全选',
  searchOoo: '搜索...',
  blanks: '空白',
  // 其他
  noRowsToShow: '暂无数据',
  // 工具栏
  pinColumn: '固定列',
  pinLeft: '固定在左侧',
  pinRight: '固定在右侧',
  noPin: '取消固定',
  valueAggregation: '值聚合',
  autosizeThiscolumn: '自动调整此列',
  autosizeAllColumns: '自动调整所有列',
  groupBy: '分组',
  ungroupBy: '取消分组',
  resetColumns: '重置列',
  expandAll: '展开全部',
  collapseAll: '折叠全部',
  toolPanel: '工具面板',
  export: '导出',
  csvExport: 'CSV导出',
  excelExport: 'Excel导出',
  // 筛选器
  filterOoo: '筛选...',
  equals: '等于',
  notEqual: '不等于',
  contains: '包含',
  notContains: '不包含',
  startsWith: '开始于',
  endsWith: '结束于',
  andCondition: '且',
  orCondition: '或',
  applyFilter: '应用筛选',
  resetFilter: '重置筛选',
  clearFilter: '清除筛选'
})

// 表格就绪事件
const onGridReady = (params: GridReadyEvent) => {
  console.log('=== AG Grid 表格就绪事件开始 ===')
  console.log('AG Grid 表格已就绪', params)
  console.log('当前数据条数:', rowData.value.length)
  
  // 如果数据还没有加载，现在加载
  if (rowData.value.length === 0) {
    console.log('表格已就绪，但数据为空，开始加载数据...')
    loadInitialData().then(() => {
      // 数据加载完成后，检查节点信息
      setTimeout(() => {
        checkNodeInfo(params)
      }, 500)
    })
  } else {
    // 如果数据已加载，确保表格显示最新数据
    console.log('数据已存在，刷新表格显示')
    // 在树形数据模式下，使用 refreshClientSideRowModel 刷新树形数据
    try {
      params.api.refreshClientSideRowModel('everything')
      console.log('表格数据已刷新（使用 refreshClientSideRowModel）')
    } catch (e) {
      console.warn('refreshClientSideRowModel 失败:', e)
      params.api.refreshCells()
    }
    // 立即检查节点信息
    setTimeout(() => {
      checkNodeInfo(params)
    }, 300)
  }
  
  // 检查列配置
  const columnState = params.api.getColumnState()
  console.log('当前列配置:', columnState)
  console.log('autoGroupColumnDef 配置:', autoGroupColumnDef.value)
  
  // 确保自动分组列可见
  const autoColumn = columnState.find((col: any) => col.colId === 'ag-Grid-AutoColumn')
  if (autoColumn) {
    console.log('找到自动分组列:', autoColumn)
    if (autoColumn.hide) {
      console.log('自动分组列被隐藏，正在显示...')
      params.api.setColumnsVisible(['ag-Grid-AutoColumn'], true)
    }
    if (autoColumn.width === 0 || !autoColumn.width) {
      console.log('自动分组列宽度为0，设置宽度...')
      params.api.setColumnWidths([{ key: 'ag-Grid-AutoColumn', newWidth: 300 }])
    }
    
    // 强制确保列在最前面（固定列会自动在最前面，这里只是确保）
    console.log('自动分组列配置正确，应该显示在最左侧')
  } else {
    console.warn('未找到自动分组列！')
  }
  
  // 延迟检查列是否真的显示
  setTimeout(() => {
    const updatedColumnState = params.api.getColumnState()
    const updatedAutoColumn = updatedColumnState.find((col: any) => col.colId === 'ag-Grid-AutoColumn')
    if (updatedAutoColumn) {
      console.log('延迟检查 - 自动分组列状态:', {
        colId: updatedAutoColumn.colId,
        hide: updatedAutoColumn.hide,
        width: updatedAutoColumn.width,
        pinned: updatedAutoColumn.pinned
      })
      
      // 检查DOM中是否真的存在这个列
      const headerCell = document.querySelector('.ag-header-cell[col-id="ag-Grid-AutoColumn"]')
      const bodyCell = document.querySelector('.ag-cell[col-id="ag-Grid-AutoColumn"]')
      console.log('DOM检查 - 表头单元格:', headerCell ? '存在' : '不存在')
      console.log('DOM检查 - 数据单元格:', bodyCell ? '存在' : '不存在')
    }
  }, 500)
  
  // 自动调整列宽以适应容器（但排除自动分组列，因为它已经固定宽度）
  params.api.sizeColumnsToFit()
  console.log('=== AG Grid 表格就绪事件结束 ===')
}

// 检查节点信息的函数
const checkNodeInfo = (params: GridReadyEvent) => {
  console.log('=== 开始检查节点信息 ===')
  console.log('当前 rowData 长度:', rowData.value.length)
  
  if (rowData.value.length === 0) {
    console.log('警告：rowData 为空，无法检查节点信息')
    return
  }
  
  console.log('前5条数据示例:')
  rowData.value.slice(0, 5).forEach((data, index) => {
    console.log(`数据 ${index + 1}:`, {
      id: data.id,
      title: data.title,
      path: data.path,
      hasChildren: data.hasChildren,
      group: data.group,
      isGroupResult: isGroup(data), // 检查 isGroup 函数的结果
      getDataPath: getDataPath(data),
      pathLength: getDataPath(data).length
    })
  })
  
  // 检查所有数据的 path 分布
  const pathGroups: Record<string, number> = {}
  rowData.value.forEach(data => {
    const path = getDataPath(data).join('/')
    pathGroups[path] = (pathGroups[path] || 0) + 1
  })
  console.log('Path 分布:', pathGroups)
  console.log('总数据条数:', rowData.value.length)
  
  // 检查所有节点
  const allNodes: any[] = []
  params.api.forEachNode((node: any) => {
    const isGroupNode = isGroup(node.data)
    allNodes.push({
      id: node.data?.id,
      title: node.data?.title,
      path: node.data?.path,
      level: node.level,
      expanded: node.expanded,
      hasChildren: node.data?.hasChildren,
      isGroup: isGroupNode,
      nodeGroup: node.group, // AG Grid 内部的 group 标记
      canHaveChildren: node.canHaveChildren, // AG Grid 判断是否可以展开
      visible: node.rowVisible
    })
  })
  console.log('所有节点信息（前10个）:', allNodes.slice(0, 10))
  console.log('节点总数:', allNodes.length)
  console.log('可见节点数:', allNodes.filter(n => n.visible !== false).length)
  
  // 检查有子节点的节点
  const nodesWithChildren = allNodes.filter(n => n.hasChildren || n.isGroup)
  console.log('有子节点的节点数量:', nodesWithChildren.length)
  console.log('有子节点的节点详情:', nodesWithChildren.slice(0, 5))
  
  // 检查 AG Grid 认为可以展开的节点
  const expandableNodes = allNodes.filter(n => n.canHaveChildren)
  console.log('AG Grid 认为可以展开的节点数量:', expandableNodes.length)
  console.log('AG Grid 认为可以展开的节点详情:', expandableNodes.slice(0, 5))
  
  // 检查前两个节点（应该是项目组A和B）的详细信息
  if (allNodes.length >= 2) {
    console.log('=== 前两个节点详细信息（应该是项目组A和B）===')
    console.log('节点1:', allNodes[0])
    console.log('节点2:', allNodes[1])
  }
  
  console.log('=== 节点检查完成 ===')
}

// 选择变化事件
const onSelectionChanged = (event: SelectionChangedEvent) => {
  selectedRows.value = event.api.getSelectedRows()
  console.log('选中的行:', selectedRows.value)
}

// 行双击事件
const onRowDoubleClicked = (event: RowDoubleClickedEvent) => {
  console.log('双击行:', event.data)
  ElMessage.info(`双击了任务: ${event.data.title}`)
  // 这里可以打开详情对话框或跳转到详情页
}

// 单元格值变化事件
const onCellValueChanged = (event: CellValueChangedEvent) => {
  console.log('单元格值已更改:', {
    row: event.rowIndex,
    field: event.colDef.field,
    oldValue: event.oldValue,
    newValue: event.newValue
  })
  ElMessage.success('数据已更新')
  // 这里可以调用API保存数据
}

// 排序变化事件
const onSortChanged = (event: SortChangedEvent) => {
  const sortModel = event.api.getColumnState().filter(col => col.sort)
  console.log('排序已更改:', sortModel)
}

// 筛选变化事件
const onFilterChanged = (event: FilterChangedEvent) => {
  console.log('筛选已更改:', event.api.getFilterModel())
  const rowCount = event.api.getDisplayedRowCount()
  console.log('当前显示行数:', rowCount)
}


// 新增任务
const handleAdd = () => {
  ElMessage.info('打开新增任务对话框')
  // 这里可以打开新增对话框
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的任务')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条任务吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 从数据中删除选中的行
    const idsToDelete = selectedRows.value.map(row => row.id)
    rowData.value = rowData.value.filter(task => !idsToDelete.includes(task.id))
    
    // 清除选择
    agGridRef.value?.api.deselectAll()
    
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 编辑任务
const handleEdit = (id: number) => {
  const task = rowData.value.find(t => t.id === id)
  if (task) {
    ElMessage.info(`编辑任务: ${task.title}`)
    // 这里可以打开编辑对话框
  }
}

// 删除任务
const handleDelete = async (id: number) => {
  const task = rowData.value.find(t => t.id === id)
  if (!task) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 "${task.title}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    rowData.value = rowData.value.filter(t => t.id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 导出数据
const handleExport = () => {
  if (!agGridRef.value) return
  
  // 导出为 CSV
  agGridRef.value.api.exportDataAsCsv({
    fileName: `任务列表_${new Date().toLocaleDateString('zh-CN')}.csv`,
    onlySelected: selectedRows.value.length > 0
  })
  
  ElMessage.success('导出成功')
}

// 刷新数据
const handleRefresh = () => {
  // 这里可以重新加载数据
  ElMessage.success('数据已刷新')
  agGridRef.value?.api.refreshCells()
}

onMounted(() => {
  console.log('任务列表页面已挂载')
  loadInitialData()
})
</script>

<style scoped>
.task-list-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f5f5f5;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-grid {
  flex: 1;
  width: 100%;
  height: calc(100vh - 200px);
  min-height: 500px;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #e2e2e2;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 操作按钮样式 */
:deep(.action-btn) {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

:deep(.edit-btn) {
  background: #409eff;
  color: white;
}

:deep(.edit-btn:hover) {
  background: #66b1ff;
}

:deep(.delete-btn) {
  background: #f56c6c;
  color: white;
}

:deep(.delete-btn:hover) {
  background: #f78989;
}

/* AG Grid 主题样式覆盖 */
:deep(.ag-theme-alpine) {
  --ag-header-background-color: #fafafa;
  --ag-header-foreground-color: #333;
  --ag-border-color: #e2e2e2;
  --ag-row-hover-color: #f8f9fa;
  --ag-selected-row-background-color: #f0f7ff; /* 更浅的选中背景色 */
  border-radius: 5px;
  overflow: hidden;
}

/* 选中行样式优化 - 更浅的颜色 */
:deep(.ag-row-selected::before) {
  background-color: #f0f7ff !important; /* 浅蓝色背景 */
}

:deep(.ag-row-hover.ag-row-selected::before) {
    background-color: #f0f7ff;
    background-image: linear-gradient(#f0f7ff, #f0f7ff);
}

:deep(.ag-row-selected:hover) {
  background-color: #e8f3ff !important; /* 悬停时稍深一点 */
}

/* 表格容器圆角 */
:deep(.ag-root-wrapper) {
  border-radius: 5px;
  overflow: hidden;
}

/* 表头样式 */
:deep(.ag-header) {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom: 1px solid #e2e2e2;
}

:deep(.ag-header-cell) {
  font-weight: 600;
  border-right: 1px solid #e2e2e2;
}

:deep(.ag-header-cell:last-child) {
  border-right: none;
}

/* 单元格样式 */
:deep(.ag-cell) {
  display: flex;
  align-items: center;
  border-right: 1px solid #e2e2e2;
}

:deep(.ag-cell:last-child) {
  border-right: none;
}

/* 行样式 */
:deep(.ag-row) {
  border-bottom: 1px solid #e2e2e2;
}

:deep(.ag-row:last-child) {
  border-bottom: none;
}

/* 表格底部圆角 */
:deep(.ag-body-viewport) {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

/* 确保自动分组列可见 */
:deep(.ag-header-cell[col-id="ag-Grid-AutoColumn"]) {
  display: table-cell !important;
  visibility: visible !important;
  width: 300px !important;
  min-width: 300px !important;
  max-width: 500px !important;
  position: relative !important;
  z-index: 10 !important;
}

:deep(.ag-cell[col-id="ag-Grid-AutoColumn"]) {
  display: table-cell !important;
  visibility: visible !important;
  width: 300px !important;
  min-width: 300px !important;
  max-width: 500px !important;
  position: relative !important;
}

/* 确保固定列容器可见 */
:deep(.ag-pinned-left-cols-container) {
  display: block !important;
  visibility: visible !important;
}

:deep(.ag-pinned-left-header) {
  display: block !important;
  visibility: visible !important;
}

/* 分页器样式 */
:deep(.ag-paging-panel) {
  border-top: 1px solid #e2e2e2;
  padding: 12px;
}

/* 滚动条样式优化 */
:deep(.ag-body-horizontal-scroll) {
  border-top: 1px solid #e2e2e2;
}

:deep(.ag-body-vertical-scroll) {
  border-left: 1px solid #e2e2e2;
}

</style>

// src/utils/virtualScroll.ts - 虚拟滚动工具类

/**
 * 模拟数据项类型（用于示例）
 */
export interface MockDataItem {
  id: number
  name: string
  title: string
  desc: string
  avatar: number
}

/**
 * 虚拟滚动配置选项
 */
export interface VirtualScrollOptions<T = any> {
  /** 滚动容器元素 */
  container: HTMLElement
  /** 全部数据数组 */
  data: T[]
  /** 每个列表项的高度（固定高度） */
  itemHeight: number
  /** 渲染函数，接收数据项和索引，返回 HTML 字符串 */
  renderItem: (item: T, index: number) => string
  /** 缓冲区数量（上下各多渲染几项，避免滚动时出现白屏），默认 3 */
  bufferCount?: number
  /** 占位容器元素（用于撑开滚动条高度），如果不提供则通过 getElementById('placeholder') 获取 */
  placeholder?: HTMLElement | null
  /** 可视区域容器元素（实际渲染内容的容器），如果不提供则通过 getElementById('visibleArea') 获取 */
  visibleArea?: HTMLElement | null
  /** 统计信息元素 ID 配置（可选，如果不提供则使用默认 ID） */
  statsElementIds?: {
    /** 总数据量元素 ID，默认 'totalCount' */
    totalCount?: string
    /** 当前渲染数量元素 ID，默认 'renderedCount' */
    renderedCount?: string
    /** 滚动位置元素 ID，默认 'scrollPosition' */
    scrollPosition?: string
    /** 回到顶部按钮元素 ID，默认 'scrollToTop' */
    scrollToTop?: string
  }
  /** 回到顶部按钮显示阈值（滚动超过此值才显示按钮），默认 200 */
  scrollToTopThreshold?: number
}

/**
 * 虚拟滚动类
 * 
 * 功能说明：
 * 1. 只渲染可见区域的数据，大幅提升大数据量列表的性能
 * 2. 支持固定高度的列表项
 * 3. 自动计算可见区域和缓冲区
 * 4. 支持动态更新数据（如搜索过滤）
 * 5. 自动更新统计信息（总数据量、当前渲染数量、滚动位置）
 * 6. 支持回到顶部按钮的显示/隐藏控制
 * 
 * 使用示例：
 * ```typescript
 * const virtualScroll = new VirtualScroll({
 *   container: document.getElementById('scrollContainer')!,
 *   data: myDataArray,
 *   itemHeight: 80,
 *   renderItem: (item, index) => `<div>${item.name}</div>`
 * })
 * 
 * // 更新数据
 * virtualScroll.updateData(newDataArray)
 * 
 * // 销毁实例
 * virtualScroll.destroy()
 * ```
 */
export class VirtualScroll<T = any> {
  /** 滚动容器元素（只读） */
  public readonly container: HTMLElement
  /** 全部数据数组 */
  public data: T[]
  /** 每个列表项的高度（只读） */
  public readonly itemHeight: number
  /** 渲染函数（只读） */
  public readonly renderItem: (item: T, index: number) => string
  /** 可见区域能显示多少项（只读） */
  public readonly visibleCount: number
  /** 缓冲区数量（只读） */
  public readonly bufferCount: number
  /** 当前渲染的起始索引 */
  public startIndex: number
  /** 当前渲染的结束索引 */
  public endIndex: number
  /** DOM 元素 - 占位容器 */
  public readonly placeholder: HTMLElement
  /** DOM 元素 - 可视区域容器 */
  public readonly visibleArea: HTMLElement

  /** 统计信息元素 ID 配置 */
  private readonly statsElementIds: Required<NonNullable<VirtualScrollOptions<T>['statsElementIds']>>
  /** 回到顶部按钮显示阈值 */
  private readonly scrollToTopThreshold: number
  /** 滚动事件处理函数（用于解绑事件） */
  private readonly scrollHandler: () => void
  /** 是否已销毁 */
  private destroyed: boolean = false

  /**
   * 构造函数
   * @param options 配置选项
   * @throws {Error} 如果必需的元素不存在或配置无效
   */
  constructor(options: VirtualScrollOptions<T>) {
    // 验证必需参数
    if (!options.container) {
      throw new Error('VirtualScroll: container 是必需的')
    }
    if (!Array.isArray(options.data)) {
      throw new Error('VirtualScroll: data 必须是数组')
    }
    if (typeof options.itemHeight !== 'number' || options.itemHeight <= 0) {
      throw new Error('VirtualScroll: itemHeight 必须是大于 0 的数字')
    }
    if (typeof options.renderItem !== 'function') {
      throw new Error('VirtualScroll: renderItem 必须是函数')
    }

    // 保存配置参数
    this.container = options.container
    this.data = [...options.data] // 创建数据副本，避免外部修改影响
    this.itemHeight = options.itemHeight
    this.renderItem = options.renderItem
    this.bufferCount = options.bufferCount ?? 3
    this.scrollToTopThreshold = options.scrollToTopThreshold ?? 200

    // 统计信息元素 ID 配置
    this.statsElementIds = {
      totalCount: options.statsElementIds?.totalCount ?? 'totalCount',
      renderedCount: options.statsElementIds?.renderedCount ?? 'renderedCount',
      scrollPosition: options.statsElementIds?.scrollPosition ?? 'scrollPosition',
      scrollToTop: options.statsElementIds?.scrollToTop ?? 'scrollToTop'
    }

    // 计算可见区域能显示多少项
    this.visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight)

    // 初始化索引
    this.startIndex = 0
    this.endIndex = this.visibleCount

    // 获取或创建 DOM 元素
    this.placeholder = this.getOrCreateElement(
      options.placeholder,
      'placeholder',
      'VirtualScroll: placeholder 元素不存在'
    )
    this.visibleArea = this.getOrCreateElement(
      options.visibleArea,
      'visibleArea',
      'VirtualScroll: visibleArea 元素不存在'
    )

    // 绑定滚动事件处理函数（使用箭头函数保持 this 指向）
    this.scrollHandler = () => {
      if (!this.destroyed) {
        this.handleScroll()
      }
    }

    // 初始化
    this.init()
  }

  /**
   * 获取或创建 DOM 元素
   * @param element 提供的元素
   * @param defaultId 默认元素 ID
   * @param errorMessage 错误消息
   * @returns DOM 元素
   */
  private getOrCreateElement(
    element: HTMLElement | null | undefined,
    defaultId: string,
    errorMessage: string
  ): HTMLElement {
    if (element) {
      return element
    }
    const foundElement = document.getElementById(defaultId)
    if (!foundElement) {
      throw new Error(errorMessage)
    }
    return foundElement
  }

  /**
   * 初始化方法
   */
  private init(): void {
    // 设置占位容器的高度 = 总数据量 * 每项高度
    this.updatePlaceholderHeight()

    // 计算初始渲染范围（包含缓冲区）
    this.calculateRenderRange(0)

    // 首次渲染
    this.render()

    // 初始化统计信息
    this.updateStats()

    // 监听滚动事件（使用 passive 选项提升性能）
    this.container.addEventListener('scroll', this.scrollHandler, { passive: true })
  }

  /**
   * 计算渲染范围（根据滚动位置）
   * @param scrollTop 当前滚动位置
   */
  private calculateRenderRange(scrollTop: number): void {
    // 计算应该显示哪些数据
    this.startIndex = Math.floor(scrollTop / this.itemHeight)
    this.endIndex = this.startIndex + this.visibleCount

    // 添加缓冲区（上下各多渲染几项，避免滚动时出现白屏）
    this.startIndex = Math.max(0, this.startIndex - this.bufferCount)
    this.endIndex = Math.min(this.data.length, this.endIndex + this.bufferCount)
  }

  /**
   * 更新占位容器高度
   */
  private updatePlaceholderHeight(): void {
    const totalHeight = this.data.length * this.itemHeight
    this.placeholder.style.height = `${totalHeight}px`
  }

  /**
   * 处理滚动事件
   */
  private handleScroll(): void {
    // 获取当前滚动位置
    const scrollTop = this.container.scrollTop

    // 计算应该显示哪些数据
    this.calculateRenderRange(scrollTop)

    // 重新渲染
    this.render()

    // 更新统计信息
    this.updateStats()
  }

  /**
   * 渲染可见区域的数据
   */
  private render(): void {
    // 计算偏移量（让可视区域定位到正确的位置）
    const offsetY = this.startIndex * this.itemHeight
    this.visibleArea.style.transform = `translateY(${offsetY}px)`

    // 获取需要渲染的数据切片
    const visibleData = this.data.slice(this.startIndex, this.endIndex)

    // 渲染 HTML
    this.visibleArea.innerHTML = visibleData
      .map((item, index) => {
        return this.renderItem(item, this.startIndex + index)
      })
      .join('')

    // 更新渲染数量统计
    this.updateElementText(this.statsElementIds.renderedCount, visibleData.length.toString())
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const scrollTop = this.container.scrollTop

    // 更新滚动位置
    this.updateElementText(this.statsElementIds.scrollPosition, Math.round(scrollTop).toString())

    // 更新回到顶部按钮显示状态
    const scrollToTopBtn = document.getElementById(this.statsElementIds.scrollToTop)
    if (scrollToTopBtn) {
      if (scrollTop > this.scrollToTopThreshold) {
        scrollToTopBtn.classList.add('show')
      } else {
        scrollToTopBtn.classList.remove('show')
      }
    }
  }

  /**
   * 更新元素文本内容（安全方法）
   * @param elementId 元素 ID
   * @param text 文本内容
   */
  private updateElementText(elementId: string, text: string): void {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = text
    }
  }

  /**
   * 更新数据（用于搜索等场景）
   * @param newData 新的数据数组
   */
  public updateData(newData: T[]): void {
    if (!Array.isArray(newData)) {
      throw new Error('VirtualScroll.updateData: newData 必须是数组')
    }

    this.data = [...newData] // 创建数据副本
    this.updatePlaceholderHeight()
    this.container.scrollTop = 0

    // 重新计算渲染范围
    this.calculateRenderRange(0)

    // 重新渲染
    this.render()

    // 更新总数据量统计
    this.updateElementText(this.statsElementIds.totalCount, newData.length.toString())

    // 更新统计信息
    this.updateStats()
  }

  /**
   * 滚动到指定位置
   * @param scrollTop 滚动位置
   * @param smooth 是否平滑滚动，默认 false
   */
  public scrollTo(scrollTop: number, smooth: boolean = false): void {
    this.container.scrollTo({
      top: scrollTop,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  /**
   * 滚动到指定索引的项
   * @param index 数据索引
   * @param smooth 是否平滑滚动，默认 false
   */
  public scrollToIndex(index: number, smooth: boolean = false): void {
    if (index < 0 || index >= this.data.length) {
      console.warn(`VirtualScroll.scrollToIndex: 索引 ${index} 超出范围 [0, ${this.data.length})`)
      return
    }
    const scrollTop = index * this.itemHeight
    this.scrollTo(scrollTop, smooth)
  }

  /**
   * 获取当前滚动位置
   * @returns 滚动位置
   */
  public getScrollTop(): number {
    return this.container.scrollTop
  }

  /**
   * 获取数据总数
   * @returns 数据总数
   */
  public getDataLength(): number {
    return this.data.length
  }

  /**
   * 销毁实例（清理事件监听等）
   */
  public destroy(): void {
    if (this.destroyed) {
      return
    }

    // 移除滚动事件监听
    this.container.removeEventListener('scroll', this.scrollHandler)

    // 标记为已销毁
    this.destroyed = true

    // 清空数据引用
    this.data = []
  }
}

/**
 * 生成模拟数据（用于测试和示例）
 * @param count 数据数量
 * @returns 模拟数据数组
 */
export function generateData(count: number): MockDataItem[] {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const titles = ['前端工程师', '后端工程师', '产品经理', '设计师', '测试工程师', '运维工程师']
  const data: MockDataItem[] = []

  for (let i = 0; i < count; i++) {
    const nameIndex = i % names.length
    const titleIndex = i % titles.length
    data.push({
      id: i + 1,
      name: `${names[nameIndex]}${i + 1}`,
      title: titles[titleIndex]!,
      desc: `这是第 ${i + 1} 条数据的描述信息`,
      avatar: (i % 26) + 65 // ASCII 码生成 A-Z
    })
  }

  return data
}

/**
 * 渲染列表项（默认渲染函数，用于示例）
 * @param item 数据项
 * @param index 索引
 * @returns HTML 字符串
 */
export function renderListItem(item: MockDataItem, index: number): string {
  return `
    <div class="list-item">
      <div class="item-avatar">${String.fromCharCode(item.avatar)}</div>
      <div class="item-content">
        <div class="item-title">${item.name}</div>
        <div class="item-desc">${item.title} - ${item.desc}</div>
      </div>
      <div class="item-index">#${item.id}</div>
    </div>
  `
}

/**
 * 回到顶部函数（用于示例）
 * @param container 滚动容器元素
 */
export function scrollToTop(container: HTMLElement): void {
  container.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

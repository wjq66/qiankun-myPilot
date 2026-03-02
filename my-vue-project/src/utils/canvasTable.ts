

export interface CanvasTableData {
    id?: number | string
    name: string
    age: number
    school: string
    source: number
    options?: string
    [key: string]: any // 允许动态属性，包括 position 坐标
}

export interface CanvasTableColumn {
    label: string
    key: string
    render?: (row: CanvasTableData) => any
}

export interface CanvasTableOptions {
    el: HTMLCanvasElement; // 修复：应该是 HTMLCanvasElement 而不是 HTMLElement
    slideWrap: HTMLElement;
    slide: HTMLElement;
    table: {
        rowHeight: number;
        headerHight: number;
        columns: CanvasTableColumn[];
        tableData: CanvasTableData[];
    };
    touchCanvans?: boolean; // 是否点击事件作用在 canvas 上
}

export const mockData: CanvasTableData[] = [
    {
        name: "张三",
        id: 0,
        age: 0,
        school: "公众号：Web技术学苑",
        source: 800,
    },
];

export const columns: CanvasTableColumn[] = [
    { label: "姓名", key: "name", },
    { label: "年龄", key: "age", },
    { label: "学校", key: "school" },
    { label: "分数", key: "source" },
    { label: "操作", key: "options" }
]

export const tableData = new Array(3000).fill(mockData[0]).map((v, index) => {
    return {
      ...v,
      id: index,
      name: `${v.name}-${index + 1}`,
      age: v.age + index + 1,
      source: v.source + index + 1,
    };
  });

 export const table = {
    rowHeight: 30,
    headerHight: 30,
    columns,
    tableData,
  };

  export class CanvasTable {
    private options: CanvasTableOptions;
    private el: HTMLCanvasElement; // 修复：类型改为 HTMLCanvasElement
    private ctx: CanvasRenderingContext2D; // 修复：不能为 null，必须存在
    private rowHeight: number;
    private headerHight: number;
    private slideWrap: HTMLElement;
    private slide: HTMLElement;
    private columns: CanvasTableColumn[];
    private tableData: CanvasTableData[];
    private startIndex: number;
    private endIndex: number;
    private sourceData: CanvasTableData[]; // 原始数据源
    private callback?: (tableData: CanvasTableData[]) => void; // 数据更新回调
    
    constructor(options: CanvasTableOptions, callback?: (tableData: CanvasTableData[]) => void) {
        this.options = options;
        
        const { el, slideWrap, slide, table } = options;
        
        // 验证必需参数
        if (!el) {
            throw new Error('CanvasTable: el (canvas element) 是必需的')
        }
        if (!slideWrap) {
            throw new Error('CanvasTable: slideWrap 是必需的')
        }
        if (!slide) {
            throw new Error('CanvasTable: slide 是必需的')
        }
        
        this.el = el; // canvas DOM 元素
        const ctx = el.getContext("2d"); // canvas 画布环境
        if (!ctx) {
            throw new Error('CanvasTable: 无法获取 2d 上下文')
        }
        this.ctx = ctx;
        
        this.rowHeight = table.rowHeight; // 表行的高度
        this.headerHight = table.headerHight; // 表头高度
        this.slideWrap = slideWrap; // 自定义滑块容器
        this.slide = slide; // 自定义滑块 
        this.columns = table.columns; // 表列
        this.sourceData = [...table.tableData]; // 原始数据源（创建副本）
        this.tableData = []; // canvas 渲染的数据（可见区域）
        this.startIndex = 0; // 数据起始索引
        this.endIndex = 0; // 数据末尾索引
        this.callback = callback; // 数据更新回调
        
        this.init();
    }
    private init() {
        // 初始化 Canvas 尺寸
        this.initCanvasSize();
        // 更新滚动条高度
        this.updateScrollBarHeight();
        // 初始化数据
        this.setDataByPage();
        // 纵向滚动条Y
        this.setScrollY();
    }
    
    /**
     * 初始化 Canvas 尺寸
     * 确保 Canvas 的 width 和 height 属性被正确设置
     */
    private initCanvasSize(): void {
        const { el } = this;
        const computedStyle = getComputedStyle(el);
        el.width = el.clientWidth;
        el.height = el.clientHeight;
        
        
    }
    
    /**
     * 更新滚动条滑块高度
     * 根据数据总量和可见区域计算滚动条滑块应该的高度
     */
    private updateScrollBarHeight(): void {
        const { slideWrap, slide, el, rowHeight, headerHight, sourceData } = this;
        
        // 确保 Canvas 尺寸已初始化
        if (!el.width || !el.height) {
            this.initCanvasSize();
        }
        
        const limit = Math.floor((el.height - headerHight) / rowHeight); // 可见区域最多显示的行数
        const totalRows = sourceData.length; // 总数据行数
        
        // 如果数据总量小于等于可见行数，不需要滚动条
        if (totalRows <= limit) {
            slide.style.display = 'none';
            return;
        }
        
        slide.style.display = 'block';
        
        // 计算滚动条容器高度（通常是 Canvas 的高度）
        const scrollBarHeight = slideWrap.clientHeight || el.height;
        
        // 计算滚动条滑块高度：可见区域 / 总数据量 * 滚动条容器高度
        const slideHeight = Math.max(20, (limit / totalRows) * scrollBarHeight); // 最小高度 20px
        
        slide.style.height = `${slideHeight}px`;
        
        console.log('滚动条高度更新:', {
            totalRows,
            limit,
            scrollBarHeight,
            slideHeight
        });
    }

    private setDataByPage() {
        const { el, rowHeight, headerHight, sourceData } = this;
        
        // 确保 Canvas 尺寸已初始化
        if (!el.width || !el.clientHeight) {
            this.initCanvasSize();
        }
        // 计算可见区域最多能显示多少行（使用 el.height 属性，不是 clientHeight）
        const limit = Math.floor((el.clientHeight - headerHight) / rowHeight);
        
        const endIndex = Math.min(this.startIndex + limit, sourceData.length)
        this.endIndex = endIndex;
        this.tableData = sourceData.slice(this.startIndex, this.endIndex);
        
        if (this.tableData.length === 0) {
            console.log('数据为空')
            return;
        }
        
        // 调用回调函数，通知外部数据已更新
        if (this.callback) {
            this.callback(this.tableData)
        }
        // 清除画布
        this.clearCanvans();
        // 绘制表头
        this.drawHeader();
        // 绘制body
        this.drawBody();
    }

    private clearCanvans() {
        // 清除画布内容（不改变宽高，只清除内容）
        const { ctx, el } = this;
        ctx.clearRect(0, 0, el.width, el.height);
    }

    private drawHeader() {
        const { ctx, el, headerHight, columns } = this;
        // 第一条横线（表头顶部）
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(el.width, 0);
        ctx.lineTo(el.clientWidth, 0);
        ctx.stroke();
        ctx.closePath();
        
        // 第二条横线（表头底部）
        ctx.beginPath();
        ctx.moveTo(0, headerHight);
        ctx.lineTo(el.width, headerHight);
        ctx.lineTo(el.clientWidth, headerHight);
        ctx.stroke();
        ctx.closePath();
        
        debugger
        const colWidth = Math.ceil(el.clientWidth / columns.length);
        ctx.fillStyle = '#333';
        
        // 绘制表头文字内容
        for (let index = 0; index < columns.length; index++) {
            const column = columns[index];
            if (column) {
                ctx.fillText(column.label, index * colWidth + 10, headerHight / 2 + 5);
            }
        }
    }

    private drawBody() {
        const { ctx, el, rowHeight, tableData, columns, headerHight } = this;
        const tableDataLen = tableData.length;
        const colWidth = Math.ceil(el.clientWidth / columns.length);
        // 绘制横线（行分隔线）
        // 第 i 行的上横线在 headerHight + i * rowHeight
        for (let i = 0; i <= tableDataLen; i++) {
            const y = headerHight + i * rowHeight;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(el.clientWidth, y);
            ctx.lineTo(el.clientWidth, y);
            ctx.stroke();
            ctx.closePath();
        }
        
        // 绘制竖线（列分隔线）
        for (let index = 0; index <= columns.length; index++) {
            const x = index * colWidth;
            const maxHeight = headerHight + (tableDataLen + 1) * rowHeight;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, maxHeight);
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.closePath();
        }
        
        // 填充内容
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        const columnsKeys = columns.map((v) => v.key);
        
        for (let i = 0; i < tableData.length; i++) {
            const row = tableData[i];
            if (!row) continue;
            
            columnsKeys.forEach((keyName, j) => {
                const x = 10 + colWidth * j;
                // 计算行的顶部位置：headerHight + i * rowHeight
                // i 是 tableData 中的索引（0, 1, 2, ...），对应可见区域的行
                const rowTop = headerHight + i * rowHeight;
                const rowCenter = rowTop + rowHeight / 2;
                const y = rowCenter + 4; // 文字基线位置
                
                // 记录位置坐标（用于自定义 DOM 定位）
                // 每次渲染都更新位置，确保位置信息正确
                const positionKey = `${keyName}_position`;
                row[positionKey] = [x, rowTop];
                
                const value = row[keyName];
                if (value !== undefined && value !== null) {
                    ctx.fillText(String(value), x, y);
                }
            });
        }
     }

     private setScrollY() {
        const { slideWrap, slide, rowHeight, el, headerHight, options } = this;
        const touchCanvans = options.touchCanvans ?? false;
        
        // if (!touchCanvans) {
        //     slideWrap.style.opacity = '1';
        // }
        
        let startY = 0; // 鼠标按下时的 Y 坐标
        let currentScrollY = 0; // 当前滚动位置（像素）
        
        /**
         * 获取滚动条滑块当前的 transform Y 值
         */
        const getSlideTransformY = (): number => {
            const transform = slide.style.transform;
            if (transform && transform !== 'none') {
                const match = transform.match(/translateY\((\d+)px\)/);
                return match ? Number(match[1]) : 0;
            }
            return 0;
        }
        
        /**
         * 根据滚动条位置计算滚动位置（像素）
         */
        const getScrollYFromSlidePosition = (): number => {
            const limit = Math.floor((el.height - headerHight) / rowHeight);
            const maxScrollY = Math.max(0, (this.sourceData.length - limit) * rowHeight);
            const scrollBarHeight = slideWrap.clientHeight || el.height;
            const slideHeight = slide.clientHeight;
            const scrollBarMaxY = Math.max(0, scrollBarHeight - slideHeight);
            const slideY = getSlideTransformY();
            
            if (scrollBarMaxY === 0 || maxScrollY === 0) return 0;
            return (slideY / scrollBarMaxY) * maxScrollY;
        }
        
        /**
         * 更新滚动位置并重新渲染
         */
        const updateScroll = (scrollY: number): void => {
            const limit = Math.floor((el.height - headerHight) / rowHeight);
            const maxScrollY = Math.max(0, (this.sourceData.length - limit) * rowHeight);
            
            // 限制滚动范围
            scrollY = Math.max(0, Math.min(scrollY, maxScrollY));
            currentScrollY = scrollY;
            
            // 更新滚动条滑块位置
            const scrollBarHeight = slideWrap.clientHeight || el.height;
            const slideHeight = slide.clientHeight;
            const scrollBarMaxY = Math.max(0, scrollBarHeight - slideHeight);
            const scrollBarY = maxScrollY > 0 ? (scrollY / maxScrollY) * scrollBarMaxY : 0;
            slide.style.transform = `translateY(${Math.min(scrollBarY, scrollBarMaxY)}px)`;
            
            // 根据滚动位置计算数据起始索引
            this.startIndex = Math.floor(scrollY / rowHeight);
            this.startIndex = Math.max(0, Math.min(this.startIndex, this.sourceData.length - limit));
            
            // 更新数据
            this.setDataByPage();
        }
        
        // 初始化滚动条高度
        this.updateScrollBarHeight();
        
        // 初始化当前滚动位置
        currentScrollY = getScrollYFromSlidePosition();
        
        /**
         * 鼠标移动事件处理
         */
        const move = (event: MouseEvent): void => {
            const deltaY = event.clientY - startY;
            const newScrollY = currentScrollY + deltaY;
            updateScroll(newScrollY);
            startY = event.clientY; // 更新起始位置
        }
        
        /**
         * 鼠标释放事件处理
         */
        let moveHandler: ((e: MouseEvent) => void) | null = null
        const stop = (): void => {
            if (moveHandler) {
                document.removeEventListener('mousemove', moveHandler);
                moveHandler = null;
            }
            document.removeEventListener('mouseup', stop);
            // if (touchCanvans) {
            //     slideWrap.style.opacity = '0';
            // }
        }
        
        // 监听鼠标按下事件（在滚动条滑块上）
        slide.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            // if (touchCanvans) {
            //     slideWrap.style.opacity = '1';
            // }
            
            startY = e.clientY;
            currentScrollY = getScrollYFromSlidePosition();
            
            // 绑定鼠标移动和释放事件到 document，确保即使鼠标移出元素也能继续拖动
            moveHandler = move;
            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', stop);
        });
        
        // 如果启用 canvas 触摸，监听 canvas 上的鼠标事件
        if (touchCanvans) {
            el.addEventListener('mousedown', (e: MouseEvent) => {
                // 如果点击的不是滚动条区域，才处理滚动
                const rect = el.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                if (clickX < el.width - 20) { // 20px 是滚动条区域宽度
                    slideWrap.style.opacity = '1';
                    startY = e.clientY;
                    currentScrollY = getScrollYFromSlidePosition();
                    
                    moveHandler = move;
                    document.addEventListener('mousemove', moveHandler);
                    document.addEventListener('mouseup', stop);
                }
            });
            
            // 监听鼠标滚轮事件
            el.addEventListener('wheel', (e: WheelEvent) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? rowHeight * 2 : -rowHeight * 2; // 每次滚动 2 行
                const newScrollY = currentScrollY + delta;
                updateScroll(newScrollY);
            }, { passive: false });
        }
    }

    private throttle(callback: (...args: any[]) => void, wait: number): (...args: any[]) => void {
        let timer: ReturnType<typeof setTimeout> | null = null;
        return function (this: any, ...args: any[]) {
            if (timer) return;
            timer = setTimeout(() => {
                callback.apply(this, args);
                timer = null;
            }, wait);
        };
    }
  }

  /**
   * 设置自定义 DOM 的位置样式
   * @param row 行数据
   * @param keyName 字段名
   * @returns 样式对象
   */
  /**
   * 设置自定义 DOM 的位置样式
   * @param row 行数据
   * @param keyName 字段名
   * @returns 样式对象
   */
  export const setColumnsStyle = (row: CanvasTableData, keyName: string) => {
    const positionKey = `${keyName}_position`;
    const position = row[positionKey];
    if (!position || !Array.isArray(position) || position.length !== 2) {
      return { display: 'none' };
    }
    const [x, rowTop] = position as [number, number];
    
    // rowTop 是行的顶部位置（上横线的位置）
    // 行的中心位置 = rowTop + rowHeight / 2
    // DOM 元素需要基于行的中心垂直对齐
    const rowHeight = 30; // 与 table.rowHeight 保持一致
    
    // 根据元素类型设置不同的高度和样式
    if (keyName === 'age') {
      // 输入框：高度约 28px（包括边框和内边距）
      const elementHeight = 22;
      const topPosition = rowTop + (rowHeight - elementHeight) / 2; // 垂直居中
      
      return {
        position: "absolute",
        left: `${x}px`,
        top: `${topPosition}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: `${elementHeight}px`,
        lineHeight: `${elementHeight}px`
      };
    } else if (keyName === 'options') {
      // 操作链接：高度约 22px
      const elementHeight = 22;
      const topPosition = rowTop + (rowHeight - elementHeight) / 2; // 垂直居中
      
      return {
        position: "absolute",
        left: `${x}px`,
        top: `${topPosition}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: `${elementHeight}px`,
        lineHeight: `${elementHeight}px`,
        gap: '5px'
      };
    }
    
    // 默认样式
    return { display: 'none' };
  };

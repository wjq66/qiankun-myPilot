<template>
  <div class="moreDataView">
   <div class="virtual-scroll-container">
    <div class="container">
        <h1>🚀 虚拟滚动示例</h1>
        <div class="info">只渲染可见区域，支持流畅滚动1000+条数据</div>

        <!-- 统计信息 -->
        <div class="stats">
            <div class="stat-item">
                <div class="stat-label">总数据量</div>
                <div class="stat-value" id="totalCount">1000</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">当前渲染</div>
                <div class="stat-value" id="renderedCount">0</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">滚动位置</div>
                <div class="stat-value" id="scrollPosition">0</div>
            </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="🔍 搜索用户名或描述...">
        </div>

        <!-- 虚拟滚动容器 -->
        <div class="virtual-scroll-container" id="scrollContainer">
            <!-- 占位容器：用于撑开滚动条的高度 -->
            <div class="scroll-placeholder" id="placeholder"></div>
            <!-- 可视区域容器：只渲染可见的元素 -->
            <div class="visible-area" id="visibleArea"></div>
        </div>
    </div>

    <!-- 回到顶部按钮 -->
    <button class="scroll-to-top" id="scrollToTop" onclick="scrollToTop()">↑</button>

   </div>

   <div class="canvas-container">
        <h1>🚀 canvas示例</h1>
        <div class="canvas-content">
            <canvas ref="canvansDom" id="canvas"></canvas>
            <div class="render-table">
            <!---操作--->
            <template v-if="canvasTableData.length > 0">
                <div
                class="columns-options"
                v-for="(item, index) in canvasTableData"
                :key="index"
                :style="setColumnsStyle(item, 'options')"
                >
                <a href="javascript:void(0)">编辑</a>
                <a href="javascript:void(0)">删除</a>
                </div>
            </template>
            <!---columns--->
            <template v-if="canvasTableData.length > 0">
                <div
                class="columns-row"
                v-for="(item, index) in canvasTableData"
                :style="setColumnsStyle(item, 'age')"
                :key="index"
                >
                <input type="text" v-model="item.age" style="width: 100px" />
                </div>
            </template>
            </div>
            <div ref="slideWrap" style="transform: translateY(0)">
                <div class="slide"></div>
            </div>
        </div>
       
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onDeactivated, h, onActivated, nextTick, watch } from 'vue';
import { VirtualScroll, MockDataItem, generateData, renderListItem } from '../utils/virtualScroll';
import { tableData as mockTableData, table, CanvasTable, setColumnsStyle, type CanvasTableData } from '../utils/canvasTable';

const virtualScroll = ref<VirtualScroll<MockDataItem> | null>(null)

const slideWrap = ref<HTMLElement | null>(null)
const canvansDom = ref<HTMLCanvasElement | null>(null)
const canvasTableData = ref<CanvasTableData[]>([]) // 重命名避免冲突

onMounted(() => {
  const container = document.getElementById('scrollContainer')! as HTMLElement
  virtualScroll.value = new VirtualScroll({
    container,
    data: generateData(1000),
    itemHeight: 50,
    renderItem: (item, index) => renderListItem(item, index)
  })

  // 初始化 Canvas 表格
  nextTick(() => {
    if (canvansDom.value && slideWrap.value) {
      const slide = slideWrap.value.querySelector('.slide') as HTMLElement
      if (!slide) {
        console.error('Canvas 表格初始化失败：找不到 slide 元素')
        return
      }

      const getCanvansData = (data: CanvasTableData[]) => {
        canvasTableData.value = data
      }

      const canvans = new CanvasTable(
        {
          el: canvansDom.value, // 使用 .value 获取 ref 的实际值
          slideWrap: slideWrap.value,
          slide: slide,
          table,
          touchCanvans: true,
        },
        getCanvansData
      )
    } else {
      console.error('Canvas 表格初始化失败：缺少必需的元素')
    }
  })
})

onUnmounted(() => {
  virtualScroll.value?.destroy()
})
</script>



 
<style scoped lang="scss">
.moreDataView {
  width: 100%;
  min-height: 100%;
  background-color: #f0f2f5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-y: auto; // 允许页面滚动
}
h1 {
            color: #667eea;
            margin-bottom: 10px;
            text-align: center;
        }
.virtual-scroll-container {
    padding: 20px; // 添加内边距，确保内容不贴边
    margin-bottom: 20px; // 添加底部间距，与 canvas 区域分开
    
    .container {
            width: 100%;
            max-width: 800px;
            margin:auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        

        .info {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 10px;
        }

        .stat-item {
            text-align: center;
        }

        .stat-label {
            font-size: 12px;
            color: #999;
            margin-bottom: 5px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }

        /* 虚拟滚动容器 */
        .virtual-scroll-container {
            height: 500px;
            overflow-y: auto;
            border: 2px solid #ddd;
            border-radius: 10px;
            position: relative;
            background: #fafafa;
        }

        /* 占位容器：用于撑开滚动条 */
        .scroll-placeholder {
            position: relative;
        }

        /* 可视区域容器 */
        .visible-area {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
        }

        /* 列表项样式 - 使用 :deep() 让样式穿透到动态插入的元素 */
        :deep(.list-item) {
            height: 80px;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            background: white;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: background 0.2s;
        }

        :deep(.list-item:hover) {
            background: #f0f7ff;
        }

        :deep(.item-avatar) {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            flex-shrink: 0;
        }

        :deep(.item-content) {
            flex: 1;
        }

        :deep(.item-title) {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }

        :deep(.item-desc) {
            font-size: 12px;
            color: #999;
        }

        :deep(.item-index) {
            font-size: 14px;
            color: #667eea;
            font-weight: bold;
            padding: 5px 10px;
            background: #f0f7ff;
            border-radius: 5px;
        }

        /* 滚动到顶部按钮 */
        .scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s;
            display: none;
        }

        .scroll-to-top:hover {
            background: #5568d3;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
        }

        .scroll-to-top.show {
            display: block;
        }

        /* 搜索框 */
        .search-box {
            margin-bottom: 15px;
            position: relative;
        }

        .search-box input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.3s;
        }

        .search-box input:focus {
            border-color: #667eea;
        }

        .loading {
            text-align: center;
            padding: 20px;
            color: #999;
        }
}

.canvas-container {
    width: 100%;
    max-width: 800px;
    margin:20px auto;
    min-height: 80vh; // 使用 min-height 而不是固定 height，确保内容可以扩展
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    box-sizing: content-box;
    .canvas-content {
        position: relative;
        top: 0px;
    }
    #canvas {
        width:  800px;
        height: 400px;
        position: absolute;
    }

    #slide-wrap {
    width: 8px;
    height: 400px; /* 与 Canvas 高度一致 */
    background-color: rgba(0, 0, 0, 0.1);
    position: absolute;
    right: 10px;
    top: 30px; /* 与表头高度一致 */
    border-radius: 4px;
    transition: opacity 0.3s ease;
    opacity: 0;
    overflow: hidden;
}
#slide-wrap:hover {
  cursor: grab;
  opacity: 1 !important;
}
.slide {
  width: 8px;
  min-height: 20px; /* 最小高度 */
  background-color: rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px;
  cursor: grab;
  transition: background-color 0.2s ease;
}
.slide:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
.slide:active {
  cursor: grabbing;
}
.render-table {
  position: absolute;
  top: 0;
  left: 0;
  width: 800px;
  height: 400px;
  pointer-events: none; /* 允许点击穿透到 Canvas */
  z-index: 1;
}
.render-table > * {
  pointer-events: auto; /* 恢复子元素的点击事件 */
}
.render-table .columns-row input {
  border: 1px solid #ddd;
  padding: 2px 5px;
  font-size: 12px;
  box-sizing: border-box;
  height: 100%;
}
.render-table .columns-options {
  display: flex;
  align-items: center;
  gap: 5px;
}
.render-table .columns-options a {
  display: inline-block;
  color: #409eff;
  text-decoration: none;
  font-size: 12px;
  cursor: pointer;
}
.render-table .columns-options a:hover {
  text-decoration: underline;
}
     
}
</style>
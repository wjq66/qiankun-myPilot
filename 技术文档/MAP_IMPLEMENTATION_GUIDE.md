# 光伏巡检大屏 - 中间地图实现方案

## 📋 实现方案说明

### 技术选型

**使用 Canvas API 实现地图渲染**

- ✅ **性能好**：Canvas 渲染性能优于 DOM 操作
- ✅ **精确绘制**：可以精确控制标记点的位置和样式
- ✅ **无依赖**：不需要额外引入地图库
- ✅ **灵活性强**：完全自定义，支持缩放、平移等交互

### 实现原理

1. **后台提供航拍图片**（或图片URL）
2. **前端使用 Canvas 加载图片**作为底图
3. **根据后台返回的缺陷数据**在图片上绘制标记点
4. **支持筛选、缩放、交互**等功能

---

## 🔄 数据交互流程

### 方案1：后台提供图片URL（推荐）

```javascript
// 前端请求
GET /api/photovoltaic/map-image

// 后台返回
{
  "imageUrl": "https://example.com/images/station-aerial.jpg",
  "width": 1920,
  "height": 1080
}

// 前端加载
const img = new Image()
img.src = data.imageUrl
img.onload = () => {
  // 在Canvas上绘制图片
  ctx.drawImage(img, x, y, width, height)
}
```

### 方案2：后台返回Base64图片

```javascript
// 前端请求
GET /api/photovoltaic/map-image

// 后台返回
{
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "width": 1920,
  "height": 1080
}

// 前端加载
const img = new Image()
img.src = data.base64
img.onload = () => {
  // 在Canvas上绘制图片
  ctx.drawImage(img, x, y, width, height)
}
```

### 方案3：静态资源（开发阶段）

```javascript
// 直接将图片放在 public 目录
// 前端直接使用
const imageUrl = '/images/station-aerial.jpg'
```

---

## 📊 缺陷标记点数据结构

### 后台返回的数据格式

```json
{
  "markers": [
    {
      "id": 1,
      "x": 0.15,           // X坐标（0-1，相对图片位置）
      "y": 0.2,             // Y坐标（0-1，相对图片位置）
      "type": "热斑",        // 缺陷类型
      "area": "#01",        // 所在区域
      "level": "高",        // 严重等级：高/中/低
      "status": "未消缺",    // 消缺状态
      "discoverTime": "2025-02-10 11:50:00",  // 发现时间
      "severity": "高"      // 严重程度
    }
  ]
}
```

### 坐标说明

- **x, y**: 使用相对坐标（0-1），表示标记点在图片上的位置比例
  - `x: 0.15` 表示在图片宽度的 15% 位置
  - `y: 0.2` 表示在图片高度的 20% 位置
- **优势**：无论图片实际尺寸如何，都能正确定位

---

## 🎨 前端实现细节

### 1. 加载航拍图片

```javascript
async function loadMapImage() {
  // 从API获取图片URL
  const response = await fetch('/api/photovoltaic/map-image')
  const data = await response.json()
  
  const img = new Image()
  img.crossOrigin = 'anonymous'  // 允许跨域
  img.src = data.imageUrl
  
  img.onload = () => {
    mapImage.value = img
    drawMap()  // 绘制地图
  }
}
```

### 2. 绘制地图和标记点

```javascript
function drawMap() {
  const ctx = canvas.getContext('2d')
  
  // 1. 绘制航拍图片
  ctx.drawImage(mapImage.value, x, y, width, height)
  
  // 2. 绘制缺陷标记点
  markers.forEach(marker => {
    // 计算实际坐标
    const x = marker.x * canvas.width
    const y = marker.y * canvas.height
    
    // 绘制标记点
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = getDefectColor(marker.type)
    ctx.fill()
  })
}
```

### 3. 交互功能

- **鼠标悬停**：显示标记点详情提示框
- **点击标记点**：打开缺陷详情弹窗
- **滚轮缩放**：支持放大缩小
- **工具栏**：重置视图、放大、缩小按钮

---

## 🔌 API 接口设计

### 1. 获取航拍图片

```http
GET /api/photovoltaic/map-image
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "imageUrl": "https://example.com/images/station-aerial.jpg",
    "width": 1920,
    "height": 1080
  }
}
```

### 2. 获取缺陷标记点数据

```http
GET /api/photovoltaic/defect-markers
Query Parameters:
  - area: 片区（可选）
  - level: 等级（可选）
  - types: 缺陷类型，多个用逗号分隔（可选）
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "markers": [
      {
        "id": 1,
        "x": 0.15,
        "y": 0.2,
        "type": "热斑",
        "area": "#01",
        "level": "高",
        "status": "未消缺",
        "discoverTime": "2025-02-10 11:50:00",
        "severity": "高"
      }
    ],
    "total": 1466
  }
}
```

---

## 🎯 实现步骤

### 步骤1：后台准备航拍图片

1. 将航拍图片上传到服务器或CDN
2. 记录图片的URL
3. 在数据库中存储图片信息（可选）

### 步骤2：后台提供图片API

```javascript
// Node.js示例
app.get('/api/photovoltaic/map-image', (req, res) => {
  res.json({
    code: 200,
    data: {
      imageUrl: 'https://your-cdn.com/images/station-aerial.jpg',
      width: 1920,
      height: 1080
    }
  })
})
```

### 步骤3：后台提供标记点数据API

```javascript
// Node.js示例
app.get('/api/photovoltaic/defect-markers', (req, res) => {
  const { area, level, types } = req.query
  
  // 从数据库查询缺陷数据
  const markers = db.queryDefects({
    area,
    level,
    types: types ? types.split(',') : []
  })
  
  res.json({
    code: 200,
    data: {
      markers: markers.map(m => ({
        id: m.id,
        x: m.x / m.imageWidth,  // 转换为相对坐标
        y: m.y / m.imageHeight,
        type: m.type,
        area: m.area,
        level: m.level,
        status: m.status,
        discoverTime: m.discoverTime,
        severity: m.severity
      })),
      total: markers.length
    }
  })
})
```

### 步骤4：前端调用API

```javascript
// 在组件中
async function fetchMapData() {
  // 加载图片
  const imageRes = await fetch('/api/photovoltaic/map-image')
  const imageData = await imageRes.json()
  await loadMapImage(imageData.data.imageUrl)
  
  // 加载标记点
  const markersRes = await fetch('/api/photovoltaic/defect-markers')
  const markersData = await markersRes.json()
  defectMarkers.value = markersData.data.markers
  
  // 绘制地图
  drawMap()
}
```

---

## 📝 数据库设计建议

### 缺陷标记点表（defect_markers）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| image_x | INT | 在图片上的X坐标（像素） |
| image_y | INT | 在图片上的Y坐标（像素） |
| image_width | INT | 图片宽度（用于计算相对坐标） |
| image_height | INT | 图片高度（用于计算相对坐标） |
| defect_type | VARCHAR | 缺陷类型 |
| area | VARCHAR | 所在区域 |
| level | VARCHAR | 严重等级 |
| status | VARCHAR | 消缺状态 |
| discover_time | DATETIME | 发现时间 |
| severity | VARCHAR | 严重程度 |

### 计算相对坐标

```sql
-- 查询时计算相对坐标
SELECT 
  id,
  image_x / image_width AS x,  -- 相对X坐标（0-1）
  image_y / image_height AS y, -- 相对Y坐标（0-1）
  defect_type,
  area,
  level,
  status,
  discover_time,
  severity
FROM defect_markers
WHERE image_id = ?
```

---

## 🚀 其他可选方案

### 方案A：使用 Leaflet 地图库

**适用场景**：如果需要真实地理坐标、地图交互功能

```javascript
import L from 'leaflet'

// 使用航拍图片作为底图
const map = L.map('map').setView([lat, lng], 18)

// 添加图片图层
L.imageOverlay('station-aerial.jpg', bounds).addTo(map)

// 添加标记点
markers.forEach(marker => {
  L.marker([marker.lat, marker.lng])
    .addTo(map)
    .bindPopup(`缺陷类型: ${marker.type}`)
})
```

### 方案B：使用 ECharts 自定义底图

**适用场景**：如果需要在图表中展示

```javascript
// 注册自定义底图
echarts.registerMap('station', {
  geoJSON: {...},  // 地理数据
  svg: 'station-aerial.svg'  // SVG底图
})

// 使用
option = {
  geo: {
    map: 'station',
    type: 'map'
  },
  series: [{
    type: 'scatter',
    coordinateSystem: 'geo',
    data: markers
  }]
}
```

### 方案C：使用 SVG 叠加

**适用场景**：标记点数量较少，需要矢量图形

```html
<svg class="map-overlay">
  <image href="station-aerial.jpg" />
  <circle v-for="marker in markers" 
          :cx="marker.x" 
          :cy="marker.y" 
          r="8" />
</svg>
```

---

## ✅ 当前实现状态

✅ **已完成**：
- Canvas 地图渲染框架
- 标记点绘制功能
- 鼠标悬停提示
- 点击查看详情
- 滚轮缩放
- 筛选功能集成

🔄 **待对接**：
- 后台API接口（图片URL和标记点数据）
- 真实航拍图片
- 缺陷数据查询

---

## 📌 总结

**推荐方案**：使用 **Canvas API** 实现

**优势**：
- 性能好，适合大量标记点
- 无依赖，不需要引入地图库
- 完全自定义，灵活性强
- 支持缩放、平移等交互

**数据交互**：
- 后台提供航拍图片URL
- 后台提供缺陷标记点数据（包含相对坐标 x, y）
- 前端使用Canvas渲染图片和标记点

**实施步骤**：
1. 后台准备航拍图片并上传
2. 后台实现图片API和标记点数据API
3. 前端调用API获取数据并渲染


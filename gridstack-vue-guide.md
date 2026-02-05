# GridStack.js v12+ Vue 3 集成指南

本文档定义了 GridStack.js 在 Vue 3 中的使用规范，适用于 v12+ 版本。

## 1. 核心概念

GridStack.js 是一个用于创建可拖拽、可调整大小的网格布局库。在 Vue 3 中集成时，需要注意以下关键点：

- **GridStack 管理 DOM**：GridStack 负责创建和管理 `.grid-stack-item` 和 `.grid-stack-item-content` 元素
- **Vue 负责内容渲染**：通过 `GridStack.renderCB` 回调，将 Vue 组件渲染到 GridStack 创建的容器中
- **手动生命周期管理**：需要手动处理 Vue 组件的挂载和卸载

## 2. 安装与导入

```bash
npm install gridstack
# 或
yarn add gridstack
```

```typescript
// ES6 / TypeScript 导入
import 'gridstack/dist/gridstack.min.css'
import { GridStack } from 'gridstack'

// 可选的类型导入
import type { GridStackWidget, GridStackOptions, GridStackNode } from 'gridstack'
```

**v12+ 特性**：不再需要 `gridstack-extra.min.css`，列数通过 CSS 变量自动处理。

## 3. 基础初始化

### 3.1 固定列数模式（本项目采用）

```typescript
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { GridStack, type GridStackWidget } from 'gridstack'

const gridContainer = useTemplateRef<HTMLElement>('gridContainer')
let grid: GridStack | null = null

onMounted(() => {
  if (!gridContainer.value) return
  
  grid = GridStack.init({
    column: 12,            // 固定 12 列（不随窗口变化）
    cellHeight: 92,        // 单元格高度（px）
    margin: 8,             // 单元格间距
    float: false,          // 禁止浮动，自动紧凑排列
    animate: true,         // 启用动画
    
    // 交互配置
    disableResize: true,   // 禁用用户调整大小（通过表单修改）
    disableDrag: false,    // 允许拖拽
    staticGrid: false,     // 非静态网格
    acceptWidgets: false,  // 不接受外部拖入
  }, gridContainer.value)
})
```

### 3.2 响应式列数模式（可选）

如需根据窗口宽度自动调整列数：

```typescript
grid = GridStack.init({
  cellHeight: 70,
  margin: 8,
  float: false,
  animate: true,
  
  // 响应式列配置（v10+）
  columnOpts: {
    columnWidth: 100,    // 期望列宽，自动计算列数
    columnMax: 12,       // 最大列数
    layout: 'moveScale', // 重排模式：'moveScale' | 'move' | 'scale' | 'compact' | 'list' | 'none'
    // 或使用断点
    breakpoints: [
      { w: 768, c: 1 },  // 窗口宽度 < 768px → 1 列
      { w: 1200, c: 6 }  // 窗口宽度 < 1200px → 6 列
    ]
  },
}, gridContainer.value)
```

## 4. Vue 组件渲染（核心）

### 4.1 使用 `GridStack.renderCB`（v11+ 推荐）

```typescript
import { h, render, type VNode } from 'vue'
import MyWidgetComponent from './MyWidgetComponent.vue'

// 用于追踪已渲染的 DOM 元素，以便清理
const shadowDom: Record<string, HTMLElement> = {}

// 全局渲染回调 - 在 GridStack 创建 widget 时调用
GridStack.renderCB = (el: HTMLElement, widget: GridStackWidget) => {
  // el: div.grid-stack-item-content 元素
  // widget: GridStackWidget 数据对象
  
  const vnode = h(MyWidgetComponent, {
    widgetId: widget.id,
    // 其他 props...
    onRemove: () => {
      const gridItemEl = el.closest('.grid-stack-item')
      if (gridItemEl) {
        grid?.removeWidget(gridItemEl as HTMLElement)
      }
    }
  })
  
  shadowDom[widget.id!] = el
  render(vnode, el)
}
```

### 4.2 根据类型渲染不同组件

```typescript
import { h, render, type VNode } from 'vue'
import SiteWidget from './SiteWidget.vue'
import FolderWidget from './FolderWidget.vue'

type WidgetType = 'site' | 'folder'

interface WidgetData {
  id: string
  type: WidgetType
  // 其他数据...
}

// 组件映射表
const componentMap: Record<WidgetType, Component> = {
  site: SiteWidget,
  folder: FolderWidget,
}

// 数据存储（可以是 Pinia store、Map 等）
const widgetDataMap = new Map<string, WidgetData>()

GridStack.renderCB = (el: HTMLElement, widget: GridStackWidget) => {
  const data = widgetDataMap.get(widget.id!)
  if (!data) return
  
  const Component = componentMap[data.type]
  if (!Component) return
  
  const vnode = h(Component, { data })
  shadowDom[data.id] = el
  render(vnode, el)
}
```

## 5. 生命周期管理

### 5.1 清理 Vue 渲染

```typescript
// 监听 removed 事件，清理对应的 Vue 渲染
grid.on('removed', (event: Event, items: GridStackNode[]) => {
  items.forEach((item) => {
    if (shadowDom[item.id!]) {
      render(null, shadowDom[item.id!])  // 卸载 Vue 组件
      delete shadowDom[item.id!]
    }
  })
})

// 组件卸载时清理所有渲染
onBeforeUnmount(() => {
  Object.values(shadowDom).forEach((el) => {
    render(null, el)
  })
  grid?.destroy(false)  // false = 不移除 DOM 元素
})
```

## 6. Widget 操作

### 6.1 添加 Widget

```typescript
function addWidget(data: WidgetData) {
  if (!grid) return
  
  // 先存储数据（renderCB 会用到）
  widgetDataMap.set(data.id, data)
  
  // 添加到 GridStack
  const el = grid.addWidget({
    id: data.id,
    x: 0,                    // 可选，自动计算
    y: 0,                    // 可选，自动计算
    w: 2,                    // 宽度（列数）
    h: 2,                    // 高度（行数）
    minW: 1,                 // 最小宽度
    minH: 1,                 // 最小高度
    maxW: 6,                 // 最大宽度
    maxH: 4,                 // 最大高度
    noMove: false,           // 禁止移动
    noResize: false,         // 禁止调整大小
    locked: false,           // 锁定位置
  })
  
  // 获取实际位置（GridStack 自动计算后的值）
  const x = +(el.getAttribute('gs-x') ?? 0)
  const y = +(el.getAttribute('gs-y') ?? 0)
}
```

### 6.2 批量加载

```typescript
const items: GridStackWidget[] = [
  { id: '1', x: 0, y: 0, w: 2, h: 2 },
  { id: '2', x: 2, y: 0, w: 3, h: 1 },
  { id: '3', x: 0, y: 2, w: 1, h: 1 },
]

// 加载数据前先存储到 map
items.forEach(item => {
  widgetDataMap.set(item.id!, { id: item.id!, type: 'site' })
})

// 批量加载
grid.load(items)
```

### 6.3 移除 Widget

```typescript
function removeWidget(id: string) {
  const el = document.querySelector(`.grid-stack-item[gs-id="${id}"]`)
  if (el) {
    grid?.removeWidget(el as HTMLElement)
  }
}
```

### 6.4 更新 Widget

```typescript
function updateWidget(id: string, opts: Partial<GridStackWidget>) {
  const el = document.querySelector(`.grid-stack-item[gs-id="${id}"]`)
  if (el) {
    grid?.update(el as HTMLElement, opts)
  }
}
```

## 7. 响应式列配置（v10+）

GridStack v10+ 引入了全新的响应式列系统，通过 `columnOpts` 配置。

### 7.1 基于列宽自动计算（推荐）

```typescript
GridStack.init({
  cellHeight: 80,
  columnOpts: {
    columnWidth: 100,      // 期望的列宽（px）
    // GridStack 会根据：列数 = Math.floor(容器宽度 / columnWidth)
    // 自动计算最佳列数
  },
  float: true,
})
```

当容器宽度变化时，GridStack 自动重新计算列数并重排 widget。

### 7.2 基于断点配置

```typescript
GridStack.init({
  columnOpts: {
    breakpoints: [
      { w: 768, c: 1 },    // 窗口宽度 < 768px → 1 列
      { w: 992, c: 4 },    // 窗口宽度 < 992px → 4 列
      { w: 1200, c: 8 },   // 窗口宽度 < 1200px → 8 列
    ],
    // 超过最大断点宽度时使用 columnMax
    columnMax: 12,
  }
})
```

### 7.3 重排布局模式 `layout`

当列数变化时，widget 如何重新布局：

| 值 | 说明 |
|---|---|
| `'moveScale'` | **默认推荐**。移动 + 缩放，保持相对位置和比例 |
| `'move'` | 只移动位置，不缩放大小 |
| `'scale'` | 只缩放大小，不移动位置 |
| `'list'` | 垂直列表模式，所有 widget 宽度占满 |
| `'compact'` | 紧凑模式，向左上角压缩 |
| `'none'` | 不重排，保持原样（可能溢出） |

```typescript
GridStack.init({
  columnOpts: {
    columnWidth: 100,
    layout: 'moveScale',  // 列数变化时移动+缩放
  }
})
```

### 7.4 获取/设置当前列数

```typescript
// 获取当前列数
const columns = grid.getColumn()

// 手动设置列数（会触发重排）
grid.column(6)

// 监听列数变化
grid.on('change', () => {
  console.log('当前列数:', grid.getColumn())
})
```

### 7.5 完整响应式示例

```typescript
const grid = GridStack.init({
  cellHeight: 80,
  animate: true,         // 重排时启用动画
  float: true,
  columnOpts: {
    columnWidth: 100,    // 根据容器宽度自动计算列数
    columnMax: 12,       // 最大不超过 12 列
    layout: 'moveScale', // 平滑过渡
  },
  children: [
    { x: 0, y: 0, w: 2, h: 2, id: '1', content: 'Widget 1' },
    { x: 2, y: 0, w: 4, h: 1, id: '2', content: 'Widget 2' },
  ]
})

// 显示当前列数
grid.on('change', () => {
  console.log(`列数变化: ${grid.getColumn()}`)
})
```

## 8. 事件监听

```typescript
// 位置/大小变化
grid.on('change', (event: Event, items: GridStackNode[]) => {
  items.forEach(item => {
    console.log(`Widget ${item.id} changed: x=${item.x}, y=${item.y}, w=${item.w}, h=${item.h}`)
  })
})

// Widget 添加
grid.on('added', (event: Event, items: GridStackNode[]) => {
  console.log('Widgets added:', items)
})

// Widget 移除
grid.on('removed', (event: Event, items: GridStackNode[]) => {
  console.log('Widgets removed:', items)
})

// 拖拽开始/结束
grid.on('dragstart', (event: Event, el: HTMLElement) => {})
grid.on('dragstop', (event: Event, el: HTMLElement) => {})

// 调整大小开始/结束
grid.on('resizestart', (event: Event, el: HTMLElement) => {})
grid.on('resizestop', (event: Event, el: HTMLElement) => {})
```

## 9. 样式注意事项

### 9.1 必须导入基础样式

```typescript
import 'gridstack/dist/gridstack.min.css'
```

### 9.2 包含 GridStack 元素的组件不能使用 `scoped`

```vue
<style>
/* 不要使用 scoped，否则 GridStack 创建的元素样式不会生效 */
@import 'gridstack/dist/gridstack.min.css';

.grid-stack {
  /* 自定义样式 */
}
</style>
```

或者在全局样式中导入：

```typescript
// main.ts
import 'gridstack/dist/gridstack.min.css'
```

### 9.3 v12+ CSS 变量

v12 使用 CSS 变量控制列数，无需额外 CSS 文件：

```css
.grid-stack {
  --gs-columns: 12;        /* 列数 */
  --gs-cell-height: 70px;  /* 单元格高度 */
  --gs-margin: 10px;       /* 间距 */
}
```

## 10. TypeScript 类型定义

```typescript
import type {
  GridStack,
  GridStackOptions,
  GridStackWidget,
  GridStackNode,
  GridItemHTMLElement,
} from 'gridstack'

// GridStackWidget - widget 配置
interface GridStackWidget {
  id?: string
  x?: number
  y?: number
  w?: number
  h?: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  content?: string
  noMove?: boolean
  noResize?: boolean
  locked?: boolean
}

// GridStackNode - 运行时节点数据（包含更多内部属性）
interface GridStackNode extends GridStackWidget {
  el?: HTMLElement
  grid?: GridStack
}
```

## 11. 常见问题

### Q: Widget 内容不显示？

确保：
1. `GridStack.renderCB` 在 `GridStack.init()` 之前设置
2. 样式已正确导入且未使用 `scoped`
3. 数据已存储到 map 中

### Q: 组件卸载后内存泄漏？

确保在 `removed` 事件和 `onBeforeUnmount` 中调用 `render(null, el)` 清理 Vue 渲染。

### Q: 响应式布局不生效？

使用 `columnOpts.breakpoints` 替代已废弃的 `oneColumnMode`：

```typescript
GridStack.init({
  columnOpts: {
    breakpoints: [{ w: 768, c: 1 }]
  }
})
```

## 12. 完整示例

```vue
<template>
  <div class="grid-stack" ref="gridContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef, h, render } from 'vue'
import { GridStack, type GridStackWidget, type GridStackNode } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'

import WidgetComponent from './WidgetComponent.vue'

const gridContainer = useTemplateRef<HTMLElement>('gridContainer')
let grid: GridStack | null = null
const shadowDom: Record<string, HTMLElement> = {}

// 设置渲染回调（必须在 init 之前）
GridStack.renderCB = (el: HTMLElement, widget: GridStackWidget) => {
  const vnode = h(WidgetComponent, {
    widgetId: widget.id,
    onRemove: () => {
      const gridItemEl = el.closest('.grid-stack-item')
      if (gridItemEl) grid?.removeWidget(gridItemEl as HTMLElement)
    }
  })
  shadowDom[widget.id!] = el
  render(vnode, el)
}

onMounted(() => {
  if (!gridContainer.value) return
  
  grid = GridStack.init({
    cellHeight: 70,
    margin: 8,
    float: false,
    columnOpts: { columnMax: 12, layout: 'compact' }
  }, gridContainer.value)
  
  // 清理回调
  grid.on('removed', (event: Event, items: GridStackNode[]) => {
    items.forEach(item => {
      if (shadowDom[item.id!]) {
        render(null, shadowDom[item.id!])
        delete shadowDom[item.id!]
      }
    })
  })
  
  // 加载初始数据
  grid.load([
    { id: '1', x: 0, y: 0, w: 2, h: 2 },
    { id: '2', x: 2, y: 0, w: 3, h: 1 },
  ])
})

onBeforeUnmount(() => {
  Object.values(shadowDom).forEach(el => render(null, el))
  grid?.destroy(false)
})

function addWidget(opts: GridStackWidget) {
  grid?.addWidget(opts)
}

defineExpose({ addWidget })
</script>

<style>
/* 不能使用 scoped */
.grid-stack {
  background: transparent;
}
</style>
```

## 13. 本项目数据架构

本项目采用 **固定列数 + 排序分离存储** 的架构：

### 13.1 数据分离设计

```
┌─────────────────────────────────────────────────────────┐
│  数据库 (Dexie/IndexedDB)                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ GridItem: { id, type, title }                   │   │
│  │ FolderItem: { ..., size: 'horizontal'|'vertical'|'large' } │
│  │ SiteItem: { ..., url, icon, pid }               │   │
│  └─────────────────────────────────────────────────┘   │
│  不存储位置信息，避免窗口变化导致位置混乱              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  localStorage                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ gridOrder: ["id3", "id1", "id5", "id2", ...]    │   │
│  └─────────────────────────────────────────────────┘   │
│  只存储 ID 顺序，轻量且无需同步到数据库               │
└─────────────────────────────────────────────────────────┘
```

### 13.2 文件夹尺寸预设

```typescript
type FolderSize = 'horizontal' | 'vertical' | 'large'

const FOLDER_SIZE_MAP: Record<FolderSize, { w: number; h: number }> = {
  horizontal: { w: 2, h: 1 },  // 横向 2x1
  vertical: { w: 1, h: 2 },    // 纵向 1x2
  large: { w: 2, h: 2 }        // 大号 2x2
}
```

### 13.3 加载流程

```typescript
function loadWidgets() {
  // 1. 从数据库获取所有 GridItem
  const items = Array.from(gridItemsMap.values())
  
  // 2. 按 localStorage 中的 gridOrder 排序
  const sortedItems = sortByOrder(items)
  
  // 3. 批量添加到 GridStack（不指定 x, y）
  grid.batchUpdate(true)
  sortedItems.forEach((item) => {
    const { w, h } = getWidgetSize(item)
    grid.addWidget({ id: item.id, w, h })  // GridStack 自动 compact
  })
  grid.batchUpdate(false)
}
```

### 13.4 拖拽保存流程

```typescript
grid.on('dragstop', () => {
  // 从 GridStack 获取当前节点顺序（按 y, x 排序）
  const nodes = grid.engine.nodes
    .slice()
    .sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y
      return a.x - b.x
    })
  
  const ids = nodes.map((node) => node.id).filter(Boolean)
  
  // 保存到 localStorage
  updateGridOrder(ids)
})
```

### 13.5 相关文件

- `store/grid-order.ts` - 排序存储（localStorage）
- `store/grid-items.ts` - 数据存储（IndexedDB）
- `components/grid-layout/use-grid-stack.tsx` - GridStack 集成
- `types/common.ts` - 类型定义

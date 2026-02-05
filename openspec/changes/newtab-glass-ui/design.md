## Context

基于项目 design.md 的设计，这是一个简洁、高性能、美观的浏览器新标签页应用。

当前状态：

- Vue 3 + TypeScript + WXT 技术栈已搭建
- GridStack 网格布局已引入
- 组件骨架已创建（SiteItem、FolderItem、Modal 等）
- Dexie 数据库和 useModal hooks 已实现
- 缺少：组件业务逻辑、store 层数据管理、样式系统

数据流设计：UI ↔ store ↔ db/localStorage

## Goals / Non-Goals

**Goals:**

- 实现所有组件的业务逻辑
- 实现基于 Vue 响应式的 store 层
- 建立统一的毛玻璃风格 CSS 变量系统
- 为所有组件添加毛玻璃效果
- 添加简洁的 hover 过渡效果
- 确保 Chrome、Edge、Firefox 兼容

**Non-Goals:**

- 复杂动画（位移、缩放、弹跳）
- 主题切换（暗色/亮色）- 后续扩展
- WebDAV 同步功能 - 后续扩展

## Decisions

### 1. Store 实现方案

**选择**: 使用 Vue 原生响应式 API（ref、reactive、computed）

**理由**:

- 项目规模小，无需 Pinia 的复杂性
- 减少依赖
- 与 Composition API 自然配合

### 2. Favicon 获取策略

**选择**:

1. 尝试获取 `{origin}/favicon.ico`
2. 失败则使用网站名称首字作为占位

**理由**:

- 浏览器扩展有跨域限制，复杂的 favicon 解析可能失败
- 首字占位方案简单可靠

### 3. 图标存储格式

**选择**: Base64 字符串

**理由**:

- 可直接存储在 IndexedDB
- 无需额外的文件系统管理
- 渲染时直接作为 data URL 使用

### 4. Context Menu 实现

**选择**: API 调用方式（命令式）

**理由**:

- 灵活性高，不同组件可传入不同菜单项
- 无需在每个组件中声明菜单
- 易于管理菜单状态

### 5. CSS 变量系统

**选择**: 使用原生 CSS 变量定义设计 token

**理由**:

- 无需额外依赖
- 运行时可动态修改
- 浏览器兼容性好

### 6. 毛玻璃实现

**选择**: `backdrop-filter: blur()` + 半透明背景 + 细边框

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
```

### 7. 过渡效果策略

**选择**: 仅使用 opacity 和 background-color 的 CSS transition（200ms）

**理由**:

- 用户要求简洁，不需要位移动画
- 性能好

## Risks / Trade-offs

**[Favicon 获取失败]** → 使用名称首字作为占位，用户可手动上传图标

**[backdrop-filter 性能]** → 限制毛玻璃层级为 2-3 层

**[深色壁纸对比度]** → 使用足够的背景透明度和边框强化可见性

**[GridStack renderCB 复杂性]** → 参考官方文档，使用 TSX 实现渲染回调

## 目的

做一个简洁的，高性能的，美观的，个人使用的浏览器新标签页面

## 组件设计

### 样式风格

统一使用基于毛玻璃风格的样式。

### 基础组件

包含`button`, `context-menu`, `input`, `select`, `modal`。

其中 `context-menu` 是api的使用方式。

### 功能组件

#### site-item

网站项组件。属于网格项`GridItem`的一种，也是最基础的网格项，他可以被 `GridStack` 直接作为网格项渲染，也可以渲染在 `folder-item` 文件夹组件中，由`folder-item`组件内部负责渲染。

#### site-modal

网站项编辑模态框。在新增和编辑网站时打开，它使用`useModal`hooks, 并把返回的`open`方法导出。可以在里面编辑网站的地址、名称、图标，其中地址更新时如果图标和名称都不存在首先会自动获取名称和图标，获取的图标必须首先转换成base64格式的，如果图标获取不到，就使用名称的第一个字作为图标。

#### folder-item

文件夹项组件。 属于网格项`GridItem`的一种，由`GridStack` 控制渲染

#### folder-modal

和`site-modal`类似，它用来编辑文件夹，包括编辑（选择）文件夹的尺寸(1x2、2x1、 2x2)、文件夹的名称。和`site-modal`一样，它也导出一个open方法。

#### setting-modal

设置模态框，用于设置标签页，例如是否显示搜索栏、是否启用壁纸、壁纸轮播间隔、 数据备份（导入导出）。和`site-modal`一样，它也导出一个open方法。

#### grid-layout

这是布局的核心组件，它基于 `GridStack`, 并使用 `renderCB` 这种现代的方式来渲染控件，具体请参考`https://github.com/gridstack/gridstack.js?tab=readme-ov-file#migrating-to-v12`

## 数据和持久化设计

数据流转结构: UI <-> store <-> db、localStorage

store层很关键。在标签页加载时，负责从`db`和`localStorage`中获取数据，然后转换成对应的供前端渲染的数据。在前端编辑时，它负责把数据同步到`db`和`localStorage`中

store并没有借助`pinia`这种库，因为完全不需要，而是基于Vue的响应式系统。

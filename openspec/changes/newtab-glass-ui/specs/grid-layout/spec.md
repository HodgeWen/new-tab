## ADDED Requirements

### Requirement: GridStack 集成

`NGridLayout` 组件 SHALL 基于 GridStack 实现可拖拽的网格布局。

#### Scenario: 初始化 GridStack

- **WHEN** 组件挂载
- **THEN** 初始化 GridStack 实例，配置网格参数

### Requirement: 使用 renderCB 渲染

组件 SHALL 使用 GridStack v12 的 `renderCB` 方式渲染网格项，而非传统的 DOM 操作。

#### Scenario: 渲染网格项

- **WHEN** GridStack 需要渲染网格项
- **THEN** 通过 renderCB 回调使用 Vue 组件（NSiteItem/NFolderItem）渲染

### Requirement: 数据驱动渲染

组件 SHALL 从 store 获取网格项数据并渲染。

#### Scenario: 加载并渲染数据

- **WHEN** 组件挂载或 store 数据变化
- **THEN** 根据 store 中的 gridItems 数据渲染网格布局

### Requirement: 拖拽重排

用户 SHALL 能够拖拽网格项重新排列位置。

#### Scenario: 拖拽移动

- **WHEN** 用户拖拽网格项到新位置
- **THEN** 网格项移动到新位置，布局自动调整

### Requirement: 位置变化持久化

网格项位置变化 SHALL 自动同步到 store 和数据库。

#### Scenario: 保存位置变化

- **WHEN** 用户完成拖拽操作
- **THEN** 新位置信息保存到 store 并持久化到数据库

### Requirement: 网格配置

GridStack SHALL 使用以下配置：

- 单元格高度：92px
- 边距：8px
- 列宽：88px
- 最大列数：12

#### Scenario: 应用网格配置

- **WHEN** GridStack 初始化
- **THEN** 使用指定的单元格高度、边距、列宽配置

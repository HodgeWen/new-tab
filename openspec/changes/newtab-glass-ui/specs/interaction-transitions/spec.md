## ADDED Requirements

### Requirement: Hover 高亮效果

所有可交互元素 SHALL 在鼠标悬停时显示视觉反馈：

- 背景色微微变亮（增加约 5% 白色不透明度）
- 过渡时长为 200ms
- 使用 ease 缓动函数

#### Scenario: SiteItem hover 高亮

- **WHEN** 用户将鼠标悬停在 SiteItem 上
- **THEN** 组件背景色在 200ms 内平滑变亮

#### Scenario: FolderItem hover 高亮

- **WHEN** 用户将鼠标悬停在 FolderItem 上
- **THEN** 组件背景色在 200ms 内平滑变亮

#### Scenario: Button hover 高亮

- **WHEN** 用户将鼠标悬停在按钮上
- **THEN** 按钮背景色在 200ms 内平滑变亮

#### Scenario: 菜单项 hover 高亮

- **WHEN** 用户将鼠标悬停在右键菜单项上
- **THEN** 菜单项背景色在 200ms 内平滑变亮

### Requirement: 聚焦状态效果

表单元素（NInput、NSelect）SHALL 在聚焦时显示视觉反馈：

- 边框颜色变化
- 过渡时长为 200ms

#### Scenario: 输入框聚焦效果

- **WHEN** 用户点击或 Tab 到输入框
- **THEN** 输入框边框颜色平滑变化，指示聚焦状态

### Requirement: Modal 显示/隐藏过渡

Modal 组件 SHALL 具有淡入淡出效果：

- 遮罩层透明度过渡
- 模态框内容透明度过渡
- 过渡时长为 200ms

#### Scenario: Modal 打开动画

- **WHEN** 用户触发打开模态框
- **THEN** 遮罩和模态框内容在 200ms 内淡入

#### Scenario: Modal 关闭动画

- **WHEN** 用户关闭模态框
- **THEN** 遮罩和模态框内容在 200ms 内淡出

### Requirement: 禁止复杂动画

系统 SHALL NOT 包含以下动画效果：

- 位移动画（transform: translate）
- 缩放动画（transform: scale）
- 旋转动画（transform: rotate）
- 弹跳/弹性效果

#### Scenario: hover 不产生位移

- **WHEN** 用户悬停在任何可交互元素上
- **THEN** 元素位置保持不变，仅背景色变化

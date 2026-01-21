## ADDED Requirements

### Requirement: FolderCard 分区交互

FolderCard 组件 SHALL 根据点击区域执行不同操作：

- **预览图标区域**：点击直接打开对应网站
- **标题区域**：点击打开文件夹详情模态框
- **空白区域**（空文件夹时）：点击打开文件夹详情模态框

#### Scenario: 点击预览图标打开网站

- **WHEN** 点击文件夹预览区中的网站图标
- **THEN** 在新标签页打开该网站 URL
- **AND** 不打开文件夹详情模态框

#### Scenario: 点击标题打开文件夹

- **WHEN** 点击文件夹标题区域
- **THEN** 打开文件夹详情模态框
- **AND** 显示文件夹内所有网站

#### Scenario: 空文件夹点击

- **WHEN** 点击空文件夹的任意区域（空白图标区域或标题）
- **THEN** 打开文件夹详情模态框

#### Scenario: 预览图标悬停提示

- **WHEN** 鼠标悬停在预览图标上
- **THEN** 显示网站标题作为 tooltip
- **AND** 图标有 hover 效果（如透明度变化或缩放）

### Requirement: FolderCard 右键菜单

FolderCard 组件 SHALL 在任意区域支持右键菜单。

#### Scenario: 预览区右键

- **WHEN** 在预览图标区域右键点击
- **THEN** 打开文件夹右键菜单（非网站右键菜单）
- **AND** 阻止打开网站的默认行为

#### Scenario: 标题区右键

- **WHEN** 在标题区域右键点击
- **THEN** 打开文件夹右键菜单

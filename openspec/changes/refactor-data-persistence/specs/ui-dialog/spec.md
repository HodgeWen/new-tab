## MODIFIED Requirements

### Requirement: Folder Detail Dialog

系统 SHALL 使用 Dialog 组件重构文件夹详情弹窗，保持以下功能：
- 显示文件夹内所有网站
- 支持拖拽排序
- 支持点击打开网站
- 支持编辑/删除操作

#### Scenario: 文件夹详情

- **WHEN** 点击文件夹卡片的标题区域
- **THEN** 打开文件夹详情弹窗
- **AND** 显示文件夹内所有网站列表

#### Scenario: 拖拽排序

- **WHEN** 在文件夹详情中拖拽网站
- **THEN** 实时更新网站顺序
- **AND** 拖拽结束后持久化顺序

#### Scenario: 空文件夹触发

- **WHEN** 点击空文件夹的任意区域
- **THEN** 打开文件夹详情弹窗
- **AND** 显示空状态提示

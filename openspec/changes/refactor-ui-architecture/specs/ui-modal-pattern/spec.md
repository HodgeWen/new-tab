## ADDED Requirements

### Requirement: 自包含弹框模式

系统 SHALL 采用自包含弹框模式，每个弹框组件管理自己的状态并暴露控制方法。

弹框组件 SHALL：
- 使用 `useModal` composable 管理 `visible` 状态和表单数据
- 通过 `defineExpose({ open })` 暴露打开方法
- 支持传入初始数据参数

```typescript
// useModal composable
interface UseModalReturn<T> {
  visible: Ref<boolean>
  form: T
  open: (data?: Partial<T>) => void
  close: () => void
}

function useModal<T extends object>(defaultValue: T): UseModalReturn<T>
```

#### Scenario: 打开弹框
- **WHEN** 调用弹框组件的 `open(data)` 方法
- **THEN** 弹框显示
- **AND** 表单使用传入的数据初始化

#### Scenario: 关闭弹框
- **WHEN** 用户关闭弹框或调用 `close()` 方法
- **THEN** 弹框隐藏
- **AND** 表单重置为默认值

### Requirement: 弹框依赖注入

对于需要在多个不相关组件中调用的弹框，系统 SHALL 使用依赖注入模式。

依赖注入 SHALL：
- 在 `utils/di.ts` 定义 `COMPONENTS_DI_KEY`
- 在 App.vue 中 provide 所有需要全局访问的弹框引用
- 在子组件中通过 inject 获取弹框引用

```typescript
// utils/di.ts
export const COMPONENTS_DI_KEY: InjectionKey<{
  siteEdit: TemplateRef<InstanceType<typeof SiteEdit>>
  folderEdit: TemplateRef<InstanceType<typeof FolderEdit>>
}> = Symbol('COMPONENTS_DI_KEY')

// 使用方式
const { siteEdit } = inject(COMPONENTS_DI_KEY)!
siteEdit.value?.open({ url: 'https://example.com', title: 'Example' })
```

需要依赖注入的弹框：
- `SiteEdit`: 从网格、文件夹弹框、上下文菜单等多处调用
- `FolderEdit`: 从网格、上下文菜单等多处调用

#### Scenario: 跨组件调用弹框
- **WHEN** 在任意子组件中 inject `COMPONENTS_DI_KEY`
- **THEN** 可以获取到全局弹框的引用
- **AND** 调用 `open()` 方法打开弹框

### Requirement: 局部弹框访问

对于仅在父子组件间调用的弹框，系统 SHALL 使用 `useTemplateRef` 直接访问。

```typescript
// 父组件
const settingPanel = useTemplateRef('setting-panel')

function openSettings() {
  settingPanel.value?.open()
}
```

局部访问的弹框：
- `SettingPanel`: 只在 App.vue 的设置按钮调用
- `FolderModal`: 只在点击文件夹时调用

#### Scenario: 父组件调用弹框
- **WHEN** 父组件通过 `useTemplateRef` 获取弹框引用
- **THEN** 可以直接调用弹框的 `open()` 方法
- **AND** 无需依赖注入

## MODIFIED Requirements

### Requirement: Dialog 组件

系统 SHALL 提供 Dialog 组件用于模态弹窗，包含以下子组件：
- `Dialog`: 根容器，管理打开/关闭状态
- `DialogTrigger`: 触发器，点击打开弹窗（可选）
- `DialogContent`: 内容区域，渲染弹窗主体
- `DialogHeader`: 头部区域，包含标题和关闭按钮
- `DialogTitle`: 标题文本
- `DialogDescription`: 描述文本（可选）
- `DialogFooter`: 底部区域，放置操作按钮

Dialog 组件 SHALL 支持通过 `v-model:open` 双向绑定控制显示状态，使 `useModal` composable 可以直接控制弹窗。

Dialog 组件 SHALL 具备以下交互特性：
- Focus trap：焦点锁定在弹窗内
- ESC 关闭：按 Escape 键关闭弹窗
- Backdrop 关闭：点击遮罩层关闭弹窗
- 动画过渡：淡入淡出 + 缩放动画

Dialog 组件 SHALL 应用 Glassmorphism 样式：
- 内容区域：`glass` 类（bg-white/15、backdrop-blur-xl、border-white/20）
- 遮罩层：`bg-black/50 backdrop-blur-sm`
- 圆角：`rounded-2xl`

#### Scenario: 打开弹窗
- **WHEN** 点击 DialogTrigger 或设置 `open={true}`
- **THEN** 弹窗以动画形式显示
- **AND** 焦点移动到弹窗内第一个可聚焦元素
- **AND** 背景显示半透明遮罩

#### Scenario: ESC 关闭
- **WHEN** 弹窗打开状态下按 Escape 键
- **THEN** 弹窗以动画形式关闭
- **AND** 焦点返回到触发元素

#### Scenario: 点击遮罩关闭
- **WHEN** 点击弹窗外的遮罩区域
- **THEN** 弹窗关闭

#### Scenario: Focus trap
- **WHEN** 弹窗打开时按 Tab 键
- **THEN** 焦点在弹窗内元素间循环
- **AND** 不会移出弹窗

## REMOVED Requirements

### Requirement: AddSite Dialog

**Reason**: 功能由 `components/site/site-edit.vue` 提供，不再需要独立的 AddSite 规格。
**Migration**: 使用 `SiteEdit` 组件，通过 `open({ id: null })` 进入添加模式。

### Requirement: AddFolder Dialog

**Reason**: 功能由 `components/folder/folder-edit.vue` 提供，不再需要独立的 AddFolder 规格。
**Migration**: 使用 `FolderEdit` 组件，通过 `open({ id: null })` 进入添加模式。

### Requirement: Settings Dialog

**Reason**: 功能由 `components/setting/setting-panel.vue` 提供，采用自包含模式。
**Migration**: 使用 `SettingPanel` 组件，通过 `useTemplateRef` 获取引用并调用 `open()`。

### Requirement: Folder Detail Dialog

**Reason**: 功能由 `components/folder/folder-modal.vue` 提供，采用自包含模式。
**Migration**: 使用 `FolderModal` 组件，通过 `useTemplateRef` 或 props 传递文件夹 ID。

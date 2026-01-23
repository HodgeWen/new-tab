## Context

当前项目存在两套 UI 状态管理机制：
1. `UIContext` + `useUI()` - 通过 provide/inject 在 App.vue 提供
2. `useUIStore` - Pinia store

用户已开始迁移工作，部分组件（如 `site-edit.vue`）已采用新模式。需要完成剩余迁移并清理旧代码。

## Goals / Non-Goals

**Goals:**
- 统一 UI 状态管理到 Pinia store
- 弹框组件自包含，逻辑内聚
- 上下文菜单支持命令式调用和动态配置
- 组件目录结构清晰，分组明确

**Non-Goals:**
- 不改变业务逻辑
- 不改变视觉样式
- 不重构数据层（stores/grid-items, stores/settings 等）

## Decisions

### Decision 1: 弹框控制模式

**选择**: 组件自包含 + 暴露 `open` 方法

```typescript
// 组件内部
const { visible, form, open } = useModal<FormType>(defaultValue)
defineExpose({ open })

// 调用方式 A: 依赖注入（跨组件）
const { siteEdit } = inject(COMPONENTS_DI_KEY)!
siteEdit.value?.open(data)

// 调用方式 B: useTemplateRef（同组件/父子）
const settingPanel = useTemplateRef('setting-panel')
settingPanel.value?.open()
```

**理由**: 
- 逻辑内聚，相关代码在同一文件
- 减少全局状态，降低耦合
- 符合 Vue 组件设计最佳实践

### Decision 2: 上下文菜单 API 设计

**选择**: 命令式 API + 动态配置

```typescript
// API 设计
interface ContextMenuItem {
  icon?: Component
  label: string
  action: () => void
  danger?: boolean
  disabled?: boolean
}

interface ContextMenuDivider {
  type: 'divider'
}

interface ContextMenuSubmenu {
  type: 'submenu'
  icon?: Component
  label: string
  items: ContextMenuItem[]
}

type ContextMenuItemConfig = ContextMenuItem | ContextMenuDivider | ContextMenuSubmenu

// 使用方式
const { show, hide } = useContextMenu()

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  show({
    x: event.clientX,
    y: event.clientY,
    items: [
      { icon: Plus, label: '新增网站', action: () => openSiteEdit() },
      { type: 'divider' },
      { icon: Settings, label: '设置', action: () => openSettings() }
    ]
  })
}
```

**理由**:
- 灵活性高，菜单项可动态配置
- 调用点明确，便于追踪
- 符合现代 UI 库设计趋势

### Decision 3: 依赖注入 Key 扩展

**选择**: 扩展 `COMPONENTS_DI_KEY` 包含所有需要跨组件访问的弹框

```typescript
// utils/di.ts
export const COMPONENTS_DI_KEY: InjectionKey<{
  siteEdit: TemplateRef<InstanceType<typeof SiteEdit>>
  folderEdit: TemplateRef<InstanceType<typeof FolderEdit>>
}> = Symbol('COMPONENTS_DI_KEY')
```

**需要依赖注入的组件**:
- `SiteEdit` - 从 TabGrid、FolderModal、ContextMenu 等多处调用
- `FolderEdit` - 从 TabGrid、ContextMenu 等多处调用

**不需要依赖注入的组件**:
- `SettingPanel` - 只在 App.vue 的设置按钮调用
- `FolderModal` - 只在点击文件夹时调用

### Decision 4: 组件目录结构

**选择**: 全部使用子文件夹 + index.ts 导出

```
components/
├── context-menu/           # 新增：上下文菜单渲染组件
│   ├── context-menu.vue
│   └── index.ts
├── edit-toolbar/
│   ├── edit-toolbar.vue
│   └── index.ts
├── folder/
│   ├── folder-edit.vue
│   ├── folder-item.vue
│   ├── folder-modal.vue
│   └── index.ts
├── grid/
│   ├── grid-container.vue
│   └── index.ts
├── search/
│   ├── search-bar.vue
│   └── index.ts
├── setting/
│   ├── setting-panel.vue
│   └── index.ts
└── site/
    ├── site-edit.vue
    ├── site-item.vue
    └── index.ts
```

**待删除的旧组件**:
- `AddFolderModal.vue`
- `AddSiteModal.vue`
- `BookmarkCard.vue`
- `ContextMenu.vue`
- `EditToolbar.vue`
- `FolderCard.vue`
- `FolderModal.vue`
- `SearchBar.vue`
- `SettingsPanel.vue`
- `TabGrid.vue`

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 迁移过程中功能丢失 | 逐个组件迁移，每步验证功能完整 |
| 类型安全问题 | 迁移时完善 TypeScript 类型定义 |
| 依赖注入未正确设置 | 在 App.vue 中统一 provide |

## Migration Plan

1. **Phase 1**: 完善新组件结构
   - 完成 `folder-edit.vue` 实现
   - 实现 `useContextMenu` API
   - 扩展 `utils/di.ts`

2. **Phase 2**: 迁移旧组件功能
   - 迁移 `EditToolbar.vue` → `edit-toolbar/edit-toolbar.vue`
   - 迁移 `FolderModal.vue` → `folder/folder-modal.vue`
   - 迁移 `SettingsPanel.vue` → `setting/setting-panel.vue`
   - 迁移 `TabGrid.vue` → `grid/grid-container.vue`
   - 迁移 `SearchBar.vue` → `search/search-bar.vue`

3. **Phase 3**: 更新调用点
   - 更新 App.vue 使用新组件
   - 移除 `useUI` 调用
   - 使用 `useUIStore` 和依赖注入

4. **Phase 4**: 清理
   - 删除旧组件文件
   - 删除 `composables/useUI.ts`
   - 删除 `types/ui.ts`

## Open Questions

- 无

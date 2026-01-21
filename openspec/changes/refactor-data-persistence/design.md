## Context

当前应用使用 Pinia + IndexedDB (Dexie) 进行状态管理和数据持久化。随着功能迭代，出现了以下架构问题：

1. **存储职责不清晰**：Settings 和 WebDAV 配置在 IndexedDB 和代码定义中存在重复
2. **UI 状态全局化过度**：右键菜单、模态框状态等组件级状态被提升到全局 store
3. **FolderCard 交互粗糙**：无法快速访问文件夹预览中的网站

plan.md 明确指出：**不要考虑数据兼容性，直接进行破坏性更改**——所有功能目前都是试验性的。

## Goals / Non-Goals

### Goals

- 简化数据存储架构，消除冗余
- 将 Settings 迁移到 localStorage，提升访问效率
- 新增 orders 结构优化排序操作性能
- 删除 ui store，将 UI 状态下沉到组件层级
- 增强 FolderCard 交互，支持直接点击预览图标

### Non-Goals

- 数据迁移脚本（破坏性更改，不保留旧数据）
- 修改 wallpaper 或 favicon 的存储方式（保持 IndexedDB）
- 重构 GridStack 相关逻辑

## Decisions

### Decision 1: Settings 使用 localStorage

**选择**：使用 localStorage 存储 Settings，JSON 序列化

**理由**：

- Settings 数据量小（< 1KB）
- 访问频繁，同步 API 更简洁
- 不需要复杂查询能力

**实现**：

```typescript
// stores/settings.ts
const STORAGE_KEY = 'new-tab-settings'

function loadSettings(): Settings {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw
    ? deepMergeSettings(defaultSettings, JSON.parse(raw))
    : defaultSettings
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
```

### Decision 2: 移除 webdav 表

**选择**：删除 `webdav` IndexedDB 表，WebDAV 配置完全通过 Settings 存储

**理由**：

- `Settings.webdav` 已定义完整的 WebDAV 配置结构
- 当前 `webdav` 表仅存储加密密码，但 Settings 中也有 password 字段
- 简化数据层，消除冗余

**注意**：WebDAV 密码将以明文存储在 localStorage。如需加密存储，可在 Settings 序列化时进行处理。

### Decision 3: 删除 ui store，使用 provide/inject

**选择**：删除 `stores/ui.ts`，使用 Vue 的 provide/inject 在组件树中传递 UI 状态

**理由**：

- 右键菜单、模态框、编辑模式等状态本质上是 UI 层面的
- 这些状态不需要在组件树外部访问
- provide/inject 保持响应性，同时限制作用域

**架构**：

```
App.vue (provide)
├── contextMenuState
├── editModeState
├── modalState
└── openFolderState

TabGrid.vue (inject)
├── 使用 contextMenuState
├── 使用 editModeState
└── 使用 openFolderState

ContextMenu.vue (inject)
└── 使用 contextMenuState

...其他组件
```

**实现示例**：

```typescript
// App.vue
const contextMenu = ref<ContextMenuState>({ visible: false, x: 0, y: 0, target: 'blank', targetItem: null })
const isEditMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())

provide('contextMenu', { state: contextMenu, open: openContextMenu, close: closeContextMenu })
provide('editMode', { isEditMode, selectedIds, toggle: toggleEditMode, ... })
```

### Decision 4: Orders 结构优化排序操作

**选择**：新增 `orders` 数据结构存储在 localStorage，用于管理网格项的排序和层级关系

**数据结构**：

```typescript
// [itemId, childIds[]]
type OrderEntry = [string, string[]]
type Orders = OrderEntry[]

// 示例
const orders: Orders = [
  ['folder-1', ['site-a', 'site-b']], // 文件夹及其子项
  ['site-c', []], // 根级网站
  ['folder-2', ['site-d']]
]
```

**理由**：

- 拖拽排序操作频繁，直接操作 IndexedDB 会有延迟
- 分离排序逻辑和实体数据，操作时只修改轻量的 `orders`
- 批量保存时再同步到 IndexedDB 的 `order` 和 `parentId` 字段
- localStorage 同步 API，操作即时响应

**工作流程**：

1. 应用启动时从 localStorage 加载 `orders`，如不存在则从 gridItems 构建
2. UI 拖拽操作只修改内存中的 `orders` 状态
3. 拖拽结束或页面卸载时，根据 `orders` 批量更新 gridItems 表
4. 新增/删除网格项时同步更新 `orders`

**存储键名**：`new-tab-orders`

### Decision 5: FolderCard 分离点击区域

**选择**：将 FolderCard 的点击行为按区域分离

**交互设计**：

- 预览区的网站图标：点击直接打开该网站（`window.open`）
- 标题区域：点击打开文件夹详情模态框
- 右键菜单：在任意区域触发

**实现**：

```vue
<template>
  <div class="folder-card" @contextmenu="handleContextMenu">
    <!-- 预览网格 -->
    <div class="preview-grid">
      <img
        v-for="preview in previewItems"
        @click.stop="openSite(preview.url)"
        ...
      />
    </div>

    <!-- 标题区域 -->
    <div class="title-area" @click="openFolder">
      {{ item.title }}
    </div>
  </div>
</template>
```

## Risks / Trade-offs

| Risk                    | Impact | Mitigation                                             |
| ----------------------- | ------ | ------------------------------------------------------ |
| localStorage 大小限制   | 低     | Settings 数据量远小于 5MB 限制                         |
| 密码明文存储            | 中     | 可选：在序列化时加密；用户已知晓 WebDAV 密码为"弱保护" |
| provide/inject 类型安全 | 低     | 定义明确的 InjectionKey 和类型                         |
| 破坏性更改              | 高     | plan.md 已明确接受，用户数据将丢失                     |

## Migration Plan

**无迁移**——根据 plan.md 要求，直接进行破坏性更改：

1. 用户升级后，旧的 IndexedDB 数据将被忽略
2. Settings 从默认值重新开始
3. 用户需要重新配置 WebDAV 等设置

如果未来需要迁移，可在 `database.ts` 中添加版本检测和迁移逻辑。

## Open Questions

1. ~~WebDAV 密码是否需要加密存储？~~ 暂不加密，保持简洁，后续可增强
2. 是否需要在 FolderCard 预览图标上添加 hover 提示（显示网站标题）？—— 推荐实现，提升可用性

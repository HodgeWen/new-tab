---
name: Grid Items Store Refactor
overview: 重构网格项管理架构，将大部分增删改查操作集中到 stores/grid-items.ts 中，通过 items 响应式变更驱动视图更新。新增网格项和网站移出文件夹两个场景需要先调用 gridstack 获取位置。
todos:
  - id: impl-store-methods
    content: 实现 grid-items.ts 中的所有空方法和新增方法
    status: completed
  - id: fix-existing-methods
    content: 修复 addGridItem 和 updateGridItem 的问题
    status: completed
  - id: add-grid-container-methods
    content: 在 grid-container.vue 中添加 addExistingWidget 和 updateWidgetSize 方法
    status: completed
  - id: update-site-item
    content: 更新 site-item.vue 中移出分组的调用方式
    status: completed
  - id: update-folder-modal
    content: 更新 folder-modal.vue 中移出分组的调用方式
    status: completed
  - id: update-folder-edit
    content: 更新 folder-edit.vue 中尺寸更新的调用方式
    status: completed
  - id: update-folder-item
    content: 更新 folder-item.vue 中调整尺寸的调用方式
    status: completed
isProject: false
---

# Grid Items Store 重构计划

## 背景分析

当前 `stores/grid-items.ts` 已定义了多个方法但存在以下问题：

1. **空实现的方法**：`deleteGridItems`、`moveGridItemToFolder`、`moveGridItemOutOfFolder`、`reorder`、`batchUpdateGridPositions`、`batchMoveToFolder`
2. **缺失的方法**：
   - `batchDeleteGridItems` - [edit-toolbar.vue](components/edit-toolbar/edit-toolbar.vue) 第131行调用
   - `updateFolderSize` - [folder-edit.vue](components/folder/folder-edit.vue) 第150行调用

3. **现有方法的问题**：
   - `addGridItem` 未更新 `orders`
   - `updateGridItem` 只处理顶层 items，不处理文件夹内的网站

## 数据结构说明

```typescript
// orders: 存储顶层项目的排序和层级关系
// [itemId, childIds[]][]
orders = [
  ['folder-1', ['site-a', 'site-b']],  // 文件夹及其子项
  ['site-c', []]                        // 顶层网站
]

// items: 渲染用的 UI 结构，由 orders 和 itemsMap 构建
items = [
  { id: 'folder-1', type: 'folder', children: [...] },
  { id: 'site-c', type: 'site', ... }
]
```

## 需要更新的文件

### 1. [stores/grid-items.ts](stores/grid-items.ts) - 核心修改

**修复现有方法：**

- `addGridItem` - 添加后同步更新 `orders`
- `updateGridItem` - 支持更新文件夹内的网站（通过 pid 判断）

**实现空方法：**

- `deleteGridItems(ids)` - 删除项目，更新 items/orders，文件夹删除时子项移到根级别
- `moveGridItemToFolder(id, pid)` - 从顶层移入文件夹
- `moveGridItemOutOfFolder(id, position)` - 从文件夹移出到顶层（接受位置参数）
- `reorder(newOrder, pid)` - 重排序（pid=null 为顶层，否则为文件夹内）
- `batchUpdateGridPositions(updates)` - 批量更新位置（只更新数据库和 itemsMap）
- `batchMoveToFolder(ids, folderId)` - 批量移入文件夹

**新增方法：**

- `batchDeleteGridItems(ids)` - 可复用 `deleteGridItems`，或独立实现
- `updateFolderSize(id, size)` - 更新文件夹尺寸（需要同步到 gridstack）

### 2. [components/grid/grid-container.vue](components/grid/grid-container.vue)

**新增方法：**

```typescript
// 将已存在的网站添加到网格（用于移出文件夹场景）
function addExistingWidget(item: SiteItem): void
```

该方法不生成新 ID，使用现有 item 的 ID，获取位置后调用 store 的 `moveGridItemOutOfFolder(id, position)`

**新增方法：**

```typescript
// 更新文件夹 widget 的尺寸
function updateWidgetSize(id: string, size: GridSize): void
```

### 3. [components/site/site-item.vue](components/site/site-item.vue)

- 第133-137行：移出分组操作改为调用 `gridContainer.addExistingWidget(item)` 而非直接调用 store

### 4. [components/folder/folder-modal.vue](components/folder/folder-modal.vue)

- 第159-161行：移出分组操作改为调用 `gridContainer.addExistingWidget(item)` 而非直接调用 store

### 5. [components/folder/folder-edit.vue](components/folder/folder-edit.vue)

- 第148-151行：编辑文件夹尺寸时调用 `gridContainer.updateWidgetSize` 同步到 gridstack

### 6. [components/folder/folder-item.vue](components/folder/folder-item.vue)

- 第123-130行：调整尺寸也需要同步到 gridstack

## 视图更新触发分析

| 方法 | 更新 items | 更新 orders | 需要 gridstack |

| ------------------------ | ---------- | ----------- | ---------------- |

| addGridItem | Yes | Yes | Yes（调用前） |

| updateGridItem | Yes | No | No |

| deleteGridItems | Yes | Yes | 可能（子项移出） |

| moveGridItemToFolder | Yes | Yes | No |

| moveGridItemOutOfFolder | Yes | Yes | Yes（调用前） |

| reorder | No | Yes | No |

| batchUpdateGridPositions | No | No | No |

| batchMoveToFolder | Yes | Yes | No |

| updateFolderSize | Yes | No | Yes |

## 注意事项

- 所有涉及 `items` 数组重新赋值的操作都会触发 Vue 响应式更新
- `orders` 变更会自动持久化到 localStorage（已有 watch）
- 数据库操作使用 Dexie.js 的 `db.gridItems` 进行增删改查

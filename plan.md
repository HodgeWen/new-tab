# 重构

对数据持久化和兼容性进行重构。

## 原则

- **不要考虑数据兼容性，直接进行破坏性的更改**。所有的功能目前都是试验性的！

## 阶段 1

使用 indexedDB + localStorage 进行数据持久化。

具体为：

- gridItems(即此前的 bookmarks)、favicons、 wallpapers 使用 indexedDB(dexie)，settings 使用 localStorage, 移除 webdav(因为 setting 已经包含)
- 更改 gridItems 表的结构（已经在代码中更改了，此前是单条数据）
- 删除`ui`store, 这些相关的状态放在组件内部中去实现

### gridItems 优化

为了优化操作性能和简化交互效果，我们需要增加一个 orders 配置存放在 localStorage 中，具体结构示例如下：

```ts
const orders = [
  // 表示一个文件夹
  ['id1', ['id2', 'id3']],
  // 表示一个网站或者一个应用, 第一个
  ['id4', []]
]
```

这个对象也要放到 store 中去

当在页面上操作 gridItems 时，实际上操作的是`orders`对象。当操作完成时根据 `orders` 对象批量更新 gridItems 表(更新 order 字段)

## 阶段 2

增强 `FoldCard` 组件，直接可以在预览时点击文件夹的图标，点击标题区域才打开文件夹！

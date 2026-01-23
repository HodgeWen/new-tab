## ADDED Requirements

### Requirement: Settings Store 简化接口

系统 SHALL 提供简化的 Settings Store，只暴露 `settings` 响应式属性。

Settings Store SHALL：
- 在 store 创建时自动从 localStorage 加载设置
- 使用 `watch` 深度监听 `settings` 变化，自动同步到 localStorage
- 不暴露 `loadSettings`、`loading`、`saveSettings` 等内部方法
- 不暴露 `toggleSearchBar`、`updateSettings`、`updateWallpaperSettings`、`updateWebDAVSettings` 等更新方法

```typescript
// 新接口
const store = useSettingsStore()
// 直接修改即可，自动保存
store.settings.showSearchBar = true
store.settings.wallpaper.enabled = false
```

#### Scenario: 自动初始化
- **WHEN** 首次访问 `useSettingsStore()`
- **THEN** 自动从 localStorage 加载设置
- **AND** 与默认值深度合并

#### Scenario: 自动持久化
- **WHEN** 修改 `settings` 的任意属性
- **THEN** 自动将整个 `settings` 对象保存到 localStorage
- **AND** 无需手动调用保存方法

### Requirement: Favicon 服务简化

系统 SHALL 简化 Favicon 服务，移除缓存逻辑。

Favicon 服务 SHALL：
- 提供 `getFaviconUrl(url, size?)` 方法返回 Google Favicon Service URL
- 提供 `generateDefaultIcon(title)` 方法生成基于标题的 SVG 图标
- 不再提供缓存相关方法（`getFaviconWithCache`、`fetchAndCacheFavicon`）

#### Scenario: 获取 favicon URL
- **WHEN** 调用 `getFaviconUrl('https://example.com')`
- **THEN** 返回 `https://www.google.com/s2/favicons?domain=example.com&sz=64`

#### Scenario: 生成默认图标
- **WHEN** 调用 `generateDefaultIcon('Example')`
- **THEN** 返回包含首字母 "E" 的 SVG data URL

### Requirement: Grid-items Store 简化嵌套逻辑

系统 SHALL 简化 Grid-items Store，移除不必要的文件夹嵌套逻辑。

Grid-items Store SHALL：
- 只允许 `SiteItem` 移入文件夹
- `FolderItem` 始终在根级别，不支持 `pid`
- `addFolder` 方法不接受 `pid` 参数
- `moveGridItem` 和 `batchMoveToFolder` 对文件夹类型进行校验

#### Scenario: 添加文件夹
- **WHEN** 调用 `addFolder({ title, position })`
- **THEN** 文件夹添加到根级别
- **AND** `pid` 始终为 `null`

#### Scenario: 移动网站到文件夹
- **WHEN** 调用 `moveGridItem(siteId, folderId, index)`
- **THEN** 网站移动到指定文件夹的指定位置

#### Scenario: 拒绝移动文件夹
- **WHEN** 调用 `moveGridItem(folderId, targetFolderId, index)` 尝试将文件夹移入另一个文件夹
- **THEN** 操作被忽略或拒绝
- **AND** 文件夹保持在原位置

## REMOVED Requirements

### Requirement: Favicons 数据表

**Reason**: favicon 已存储在 `SiteItem.favicon` 字段，单独的缓存表造成数据冗余。
**Migration**: 
- 移除 `services/database.ts` 中的 `FaviconRecord` 接口和 `favicons` 表定义
- 移除 `getFavicon`/`saveFavicon` 方法
- 直接使用 Google Favicon Service URL

### Requirement: Settings Store 更新方法

**Reason**: 使用 `watch` 自动持久化后，不再需要手动调用更新方法。
**Migration**:
- 移除 `loadSettings` - 改为 store 内部自动调用
- 移除 `saveSettings` - 改为 `watch` 自动保存
- 移除 `toggleSearchBar` - 直接修改 `settings.showSearchBar`
- 移除 `updateSettings` - 直接修改 `settings` 属性
- 移除 `updateWallpaperSettings` - 直接修改 `settings.wallpaper`
- 移除 `updateWebDAVSettings` - 直接修改 `settings.webdav`
- 移除 `loading` - 初始化是同步的，无需 loading 状态

### Requirement: 文件夹嵌套支持

**Reason**: 实际业务中文件夹不支持嵌套，相关代码是冗余的容错逻辑。
**Migration**:
- 移除 `addFolder` 中的 `pid` 参数处理
- 移除 `moveGridItem` 中对文件夹移入文件夹的支持
- 简化 `orders` 同步逻辑

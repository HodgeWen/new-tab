# Requirements: New Tab v1.2.0

**Defined:** 2026-02-19
**Core Value:** 打开新标签页即刻拥有一个美观、快速、可自定义的个人导航面板

## v1.2.0 Requirements

全面优化 UI 视觉和交互体验，重构冗余代码，提升代码质量和可维护性。

### 视觉打磨 (Visual Style)

- [x] **VSTL-01**: 所有组件中的硬编码 rgba 颜色值替换为 CSS 变量（Modal overlay、ContextMenuItem 等）
- [x] **VSTL-02**: 所有组件中的硬编码像素间距（gap/padding/margin）替换为 --spacing-* CSS 变量
- [x] **VSTL-03**: 所有组件中的硬编码字号替换为 --text-* CSS 变量或新增适当 token
- [x] **VSTL-04**: 新增必要的 CSS 设计 token（如 --size-icon-sm/md/lg）覆盖常见尺寸场景
- [x] **VSTL-05**: 清理 grid-layout.vue 中注释掉的死样式代码

### 网格布局 (Grid Layout)

- [x] **GRID-01**: GridStack 硬编码配置值（cellHeight: 64, margin: 4, columnWidth: 60）提取为命名常量或 CSS 变量
- [ ] **GRID-02**: use-grid-stack.tsx 中的 renderCB 全局副作用移入 composable 初始化流程
- [ ] **GRID-03**: use-grid-stack.tsx 拆分为核心网格管理和渲染逻辑两个模块（~288 行 → 各 ~150 行）
- [ ] **GRID-04**: 拖拽停止时的排序操作添加必要的性能保护（避免频繁触发）

### 文件夹 (Folder)

- [x] **FLDR-01**: folder-item.vue 中所有硬编码样式值（gap/padding/font-size）替换为 CSS 变量
- [x] **FLDR-02**: folder-view.vue 中硬编码尺寸（80px/60px/10px）替换为 CSS 变量或提取为配置常量
- [ ] **FLDR-03**: folder-view.vue 中 FolderItemUI 类型断言改为类型安全的方式
- [ ] **FLDR-04**: 提取文件夹预览网格展示逻辑为 FolderPreview 子组件

### 基础组件 (Components)

- [x] **COMP-01**: Modal 组件硬编码 rgba 背景色、max-height/max-width 替换为 CSS 变量
- [x] **COMP-02**: ContextMenu 组件硬编码尺寸和颜色（min-width、padding、#ffffff）替换为 CSS 变量
- [x] **COMP-03**: Button 和 Input 组件中硬编码像素值统一为 CSS 变量
- [ ] **COMP-04**: Select 组件 Option.value 的 any 类型改为泛型参数

### TypeScript 类型安全 (Type Safety)

- [ ] **TYPE-01**: ContextMenu 组件的 context?: any 改为泛型类型参数
- [ ] **TYPE-02**: 创建 isSiteItem / isFolderItem 类型守卫函数，替代散落的 as 断言
- [ ] **TYPE-03**: wallpaper-providers.ts 中 Bing API 响应定义正式接口替代 any[]
- [ ] **TYPE-04**: use-grid-stack.tsx 中的类型断言（as HTMLElement、as string[]）通过更好的类型推导消除

### 代码重构 (Refactoring)

- [ ] **RFAC-01**: site-modal.vue 中图标获取/生成逻辑提取为 use-site-icon composable（~488 行大组件瘦身）
- [ ] **RFAC-02**: use-wallpaper.ts 拆分为状态管理和获取逻辑两个模块（~171 行）
- [ ] **RFAC-03**: site-item.vue 中文件夹过滤逻辑提取为共享 computed 或 store 方法
- [ ] **RFAC-04**: hooks/ 目录重命名为 composables/ 对齐 Vue 社区约定
- [ ] **RFAC-05**: use-modal.ts 中 @cat-kit/core 依赖替换为原生深拷贝实现

## Future Requirements

_(本里程碑为纯优化，无延迟功能)_

## Out of Scope

| Feature | Reason |
|---------|--------|
| 新增功能或 Widget | 本里程碑为纯优化/重构 |
| WebDAV 同步实现 | 已在 v1.1.0 显式排除，独立里程碑处理 |
| 自动化测试 | 测试在后续里程碑加入 |
| 性能基准测试 | 本轮聚焦代码质量，性能问题按需修复 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VSTL-01 | Phase 7 | Complete |
| VSTL-02 | Phase 7 | Complete |
| VSTL-03 | Phase 7 | Complete |
| VSTL-04 | Phase 7 | Complete |
| VSTL-05 | Phase 7 | Complete |
| GRID-01 | Phase 7 | Complete |
| GRID-02 | Phase 9 | Pending |
| GRID-03 | Phase 9 | Pending |
| GRID-04 | Phase 9 | Pending |
| FLDR-01 | Phase 7 | Complete |
| FLDR-02 | Phase 7 | Complete |
| FLDR-03 | Phase 8 | Pending |
| FLDR-04 | Phase 9 | Pending |
| COMP-01 | Phase 7 | Complete |
| COMP-02 | Phase 7 | Complete |
| COMP-03 | Phase 7 | Complete |
| COMP-04 | Phase 8 | Pending |
| TYPE-01 | Phase 8 | Pending |
| TYPE-02 | Phase 8 | Pending |
| TYPE-03 | Phase 8 | Pending |
| TYPE-04 | Phase 8 | Pending |
| RFAC-01 | Phase 10 | Pending |
| RFAC-02 | Phase 10 | Pending |
| RFAC-03 | Phase 10 | Pending |
| RFAC-04 | Phase 10 | Pending |
| RFAC-05 | Phase 10 | Pending |

**Coverage:**
- v1.2.0 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 — traceability filled by roadmap creation*

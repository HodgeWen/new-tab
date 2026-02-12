# Requirements: New Tab

**Defined:** 2025-02-12
**Core Value:** 打开新标签页即刻拥有一个美观、快速、可自定义的个人导航面板

## v1 Requirements

Requirements for Chrome Web Store initial release. Each maps to roadmap phases.

### Policy Compliance

- [ ] **PLCY-01**: 搜索栏使用 `chrome.search.query()` API 替代硬编码 Google URL 跳转，遵循 Chrome 商店 NTP 政策
- [ ] **PLCY-02**: 站点链接的 href 属性验证 URL scheme，仅允许 `http:` / `https:` 协议，拦截 `javascript:` 等危险协议

### Bug Fixes

- [ ] **BUGF-01**: 修复 `setting-modal.vue` 中从 `#imports` 导入 `computed` 的问题（WXT 专有别名在独立 Vite 模式下不可用）
- [ ] **BUGF-02**: 修复 `utils/backup.ts` 中 `importBackupData` 的 `JSON.parse` 未被 try/catch 包裹导致畸形 JSON 抛出未处理异常
- [ ] **BUGF-03**: 移除 `use-grid-stack.tsx` 中空的 `resizecontent` 事件处理器（死代码）
- [ ] **BUGF-04**: 添加 Vite 开发代理（`server.proxy`）解决 `dev:web` 模式下 Bing/Picsum 壁纸 API 的 CORS 问题

### Backup & Data Integrity

- [ ] **BKUP-01**: 备份导出数据包含 grid order（当前仅导出 IndexedDB 中的 grid items，遗漏 localStorage 中的排序信息）
- [ ] **BKUP-02**: 备份导入前验证数据 schema（检查必要字段、类型，防止畸形数据污染 IndexedDB）

### UI Polish

- [ ] **UIPL-01**: `setting-modal.vue` 中硬编码的 `rgba(0, 0, 0, 0.05)` 替换为 CSS 变量（`var(--glass-bg)` 或等效 token）
- [ ] **UIPL-02**: WebDAV 同步区域标记为"即将推出"，禁用输入框，添加说明文字

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Cloud Sync

- **SYNC-01**: 实现 WebDAV 数据同步（利用已有的 `webdav` 依赖和设置 UI）
- **SYNC-02**: 增量同步策略（避免全量覆盖导致数据丢失）

### Enhanced Features

- **FEAT-01**: 右键菜单"保存当前页面到新标签页"功能
- **FEAT-02**: 搜索引擎可切换（Google/Bing/Baidu）
- **FEAT-03**: 键盘快捷键导航（`/` 聚焦搜索、Tab 导航项目）

## Out of Scope

| Feature | Reason |
|---------|--------|
| 存储层迁移（localStorage → IndexedDB 统一） | v1 范围控制，当前双存储对用户无感知影响 |
| 自动化测试（Vitest + Playwright） | v1 聚焦功能稳定，测试在后续里程碑加入 |
| 天气、待办、笔记等 widget | 保持单一用途，避免 Chrome 商店审核风险 |
| AI 聊天/搜索功能 | 偏离核心定位，增加维护负担 |
| 移动端适配 | Chrome 扩展仅桌面环境 |
| 多语言国际化 | v1 仅中文 UI |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLCY-01 | — | Pending |
| PLCY-02 | — | Pending |
| BUGF-01 | — | Pending |
| BUGF-02 | — | Pending |
| BUGF-03 | — | Pending |
| BUGF-04 | — | Pending |
| BKUP-01 | — | Pending |
| BKUP-02 | — | Pending |
| UIPL-01 | — | Pending |
| UIPL-02 | — | Pending |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 0
- Unmapped: 10 ⚠️

---
*Requirements defined: 2025-02-12*
*Last updated: 2025-02-12 after initial definition*

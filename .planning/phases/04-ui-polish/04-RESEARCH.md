# Phase 4: UI Polish - Research

**Researched:** 2026-02-12  
**Domain:** Settings modal design system compliance, WebDAV placeholder UI  
**Confidence:** HIGH

## Summary

Phase 4 聚焦设置模态框与 WebDAV 区域的 UI 抛光，使两者符合项目设计系统（AGENTS.md）。核心变更仅涉及 `setting-modal.vue` 一个文件：将两处硬编码的 `rgba(0, 0, 0, 0.05)` 替换为 CSS 变量 `var(--glass-bg)`，并对 WebDAV 区域添加「即将推出」标记、禁用输入框与简短说明。

**Primary recommendation:** 在 `setting-modal.vue` 中完成两项变更：样式替换（UIPL-01）与 WebDAV 占位 UI（UIPL-02），无需引入新依赖或修改其他组件。

---

## User Constraints (from project state)

### Locked Decisions
- v1 不实现 WebDAV 同步，保留 UI 占位并标记「即将推出」
- 本阶段聚焦 UI 抛光，不做同步逻辑落地

### Claude's Discretion
- 「即将推出」的视觉呈现方式（徽章 / 标题旁文案 / 说明区）
- 说明文字的具体措辞

### Deferred Ideas (OUT OF SCOPE)
- WebDAV 同步逻辑实现
- 其他组件（modal.vue、input.vue、select.vue 等）中的硬编码 rgba 替换

---

## 现状盘点

### 1. 硬编码 rgba（UIPL-01）

`setting-modal.vue` 中有两处使用 `rgba(0, 0, 0, 0.05)` 作为嵌套区域背景：

| 位置 | 类名 | 行号 | 用途 |
|------|------|------|------|
| 壁纸子设置 | `.sub-settings` | 145 | 壁纸源、切换间隔的容器背景 |
| WebDAV 设置 | `.webdav-settings` | 155 | 服务器地址、用户名、密码的容器背景 |

两者均为嵌套在 `.setting-form` 内的独立区块，需要与主题系统一致。

### 2. WebDAV 区域现状（UIPL-02）

- **结构**：`section-header`（标题 + 描述）+ `webdav-settings`（三个 `n-input`）
- **标题**：WebDAV 同步
- **描述**：配置 WebDAV 以同步你的数据
- **输入**：服务器地址、用户名、密码，均可用，无 `disabled`
- **保存逻辑**：`handleSave` 会 `Object.assign(setting, formData)`，包含 webdav 对象（当前为空）

### 3. 可用设计令牌

`variables.css` 中与背景相关：

- `--glass-bg`：默认 `rgba(255, 255, 255, 0.08)`，随 `data-theme` 变化
- `--glass-bg-hover`、`--glass-bg-active`
- `--text-muted`、`--text-secondary`：适用于说明文字

`utilities.css` 中 `.glass`、`.glass-subtle` 使用 `var(--glass-bg)`，可作为参考。

### 4. 组件能力

- `NInput` 支持 `disabled` prop（input.vue 第 10、84 行）
- `NSelect` 支持 `disabled`（本阶段不涉及）
- 无现成「即将推出」组件，需在模板中新增文案与样式

---

## 受影响文件

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `components/setting-modal/setting-modal.vue` | 修改 | 唯一需改动的文件 |

**不改动：**
- `entrypoints/newtab/styles/variables.css` — 无需新增变量
- `components/input/input.vue` — 已有 `disabled`，无需修改
- `components/modal/modal.vue` — 不在 Phase 4 范围

---

## 可行实现路径

### Path A（推荐）：最小改动

1. **UIPL-01**：将 `.sub-settings`、`.webdav-settings` 的 `background: rgba(0, 0, 0, 0.05)` 替换为 `background: var(--glass-bg)`，符合 REQUIREMENTS 中「`var(--glass-bg)` 或等效 token」。

2. **UIPL-02**：
   - 在 `section-header` 中增加「即将推出」文案（如标题旁或描述区）
   - 三个 `n-input` 添加 `:disabled="true"`（或 `disabled`）
   - 将 `section-desc` 改为「即将推出，敬请期待」或类似说明

### Path B：更显眼的「即将推出」

- 在 `section-header` 旁增加带 `--color-warning-subtle` 或 `--text-muted` 的徽章
- 使用 `lucide-vue-next` 的 `Clock` 图标增强视觉提示

### 实现顺序建议

1. 先完成 UIPL-01（样式替换），验证主题切换正常
2. 再完成 UIPL-02（WebDAV 占位 UI），验证禁用与文案显示

---

## 风险与回归点

| 风险 | 可能性 | 影响 | 缓解 |
|------|--------|------|------|
| `--glass-bg` 在浅色壁纸主题下视觉过亮 | 低 | 嵌套区域与主背景对比减弱 | 保持与主模态一致；若不适可后续引入 `--glass-bg-subtle` |
| 禁用输入后 `formData.webdav` 仍被保存 | 低 | 用户无法编辑，值恒为空，无实际影响 | 可不改保存逻辑；若需更严谨可过滤 webdav |
| 漏改其他硬编码 | 低 | 不符合设计系统 | 限定 Phase 4 为 setting-modal.vue，不扩散范围 |

| 回归点 | 检查项 |
|--------|--------|
| 壁纸子设置展开 | 启用壁纸后，`.sub-settings` 显示正常，背景使用 CSS 变量 |
| 主题切换 | `data-theme` 切换时，子区域背景随主题变化 |
| WebDAV 区域 | 输入不可编辑，说明与「即将推出」可见 |
| 保存设置 | 搜索栏、壁纸等设置仍可正常保存 |

---

## 验证建议

### UIPL-01 验证

1. 在 `setting-modal.vue` 中搜索 `rgba(`，应无匹配
2. 启用壁纸，展开子设置，确认背景与主模态风格一致
3. 切换 `data-theme`（如 dark-wallpaper / light-wallpaper），确认子区域背景正确跟随

### UIPL-02 验证

1. 打开设置模态，WebDAV 区域可见「即将推出」
2. 三个输入框呈禁用态（不可聚焦、不可输入）
3. 说明文字清晰，无歧义

### 自动化（可选）

- 若引入 E2E：断言 `.webdav-settings input` 具有 `disabled` 属性
- 样式回归：可考虑对 setting-modal 做视觉快照（非 Phase 4 必需）

---

## 范围边界

**In scope**

- `setting-modal.vue` 中两处 `rgba(0, 0, 0, 0.05)` → CSS 变量
- WebDAV 区域的「即将推出」、禁用输入、说明文字

**Out of scope**

- WebDAV 同步逻辑
- `modal.vue`、`input.vue`、`select.vue` 等组件中的硬编码 rgba
- 新增 CSS 变量（如 `--glass-bg-subtle`）
- 新增「即将推出」通用组件

---

## Architecture Patterns

### 样式替换模式

```css
/* Before */
.sub-settings,
.webdav-settings {
  background: rgba(0, 0, 0, 0.05);
  /* ... */
}

/* After */
.sub-settings,
.webdav-settings {
  background: var(--glass-bg);
  /* ... */
}
```

### 禁用输入模式

```vue
<n-input
  v-model="formData.webdav.url"
  placeholder="https://dav.example.com"
  disabled
/>
```

（`disabled` 为 boolean，可直接写 `disabled` 或 `:disabled="true"`）

---

## Don't Hand-Roll

| 问题 | 不要做 | 应使用 | 原因 |
|------|--------|--------|------|
| 嵌套背景色 | 自定义 rgba | `var(--glass-bg)` | 主题适配、符合 AGENTS.md |
| 禁用输入 | 自定义 pointer-events | `NInput` 的 `disabled` | 已有实现，语义正确 |
| 说明文字样式 | 硬编码颜色 | `--text-muted` / `--text-secondary` | 设计系统一致性 |

---

## Common Pitfalls

### 1. 禁用写法不一致

**问题**：`disabled="disabled"` 与 `:disabled="true"` 混用  
**建议**：统一使用 `disabled`（Vue 会解析为 true）

### 2. 遗漏 sub-settings

**问题**：只改 `.webdav-settings`，忽略 `.sub-settings`  
**建议**：两处背景同源，可合并选择器或分别替换

### 3. 过度设计「即将推出」

**问题**：引入新组件、动画或复杂布局  
**建议**：保持简洁，文案 + 禁用即可满足需求

---

## Sources

### Primary (HIGH confidence)
- `components/setting-modal/setting-modal.vue` — 完整源码审查
- `entrypoints/newtab/styles/variables.css` — 设计令牌
- `.planning/REQUIREMENTS.md` — UIPL-01、UIPL-02 定义
- `AGENTS.md` — 主题系统与组件规范

### Secondary (MEDIUM confidence)
- `components/input/input.vue` — `disabled` 使用方式
- `.planning/STATE.md`、`.planning/ROADMAP.md` — 已决策与成功标准

---

## Metadata

**Confidence breakdown:**
- 现状盘点: HIGH — 源码与需求直接对应
- 实现路径: HIGH — 单文件、无新依赖
- 风险与回归: MEDIUM — 基于经验，浅色主题下需人工确认

**Research date:** 2026-02-12  
**Valid until:** 30 days（主题系统稳定）

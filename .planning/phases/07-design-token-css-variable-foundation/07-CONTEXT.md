# Phase 7: Design Token & CSS Variable Foundation - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

将代码库中所有硬编码的视觉值（颜色、间距、字号、尺寸）替换为 design token / CSS 变量，使整个项目使用统一的视觉语言。同时将 GridStack 配置中的 magic number 提取为命名常量，清理 grid-layout.vue 及其他文件中的死代码。

</domain>

<decisions>
## Implementation Decisions

### 值的合并策略
- **间距：** Claude 自行判断——明显接近的值合并到现有 spacing scale（xs=4, sm=8, md=16...），差异较大的保留为独立 token
- **颜色：** 保留分开——每个不同的 rgba/hex 值对应一个独立 token，不合并相近透明度
- **字号：** 就近对齐到现有 scale（--text-caption 12px / --text-body 14px / --text-title 18px），不新增字号 token
- **特殊值：** 仅出现一次且不符合全局 scale 的值，创建组件级别的局部 token（如 --modal-header-height），语义化命名

### 新增 token 范围与命名
- **图标尺寸：** --size-icon-sm: 16px, --size-icon-md: 20px, --size-icon-lg: 24px
- **组件高度：** 为常见表单组件和按钮定义高度 token（如 --size-input-height, --size-button-height）；宽度不定义 token（大部分宽度自适应），Modal 等特殊组件的宽度在代码中硬编码自定义
- **命名风格：** 语义化命名——描述用途而非描述值（如 --size-icon-sm 而非 --size-16）
- **z-index：** 不纳入 token 体系，不在本阶段范围内

### GridStack 常量设计
- **形式：** 纯 JS/TS 常量，不用 CSS 变量（GridStack API 消费的是 JS 值）
- **位置：** 就放在 use-grid-stack 组合式文件顶部
- **命名：** SCREAMING_SNAKE_CASE（如 GRID_CELL_HEIGHT, GRID_MARGIN）
- **响应式：** 固定值，不做响应式适配

### 死代码清理
- **范围：** 顺便清理——token 化过程中碰到的死代码一并处理，不仅限于 grid-layout.vue
- **定义：** 注释代码块 + 未使用的 CSS 规则（无匹配的选择器）
- **未使用变量：** 清理 variables.css 中已定义但从未被引用的 CSS 变量
- **样式重构：** 允许小幅优化——明显的冗余（重复声明、不必要嵌套）可以顺手清理，但不改结构

### Claude's Discretion
- 间距合并的具体阈值判断（哪些算"明显接近"）
- 组件高度 token 的具体数值（根据代码中实际使用的值来定）
- 沿用现有 variables.css 中的分类组织方式

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-design-token-css-variable-foundation*
*Context gathered: 2026-02-19*

# Design: shadcn-vue + Tailwind CSS 4 UI 重构技术决策

## Context

当前项目使用 UnoCSS + 自定义 shortcuts 实现 Glassmorphism 风格。为了与 shadcn-vue 原生样式体系完全兼容，决定将 UnoCSS 替换为 Tailwind CSS 4，并使用 `@theme` 重新实现玻璃效果样式。

### 利益相关者

- 用户：期望视觉和交互体验保持一致
- 开发者：期望组件更易维护和扩展

### 约束

- 必须保持 Glassmorphism 视觉风格
- 不能改动业务逻辑（stores/services）
- 完全使用 Tailwind CSS 4，不保留 UnoCSS

## Goals / Non-Goals

### Goals

- 统一组件结构与交互模式
- 提升可访问性（keyboard、ARIA）
- 减少自定义样式代码
- 保持 Glassmorphism 视觉一致性

### Non-Goals

- 不重做业务组件结构
- 不更改数据模型
- 不引入新的交互流程
- 不改变用户行为习惯

## Decisions

### 1. 组件库选择：shadcn-vue

**决策**: 使用 shadcn-vue（最新版）作为基础组件层

**理由**:

- 无运行时依赖，组件代码直接复制到项目中，便于定制
- 基于 Reka UI（2025 年 2 月起替代 Radix Vue），提供完善的可访问性支持
- 与 Tailwind/UnoCSS 样式体系兼容
- 社区活跃，文档完善

**备选方案**:

- shadcn-vue@radix：基于 Radix Vue 的旧版本
- Naive UI：功能丰富但样式定制困难
- PrimeVue：组件完整但包体积大
- 纯手写：当前方案，维护成本高

### 2. 样式系统：UnoCSS → Tailwind CSS 4

**决策**: 完全移除 UnoCSS，使用 Tailwind CSS 4 重新实现样式

**理由**:

- shadcn-vue 原生基于 Tailwind CSS，兼容性最佳
- Tailwind CSS 4 的 `@theme` 提供更强大的主题定制能力
- 避免 UnoCSS 与 Tailwind 类名冲突
- Tailwind CSS 4 使用 Vite 插件，性能更优

**实现方式**:

```css
/* assets/styles/main.css */
@import 'tailwindcss';

@theme {
  /* Glassmorphism 颜色变量 */
  --color-glass-bg: rgba(255, 255, 255, 0.15);
  --color-glass-border: rgba(255, 255, 255, 0.2);
  --color-glass-text: rgba(255, 255, 255, 0.9);

  /* 模糊效果 */
  --blur-glass: 24px;
}
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss()
    // ...
  ]
})
```

### 3. Glassmorphism 样式实现

**决策**: 使用 Tailwind CSS 4 自定义工具类实现玻璃效果

**实现方式**:

```css
/* assets/styles/components.css */
@layer components {
  .glass {
    @apply bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg;
  }

  .glass-hover {
    @apply hover:bg-white/25 hover:border-white/30 transition-all duration-200;
  }

  .glass-dark {
    @apply bg-black/20 backdrop-blur-xl border border-white/10;
  }

  .glass-input {
    @apply bg-white/10 border-white/10 focus:ring-2 focus:ring-white/20 placeholder:text-white/40;
  }
}
```

### 3. z-index 层级体系

**决策**: 建立统一的 z-index 层级表

**理由**:

- 当前组件使用硬编码 z-50，可能产生层叠冲突
- shadcn 组件默认使用 Teleport，需要统一管理

**层级表**:

```
z-10: 编辑模式工具栏
z-20: 固定元素（搜索栏等）
z-40: 下拉菜单、Tooltip
z-50: Modal / Dialog / Sheet
z-60: ContextMenu
z-70: Toast / Notification
```

### 4. 迁移顺序策略：由内而外

**决策**: 先迁移基础组件，再迁移复合组件

**理由**:

- 基础组件（Button、Input）变更影响范围小
- 可以逐步验证样式兼容性
- 复合组件（Dialog、ContextMenu）依赖基础组件

**顺序**:

1. Button、Input、Separator、ScrollArea（基础）
2. Select、Switch、Tabs（表单控件）
3. Dialog / Sheet（弹层）
4. ContextMenu、DropdownMenu（菜单）
5. 业务组件统一清理

### 5. Teleport 目标管理

**决策**: 统一使用 `body` 作为 Teleport 目标

**理由**:

- 当前组件已使用 `<Teleport to="body">`
- shadcn 组件（基于 Reka UI）默认行为一致
- 简化层级管理

### 6. 目录结构

**决策**: shadcn 组件放置在 `shadcn/` 目录下

**理由**:

- 项目已有 `components/` 目录存放业务组件
- 分离 shadcn 基础组件与业务组件，职责清晰
- 便于 shadcn CLI 管理和更新

**目录结构**:

```
shadcn/
├── ui/
│   ├── button/
│   │   └── Button.vue
│   ├── input/
│   │   └── Input.vue
│   ├── dialog/
│   │   ├── Dialog.vue
│   │   ├── DialogContent.vue
│   │   └── index.ts
│   └── ...
└── lib/
    └── utils.ts        # cn 工具函数
```

## Risks / Trade-offs

### 风险 1：样式迁移遗漏

- **描述**: UnoCSS 类名与 Tailwind CSS 存在差异，可能遗漏某些样式
- **影响**: 中等
- **缓解**: 逐组件对比检查，建立类名映射表

### 风险 2：交互回归

- **描述**: 拖拽、快捷键、右键菜单等交互可能受影响
- **影响**: 高
- **缓解**: 每个阶段完成后进行交互回归测试

### 风险 3：包体积增加

- **描述**: 引入 Reka UI 可能增加 bundle size
- **影响**: 低
- **缓解**: 按需引入组件，tree-shaking 移除未使用代码

### Trade-offs

| 方面       | 当前方案       | shadcn-vue   |
| ---------- | -------------- | ------------ |
| 定制灵活性 | 高（完全控制） | 中（需覆盖） |
| 可维护性   | 低（手写逻辑） | 高（标准化） |
| 可访问性   | 低（缺失）     | 高（内置）   |
| 学习成本   | 低（熟悉代码） | 中（新 API） |

## Migration Plan

### 阶段划分

1. **基础设施搭建**（低风险）

   - 引入依赖
   - 配置 cn 工具
   - 建立样式覆盖体系

2. **基础组件迁移**（低风险）

   - Button、Input、Separator、ScrollArea
   - 在非关键区域试点

3. **表单组件迁移**（中风险）

   - Select、Switch、Tabs
   - SearchBar、SettingsPanel

4. **弹层组件迁移**（中风险）

   - Dialog / Sheet
   - AddSiteModal、AddFolderModal、FolderModal

5. **菜单组件迁移**（高风险）

   - ContextMenu、DropdownMenu
   - 需要仔细处理子菜单逻辑

6. **统一清理**（低风险）
   - 删除未使用样式
   - 统一 z-index
   - 可访问性检查

### Rollback

- 每个阶段独立提交，便于回滚
- 保留原组件代码直到新组件稳定
- 使用 feature flag 控制新旧组件切换（可选）

## Open Questions

1. **Dialog vs Sheet**: 设置面板是否改用 Sheet（侧边抽屉）？

   - 建议：保持 Dialog，视觉一致性更好

2. **动画过渡**: shadcn 默认动画与当前动画是否一致？

   - 建议：覆盖 Radix 动画 CSS，保持现有过渡效果

3. **主题切换**: 是否需要考虑未来的亮色主题支持？
   - 建议：当前不考虑，但样式结构应预留扩展空间

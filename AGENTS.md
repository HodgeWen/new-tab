# 项目代理指导 (Agent Guidelines)

本文档旨在为 AI 代理提供关于本项目的设计规范、代码风格及最佳实践的指导。

## 1. 前端样式规范 (Design System)

本项目核心设计语言为 **毛玻璃风格 (Glassmorphism)**。旨在打造简洁、现代且具有呼吸感的界面。

### 1.1 核心视觉特征 (Visual Identity)

所有 UI 组件（模态框、卡片、侧边栏等）应遵循以下视觉原则：

-   **背景模糊 (Background Blur)**: 使用 `backdrop-filter: blur()` 来模糊背景，创造层次感。
-   **半透明 (Translucency)**: 背景颜色应为半透明，允许底层内容隐约透出。
-   **微妙边框 (Subtle Borders)**: 使用半透明的白色边框（通常为 1px）来模拟玻璃边缘的高光。
-   **层级投影 (Layered Shadows)**: 使用柔和的阴影将元素与背景分离，增强悬浮感。
-   **圆角 (Rounded Corners)**: 使用较大的圆角（如 `16px` 或 `24px`）以匹配柔和的视觉感受。

### 1.2 CSS 实现参考 (Implementation Reference)

在编写样式时，请优先参考以下 CSS 模式：

```css
/* 基础玻璃形态混合宏 / Base Glass Mixin */
.glass-panel {
  /* 背景：低透明度的白色或深色，视主题而定 */
  background: rgba(255, 255, 255, 0.1); 
  
  /* 模糊：核心效果 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* 边框：模拟玻璃边缘高光 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  /* 阴影：增加深度 */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  
  /* 圆角 */
  border-radius: 16px;
}

/* 深色模式适配 / Dark Mode Adaptation */
@media (prefers-color-scheme: dark) {
  .glass-panel {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

### 1.3 交互细节 (Interaction)

-   **Hover 效果**: 鼠标悬停时，略微增加不透明度或亮色边框的不透明度，而非大幅改变颜色。
-   **Active 效果**: 点击时，轻微缩小（scale down）或加深背景色，模拟按压真实物体的触感。

### 1.4 排版与可读性 (Typography & Contrast)

-   由于背景多变，**文字颜色**必须保持高对比度。
-   标题通常使用高不透明度（如 `opacity: 0.9`），次要文字使用中等不透明度（如 `opacity: 0.7`）。
-   避免在模糊背景上使用极细的字体权重。

## 2. 组件开发指导 (Component Guidelines)

参考 `design.md` 中的组件定义。在新建组件时：
1.  优先复用现有的基础组件（Button, Input 等）。
2.  确保新组件默认具备 Glassmorphism 特征，或支持通过 props 开启。

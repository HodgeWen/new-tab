# 优化布局居中与响应式美化

## 补丁内容

1. **实现全屏居中布局**  
   在 `src/components/app.tsx` 中，为 `main` 容器添加 `mx-auto` 和 `items-center`，并将 `header` 设为 `text-center`，确保页面内容在各分辨率下均能水平居中，消除「不居中」的感官问题。同时提升标题字体大小以匹配 2026 年的主流审美。

2. **重构响应式网格系统**  
   在 `src/components/grid.tsx` 中，将最小列宽从 `7.5rem` (120px) 提升至 `160px`，使磁贴在大屏下分布更合理。为 `Grid` 容器增加 `max-w-7xl`、更柔和的背景色（`bg-secondary/20`）和更强的毛玻璃效果（`backdrop-blur-xl`）。

3. **视觉细节打磨**  
   - 为示例磁贴增加 `hover:scale-105` 动画和阴影悬浮效果。
   - 使用 `group-hover` 联动改变图标背景颜色和文字亮度，提升交互反馈。
   - 磁贴内部增加数字圆环，使「示例」展示更具设计感，不再单调。

## 影响范围

- 修改文件: `/src/components/app.tsx`、`/src/components/grid.tsx`

/** 开发期占位：展示响应式 auto-fill 网格；接入真实数据后可删除 */
const DEMO_SLOT_COUNT = 12;

export function Grid() {
  return (
    <div
      class="grid min-h-[50vh] w-full max-w-6xl grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-spacing-md rounded-lg border border-foreground/10 bg-primary/35 p-spacing-lg shadow-md backdrop-blur-md transition-shadow duration-200 sm:gap-spacing-lg sm:p-spacing-xl"
      role="region"
      aria-label="网站快捷方式网格"
    >
      {Array.from({ length: DEMO_SLOT_COUNT }, (_, i) => (
        <div
          key={i}
          class="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-cta/40 bg-foreground/5 px-spacing-sm text-center shadow-sm"
        >
          <span class="text-[0.65rem] font-medium uppercase tracking-wider text-muted">
            示例
          </span>
          <span class="mt-spacing-xs font-display text-lg text-foreground">{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

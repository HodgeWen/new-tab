/** 开发期占位：展示响应式 auto-fill 网格；接入真实数据后可删除 */
const DEMO_SLOT_COUNT = 12;

export function Grid() {
  return (
    <div
      class="grid w-full max-w-7xl grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-md rounded-2xl border border-foreground/5 bg-secondary/20 p-lg shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-glow sm:gap-lg sm:p-xl"
      role="region"
      aria-label="网站快捷方式网格"
    >
      {Array.from({ length: DEMO_SLOT_COUNT }, (_, i) => (
        <div
          key={i}
          class="group flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-cta/30 bg-foreground/[0.03] p-2 text-center shadow-sm transition-all duration-200 hover:scale-105 hover:border-cta/60 hover:bg-foreground/[0.08]"
        >
          <div class="mb-1 flex size-8 items-center justify-center rounded-full bg-cta/10 text-cta group-hover:bg-cta/20">
            <span class="text-[10px] font-bold uppercase tracking-widest">{i + 1}</span>
          </div>
          <span class="text-[10px] font-medium uppercase tracking-widest text-muted group-hover:text-foreground">
            示例
          </span>
          <span class="mt-1 font-display text-xs text-foreground">
            Slot {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

import { Grid } from "@/components/grid";

export function App() {
  return (
    <div class="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        class="pointer-events-none absolute inset-0 bg-linear-to-br from-secondary/80 via-background to-primary/60"
      />
      <div
        aria-hidden
        class="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgb(34 197 94 / 0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgb(148 163 184 / 0.12), transparent 40%)",
        }}
      />
      <main class="relative z-10 flex min-h-screen flex-col px-spacing-md py-spacing-lg sm:px-spacing-lg sm:py-spacing-xl">
        <header class="mb-spacing-lg">
          <h1 class="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            新标签页
          </h1>
          <p class="mt-spacing-sm max-w-xl text-sm text-muted">
            下方网格含 12 个示例占位格（虚线边框），用于确认 CSS Grid
            的列数随窗口宽度变化；接入数据后将替换为真实快捷方式。
          </p>
        </header>
        <Grid />
      </main>
    </div>
  );
}

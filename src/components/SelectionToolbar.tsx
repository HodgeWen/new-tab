import {
  clearSelection,
  isSelectionMode,
  removeSelectedWebsites,
  selectAll,
  selectedWebsites,
} from "@/stores/websitesStore";

export function SelectionToolbar() {
  if (!isSelectionMode.value) return null;

  const count = selectedWebsites.value.size;

  const handleDelete = () => {
    if (confirm(`确定要删除选中的 ${count} 个快捷方式吗？`)) {
      removeSelectedWebsites();
    }
  };

  return (
    <div class="fixed bottom-lg left-1/2 z-40 flex -translate-x-1/2 items-center gap-md rounded-full border border-foreground/10 bg-background/90 px-6 py-3 shadow-2xl backdrop-blur-md transition-all">
      <span class="text-sm font-medium">已选择 {count} 项</span>

      <div class="h-4 w-px bg-foreground/20" />

      <button class="text-sm font-medium text-primary hover:underline" onClick={selectAll}>
        全选
      </button>

      <button
        class="text-sm font-medium text-destructive disabled:opacity-50 hover:underline disabled:hover:no-underline"
        onClick={handleDelete}
        disabled={count === 0}
      >
        删除
      </button>

      <button
        class="text-sm font-medium hover:underline disabled:opacity-50 disabled:hover:no-underline"
        onClick={() => {
          // TODO: implement move to group modal
          alert("移动到分组功能开发中");
        }}
        disabled={count === 0}
      >
        移动到分组...
      </button>

      <div class="h-4 w-px bg-foreground/20" />

      <button
        class="rounded-md bg-foreground/5 px-3 py-1.5 text-sm font-medium hover:bg-foreground/10"
        onClick={clearSelection}
      >
        取消
      </button>
    </div>
  );
}

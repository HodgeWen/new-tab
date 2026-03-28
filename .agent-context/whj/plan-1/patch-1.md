# 修复 WXT dev 脚本与网格可见示例

## 补丁内容

1. **修复 `bun run dev` 失败**  
   WXT 0.20 默认命令为 `wxt [root]`（启动开发服务器），不存在 `dev` 子命令。原脚本 `wxt dev` 将字符串 `dev` 解析为项目根目录，导致在 `dev/entrypoints` 查找入口并报错。已将 `package.json` 中 `dev` 改为 `wxt`。

2. **基础布局网格可感知**  
   `Grid` 内增加 12 个带虚线边框的「示例」占位格，使用与正式布局相同的 `grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))]`，便于肉眼确认响应式列数；`App` 文案说明占位用途。`AGENTS.md` 补充上述 CLI 陷阱，避免再次写错脚本。

## 影响范围

- 修改文件: `/package.json`、`/src/components/grid.tsx`、`/src/components/app.tsx`、`/AGENTS.md`
- 上下文: `/.agent-context/whj/plan-1/plan.md`、`/.agent-context/whj/plan-1/patch-1.md`

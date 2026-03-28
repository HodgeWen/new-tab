import tailwindcss from "@tailwindcss/vite";
import preact from "@preact/preset-vite";
import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  browser: "chrome",
  manifest: {
    name: "新标签页",
    description: "网站快捷方式、分组文件夹、每日壁纸与个性化设置的 Chrome 新标签页。",
    permissions: ["storage"],
    icons: {
      16: "icons/icon16.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
  vite: () => ({
    plugins: [preact(), tailwindcss()],
  }),
  webExt: {
    startUrls: ["chrome://newtab/"],
  },
});

import path from "node:path";
import { fileURLToPath } from "node:url";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  root: path.resolve(rootDir, "src/entrypoints/newtab"),
  publicDir: path.resolve(rootDir, "public"),
  server: {
    port: 5173,
    open: false,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import styleImport, { AntdResolve } from "vite-plugin-style-import";

import { remarkCodeHike } from "@code-hike/mdx";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const mdx = await import("@mdx-js/rollup");
  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

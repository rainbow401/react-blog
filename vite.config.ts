import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import styleImport, { AntdResolve } from "vite-plugin-style-import";
// https://vitejs.dev/config/
export default defineConfig(async () => {
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

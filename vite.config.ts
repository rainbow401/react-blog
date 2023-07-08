import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import styleImport, { AntdResolve } from "vite-plugin-style-import";
// 在开发环境中的 vite.config.js 中配置代理
import { createProxyMiddleware } from 'http-proxy-middleware';

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
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8080', // 后端 API 地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '') // 不可以省略rewrite
        },
      },
    }
  };
});

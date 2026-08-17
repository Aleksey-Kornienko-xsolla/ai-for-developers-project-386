import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useMock = env.VITE_USE_MOCK !== "false";

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@mock": path.resolve(__dirname, "mock"),
      },
    },
    plugins: [
      react(),
      useMock &&
        mockDevServerPlugin({
          include: "mock/**/*.ts",
        }),
    ].filter(Boolean),
    server: {
      host: "127.0.0.1",
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET ?? "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: "127.0.0.1",
      port: 4173,
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET ?? "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  };
});
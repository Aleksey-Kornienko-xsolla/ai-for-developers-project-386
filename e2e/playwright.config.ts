import { defineConfig, devices } from "@playwright/test";

const BACKEND_URL = "http://127.0.0.1:8080";
const FRONTEND_URL = "http://127.0.0.1:4173";
const FRONTEND_DIR = "../frontend";
const BACKEND_DIR = "../backend";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node dist/server.js",
      cwd: BACKEND_DIR,
      env: {
        PORT: "8080",
        HOST: "127.0.0.1",
        NODE_ENV: "production",
      },
      url: `${BACKEND_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npx vite preview --port 4173 --host 127.0.0.1 --strictPort",
      cwd: FRONTEND_DIR,
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});

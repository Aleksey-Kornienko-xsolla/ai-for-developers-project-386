import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");
const FRONTEND_DIR = resolve(ROOT, "frontend");
const BACKEND_DIR = resolve(ROOT, "backend");

function run(cmd: string, cwd: string): void {
  execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env } });
}

export default async function globalSetup(): Promise<void> {
  const envContent = [
    "VITE_API_BASE_URL=",
    "VITE_USE_MOCK=false",
    "VITE_API_PROXY_TARGET=http://127.0.0.1:8080",
    "",
  ].join("\n");

  writeFileSync(resolve(FRONTEND_DIR, ".env"), envContent);

  run("npm install --no-audit --no-fund", BACKEND_DIR);
  run("npm run build", BACKEND_DIR);

  run("npm install --no-audit --no-fund", FRONTEND_DIR);
  run("npm run build", FRONTEND_DIR);
}

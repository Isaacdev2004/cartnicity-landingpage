import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const agent = process.env.npm_config_user_agent ?? "";

for (const lock of ["package-lock.json", "yarn.lock"]) {
  const p = path.join(root, lock);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

if (!/pnpm/i.test(agent)) {
  console.error("Use pnpm instead of npm or yarn for this workspace.");
  process.exit(1);
}

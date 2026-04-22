/**
 * Vite with base /get-started/ still emits a flat dist/public/ (index + assets/ + public copies).
 * Browsers request /get-started/assets/... so files must live under get-started/ on the host.
 * Run after vite build; skip when BASE_PATH is / or empty.
 * See: https://vitejs.dev/guide/build.html#public-base-path
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "..", "dist", "public");
const raw = (process.env.BASE_PATH ?? process.env.VITE_BASE_PATH ?? "").trim();

function normalizeToSegment(p) {
  if (!p || p === "/") return "";
  const s = p.replace(/^\/+/, "").replace(/\/+$/, "");
  return s.split("/").filter(Boolean)[0] ?? "";
}

const segment = normalizeToSegment(raw);
if (!segment) {
  console.log("[layout-subpath] No subpath in BASE_PATH; left flat (root deploy).");
  process.exit(0);
}

if (!fs.existsSync(outDir)) {
  console.warn("[layout-subpath] dist/public missing, skip.");
  process.exit(0);
}

const targetDir = path.join(outDir, segment);
if (fs.existsSync(path.join(targetDir, "index.html")) && !fs.existsSync(path.join(outDir, "index.html"))) {
  console.log("[layout-subpath] Already nested, skip.");
  process.exit(0);
}

const children = fs.readdirSync(outDir);
if (children.includes(segment) && !children.includes("index.html")) {
  console.log("[layout-subpath] Already only nested, skip.");
  process.exit(0);
}

if (!children.includes("index.html")) {
  console.warn("[layout-subpath] No index.html in dist/public, skip.");
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });
for (const name of children) {
  if (name === segment) continue;
  const from = path.join(outDir, name);
  const to = path.join(targetDir, name);
  fs.renameSync(from, to);
}

const rootIndex = path.join(outDir, "index.html");
const redirectHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0;url=/${segment}/" />
  <title>Cartnicity</title>
</head>
<body>
  <p><a href="/${segment}/">Continue to Cartnicity</a></p>
</body>
</html>
`;
fs.writeFileSync(rootIndex, redirectHtml, "utf8");

console.log(`[layout-subpath] Moved build into /${segment}/ and wrote root index.html redirect.`);

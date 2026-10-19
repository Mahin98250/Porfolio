import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const output = resolve("apps/portfolio/out");
const basePath = (process.env.PORTFOLIO_BASE_PATH ?? "/Porfolio").replace(/\/$/, "");
const required = [
  "index.html",
  "about/index.html",
  "projects/index.html",
  "projects/opticode-studio/index.html",
  "skills/index.html",
  "journey/index.html",
  "contact/index.html",
  "Dudh-Wallah/index.html",
  "Dudh-Wallah/sw.js",
];
for (const relative of required) {
  try { await access(join(output, relative)); }
  catch { console.error("Missing expected GitHub Pages output: " + relative); process.exitCode = 1; }
}
if (process.exitCode) process.exit(1);
const portfolioHtml = await readFile(join(output, "index.html"), "utf8");
if (!portfolioHtml.includes(basePath + "/_next/")) {
  throw new Error("Next.js asset URLs do not contain the configured Pages base path " + basePath);
}
const doodhwalaHtml = await readFile(join(output, "Dudh-Wallah/index.html"), "utf8");
if (!doodhwalaHtml.includes(basePath + "/Dudh-Wallah/")) {
  throw new Error("Doodhwala asset URLs are not rebased for GitHub Pages");
}
const serviceWorker = await readFile(join(output, "Dudh-Wallah/sw.js"), "utf8");
if (!serviceWorker.includes(basePath + "/Dudh-Wallah/")) {
  throw new Error("Doodhwala service-worker cache URLs are not rebased for GitHub Pages");
}
console.log("GitHub Pages export smoke check passed for portfolio routes and Doodhwala offline assets.");

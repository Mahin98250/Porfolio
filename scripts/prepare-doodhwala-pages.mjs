import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve, extname } from "node:path";

const source = resolve("apps/dudhwala");
const destination = resolve("apps/portfolio/out/Dudh-Wallah");
const basePath = (process.env.PORTFOLIO_BASE_PATH ?? "/Porfolio").replace(/\/$/, "");
const publicExtensions = new Set([".html", ".js", ".css", ".webmanifest"]);
await mkdir(destination, { recursive: true });
for (const entry of await readdir(source, { withFileTypes: true })) {
  const from = join(source, entry.name);
  const to = join(destination, entry.name);
  if (entry.isFile() && publicExtensions.has(extname(entry.name))) {
    await cp(from, to);
  } else if (entry.isDirectory() && entry.name === "assets") {
    await cp(from, to, { recursive: true });
  }
}

async function rewrite(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewrite(path);
      continue;
    }
    if (!publicExtensions.has(extname(path))) continue;
    const original = await readFile(path, "utf8");
    const updated = original.replaceAll("/Dudh-Wallah/", basePath + "/Dudh-Wallah/");
    if (updated !== original) await writeFile(path, updated);
  }
}
await rewrite(destination);
console.log("Doodhwala runtime files copied and project-page paths rebased under " + basePath + "/Dudh-Wallah/");

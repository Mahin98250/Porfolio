import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve, extname } from "node:path";

const source = resolve("apps/dudhwala");
const destination = resolve("apps/portfolio/out/Dudh-Wallah");
const basePath = (process.env.PORTFOLIO_BASE_PATH ?? "/Porfolio").replace(/\/$/, "");
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, filter: (path) => !path.includes("/.git") });

async function rewrite(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewrite(path);
      continue;
    }
    if (![".html", ".js", ".css", ".webmanifest"].includes(extname(path))) continue;
    const original = await readFile(path, "utf8");
    const updated = original.replaceAll("/Dudh-Wallah/", basePath + "/Dudh-Wallah/");
    if (updated !== original) await writeFile(path, updated);
  }
}
await rewrite(destination);
console.log("Doodhwala copied and project-page asset paths rewritten under " + basePath + "/Dudh-Wallah/");

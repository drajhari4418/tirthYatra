import { defineConfig } from "vite";
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const htmlPages = [
  "index.html",
  "about-us.html",
  "contacts.html",
  "typography.html",
  "auth.html",
  "admin.html",
  "prasads.html",
  "temple-visits.html"
];

function copyLegacyAssets() {
  return {
    name: "copy-legacy-assets",
    closeBundle() {
      const root = resolve(process.cwd());
      const out = resolve(root, "dist");
      for (const dir of ["css", "images", "fonts"]) {
        const src = resolve(root, dir);
        const dest = resolve(out, dir);
        if (existsSync(src)) cpSync(src, dest, { recursive: true });
      }
      const legacyJs = ["core.min.js", "script.js"];
      const jsRoot = resolve(root, "js");
      const jsOut = resolve(out, "js");
      if (existsSync(jsRoot)) {
        for (const file of legacyJs) {
          const src = resolve(jsRoot, file);
          if (existsSync(src)) cpSync(src, resolve(jsOut, file));
        }
      }
    }
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [copyLegacyAssets()],
  build: {
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      input: Object.fromEntries(
        htmlPages.map((page) => [page.replace(/\.html$/, ""), resolve(process.cwd(), page)])
      )
    }
  }
});

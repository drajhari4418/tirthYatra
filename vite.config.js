import { defineConfig } from "vite";
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function copyLegacyAssets() {
  return {
    name: "copy-legacy-assets",
    closeBundle() {
      const root = resolve(process.cwd());
      const out = resolve(root, "dist");
      for (const dir of ["js", "images", "fonts"]) {
        const src = resolve(root, dir);
        const dest = resolve(out, dir);
        if (existsSync(src)) cpSync(src, dest, { recursive: true });
      }
    }
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [copyLegacyAssets()],
  build: {
    target: "es2020",
    sourcemap: false
  }
});

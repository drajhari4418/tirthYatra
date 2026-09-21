import { defineConfig } from "vite";

export default defineConfig({
  appType: "mpa",
  build: {
    target: "es2020",
    cssMinify: "lightningcss"
  }
});

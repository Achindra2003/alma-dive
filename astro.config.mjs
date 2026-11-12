import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://alma.inc",
  trailingSlash: "always",
  server: { host: "127.0.0.1", port: 4321 },
  // The creature (three.js) is one lazy chunk by design; budget is 160KB gzipped.
  vite: { build: { chunkSizeWarningLimit: 600 } },
});

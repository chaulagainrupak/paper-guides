// @ts-check
import { defineConfig } from "astro/config";
// @ts-ignore
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
// @ts-ignore
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
// import react from "@astrojs/react";
// import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  site: "https://example.com",
  output: "static",
  integrations: [
    react(),
    sitemap({
      entryLimit: 5000,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: "standalone",
  }),
});

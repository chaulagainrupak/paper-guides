// @ts-check
import { defineConfig } from 'astro/config';


// @ts-ignore
import react from "@astrojs/react";


import tailwindcss from "@tailwindcss/vite";


// @ts-ignore
import node from "@astrojs/node";


// import react from "@astrojs/react";

// import tailwindcss from "@tailwindcss/vite";


// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: "standalone",
  }),
})
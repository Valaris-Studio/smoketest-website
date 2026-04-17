import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// site URL is required for sitemap + canonical generation; override per env at deploy time.
export default defineConfig({
  site: "https://valaris.studio",
  integrations: [mdx(), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    fonts: [
      {
        name: "Inter",
        cssVariable: "--font-inter",
        provider: fontProviders.local(),
        // Local provider: variants live under `options` and describe each
        // @font-face the provider should emit. Weight range "100 900" maps
        // to the Inter variable font's full weight axis.
        options: {
          variants: [
            {
              src: ["./src/assets/fonts/inter-variable.woff2"],
              weight: "100 900",
              style: "normal",
            },
          ],
        },
      },
    ],
  },
});

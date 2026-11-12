import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  vite: {
    define: {
      __UMKM_NETLIFY_PREVIEW__: 'false',
    },
    plugins: [tailwindcss()],
  },
});

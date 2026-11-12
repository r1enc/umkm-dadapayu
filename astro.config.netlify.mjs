import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  outDir: './dist-netlify',
  adapter: netlify({
    imageCDN: false,
    cacheOnDemandPages: false,
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});

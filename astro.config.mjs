import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { loadWranglerPublicEnv } from './scripts/wrangler-public-env.mjs';

const publicBuildEnv = loadWranglerPublicEnv();
// Set the Vite process env before Astro loads .env so Wrangler stays authoritative.
Object.assign(process.env, publicBuildEnv);
const publicBuildDefines = Object.fromEntries(
  Object.entries(publicBuildEnv).map(([name, value]) => [`import.meta.env.${name}`, JSON.stringify(value)]),
);

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  vite: {
    define: {
      __UMKM_NETLIFY_PREVIEW__: 'false',
      ...publicBuildDefines,
    },
    plugins: [tailwindcss()],
  },
});

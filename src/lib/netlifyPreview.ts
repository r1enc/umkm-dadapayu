/** True only in builds made with astro.config.netlify.mjs. */
export const isNetlifyPreview =
  typeof __UMKM_NETLIFY_PREVIEW__ !== 'undefined' && __UMKM_NETLIFY_PREVIEW__;

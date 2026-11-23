# Netlify preview

This is a temporary preview target. Cloudflare Pages remains the primary host and keeps using `astro.config.mjs` with `pnpm run build`.

## Separate build

- Build command: `npm run build:netlify`
- Publish directory: `dist-netlify` (kept separate from the Cloudflare `dist/` output)
- The preview build pins `PUBLIC_FIREBASE_PROJECT_ID` to the existing `umkm-dadapayu` project. Configure the Firebase web API key in Netlify's environment settings; no service-account key is used.
- The Netlify build uses `astro.config.netlify.mjs` and `@astrojs/netlify` 6.6.4, compatible with this project's Astro 5.18.2.
- The Netlify adapter's on-demand page cache and Image CDN are disabled. The Cloudflare Cache API helper has no Cache API binding on Netlify and therefore bypasses storage. Admin pages remain `private, no-store`; API endpoints are not eligible for public page caching.

## Netlify environment variables

Set values in the Netlify site dashboard. Do not paste credentials into chat or commit `.env` files.

Firebase client configuration used by the public catalog and admin sign-in:

- `PUBLIC_FIREBASE_API_KEY` (required)
- `PUBLIC_FIREBASE_PROJECT_ID` (required; choose the intended preview Firebase project)
- `PUBLIC_FIREBASE_AUTH_DOMAIN` (recommended; defaults to `<project-id>.firebaseapp.com`)
- `PUBLIC_FIREBASE_STORAGE_BUCKET` (recommended; defaults to `<project-id>.appspot.com`)
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (recommended by Firebase client configuration; empty fallback exists)
- `PUBLIC_FIREBASE_APP_ID` (recommended by Firebase client configuration; empty fallback exists)

Cloudinary configuration:

- `PUBLIC_CLOUDINARY_CLOUD_NAME` is optional for displaying existing Cloudinary images and has a code fallback of `desa-dadapayu`.
- Netlify preview disables upload signatures and Cloudinary deletion, so `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are not required in Netlify. Keep production secrets configured only on the Cloudflare deployment.

The public catalog and admin dashboard read UMKM and category records from Firestore. Product details are stored on their UMKM documents. An empty collection is shown as an empty state; Firestore access failures are reported separately. No sample records are created or removed during build or deployment.

`ADMIN_REGISTRATION_KEY` is only declared in `src/env.d.ts` and is not read by the application. `ADMIN_SETUP_SECRET` in `.env.example` is also not referenced by current application code; neither is required for this preview build.

Use a dedicated preview Firebase project for any preview that may be used for admin CRUD. If production Firebase is selected, an authenticated admin can write to that project through the existing protected endpoints; do not give teammates admin credentials. Firestore Rules remain the authority for data access.

No credentials are included in this file. Existing `.env` files remain local and ignored by Git.

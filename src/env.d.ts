/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare const __UMKM_NETLIFY_PREVIEW__: boolean;

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

interface Env {
  // Public Client Keys
  PUBLIC_FIREBASE_API_KEY?: string;
  PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  PUBLIC_FIREBASE_PROJECT_ID?: string;
  PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  PUBLIC_FIREBASE_APP_ID?: string;
  PUBLIC_CLOUDINARY_CLOUD_NAME?: string;

  // Server-Side Secrets
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  ADMIN_REGISTRATION_KEY?: string;
}

declare namespace App {
interface Locals extends Runtime {
  admin?: { uid?: string; email?: string; role?: 'admin' | 'superadmin' };
}
}

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore/lite';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Mengambil variabel lingkungan (mendukung Vite import.meta.env)
export function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
  const authDomain = import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.PUBLIC_FIREBASE_APP_ID;

  const missing: string[] = [];
  if (!apiKey) missing.push('PUBLIC_FIREBASE_API_KEY');
  if (!authDomain) missing.push('PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!projectId) missing.push('PUBLIC_FIREBASE_PROJECT_ID');
  if (!storageBucket) missing.push('PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missing.push('PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId) missing.push('PUBLIC_FIREBASE_APP_ID');

  if (missing.length) {
    console.error(`[Firebase] Konfigurasi publik belum lengkap: ${missing.join(', ')}`);
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (appInstance) return appInstance;

  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(config);
    }
    return appInstance;
  } catch (error) {
    console.warn('[Firebase] Gagal inisialisasi Firebase App:', error);
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (dbInstance) return dbInstance;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.warn('[Firestore] Gagal inisialisasi Firestore Lite:', error);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

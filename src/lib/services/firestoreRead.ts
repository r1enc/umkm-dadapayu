import type { Firestore } from 'firebase/firestore/lite';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase/config';

export function requireFirestoreDb(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new Error('Konfigurasi Firestore belum tersedia.');
  }
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore tidak dapat diinisialisasi.');
  return db;
}

export async function readFirestore<T>(resource: string, read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (cause) {
    console.error(`[Firestore] Gagal memuat ${resource}:`, cause);
    throw new Error(`Firestore gagal memuat ${resource}. Silakan coba lagi.`, { cause });
  }
}

import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  query,
  where,
} from 'firebase/firestore/lite';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase/config';
import type { UMKM } from '../../types';
import { firestoreList } from '../firebase/firestoreRest';
import { verifyAdminSession } from '../firebase/verifyAdmin';
import { listDemoUMKM } from '../dev/demoStore';
import { findPublishedUMKM, listPublishedByCategory } from '../firebase/firestorePublicCore.mjs';

const UMKM_COLLECTION = 'umkms';

/**
 * Mengambil seluruh UMKM yang berstatus 'published' (Publik).
 * Mengutamakan Firestore.
 * PENTING: Mock data HANYA boleh digunakan pada environment development (import.meta.env.DEV).
 * Pada environment production, jika Firestore kosong, gagal diakses, atau belum terkonfigurasi,
 * sistem mengembalikan array kosong [].
 */
export async function fetchPublishedUMKM(): Promise<UMKM[]> {
  const isDev = import.meta.env.DEV === true;
  if (isDev) return listDemoUMKM().filter((item) => item.status === 'published');

  if (!isFirebaseConfigured()) return [];

  const db = getFirestoreDb();
  if (!db) return [];

  try {
    const umkmRef = collection(db, UMKM_COLLECTION);
    const q = query(umkmRef, where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Pada production, kembalikan array kosong jika belum ada data riil
      return [];
    }

    const umkms: UMKM[] = [];
    snapshot.forEach((doc) => {
      const d = doc.data();
      umkms.push({
        id: doc.id,
        name: d.name || '',
        slug: d.slug || doc.id,
        categoryId: d.categoryId || '',
        shortDescription: d.shortDescription || '',
        description: d.description || '',
        coverImage: d.coverImage || {
          publicId: '',
          url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1000&q=80',
        },
        gallery: Array.isArray(d.gallery) ? d.gallery : [],
        address: d.address || '',
        mapsUrl: d.mapsUrl || 'https://maps.google.com/?q=Dadapayu,+Semanu,+Gunung+Kidul',
        whatsapp: d.whatsapp || '',
        openingHours: d.openingHours || undefined,
        products: Array.isArray(d.products) ? d.products : [],
        status: d.status || 'published',
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : (d.createdAt || new Date().toISOString()),
        updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : (d.updatedAt || new Date().toISOString()),
      });
    });

    return umkms;
  } catch (error) {
    console.error('[Firestore Service] Gagal mengambil data UMKM dari Firestore:', error);
    return [];
  }
}

function mapPublicUMKM(id: string, d: Record<string, any>): UMKM {
  return {
    id,
    name: d.name || '',
    slug: d.slug || id,
    categoryId: d.categoryId || '',
    shortDescription: d.shortDescription || '',
    description: d.description || '',
    coverImage: d.coverImage || { publicId: '', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1000&q=80' },
    gallery: Array.isArray(d.gallery) ? d.gallery : [],
    address: d.address || '',
    mapsUrl: d.mapsUrl || 'https://maps.google.com/?q=Dadapayu,+Semanu,+Gunung+Kidul',
    whatsapp: d.whatsapp || '',
    openingHours: d.openingHours || undefined,
    products: Array.isArray(d.products) ? d.products : [],
    status: 'published',
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : (d.createdAt || new Date().toISOString()),
    updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : (d.updatedAt || new Date().toISOString()),
  };
}

const publicQueryApi = { collection, doc, getDoc, getDocs, limit, query, where };

export async function fetchUMKMBySlug(slug: string): Promise<UMKM | undefined> {
  if (import.meta.env.DEV === true) return listDemoUMKM().find((item) => (item.slug === slug || item.id === slug) && item.status === 'published');
  const db = getFirestoreDb();
  if (!db) return undefined;
  try {
    const result = await findPublishedUMKM(db, slug, publicQueryApi);
    return result ? mapPublicUMKM(result.id, result.data) : undefined;
  } catch (error) {
    console.error('[Firestore Service] Gagal mengambil UMKM detail:', error);
    return undefined;
  }
}

export async function fetchUMKMByCategory(categoryId: string): Promise<UMKM[]> {
  if (import.meta.env.DEV === true) return listDemoUMKM().filter((item) => item.categoryId === categoryId && item.status === 'published');
  const db = getFirestoreDb();
  if (!db) return [];
  try {
    const docs = await listPublishedByCategory(db, categoryId, publicQueryApi);
    return docs.map((item: { id: string; data: Record<string, any> }) => mapPublicUMKM(item.id, item.data));
  } catch (error) {
    console.error('[Firestore Service] Gagal mengambil UMKM kategori:', error);
    return [];
  }
}

export async function fetchRelatedUMKM(categoryId: string, excludeSlug: string, count = 3): Promise<UMKM[]> {
  if (import.meta.env.DEV === true) return listDemoUMKM().filter((item) => item.categoryId === categoryId && item.status === 'published' && item.slug !== excludeSlug).slice(0, count);
  const db = getFirestoreDb();
  if (!db) return [];
  try {
    const docs = await listPublishedByCategory(db, categoryId, publicQueryApi, { excludeSlug, limit: count });
    return docs.map((item: { id: string; data: Record<string, any> }) => mapPublicUMKM(item.id, item.data));
  } catch (error) {
    console.error('[Firestore Service] Gagal mengambil UMKM terkait:', error);
    return [];
  }
}

/** Mengambil semua status untuk panel admin; tidak pernah memakai data contoh. */
export async function fetchAdminUMKM(request: Request): Promise<UMKM[]> {
  if (import.meta.env.DEV === true) return listDemoUMKM();
  const admin = await verifyAdminSession(request);
  if (!admin.verified) return [];
  const documents = await firestoreList(request, admin, UMKM_COLLECTION);
  return documents.map((item) => {
    const d = item;
    return {
      id: d.id, name: d.name || '', slug: d.slug || d.id, categoryId: d.categoryId || '',
      shortDescription: d.shortDescription || '', description: d.description || '',
      coverImage: d.coverImage || { publicId: '', url: '' }, gallery: Array.isArray(d.gallery) ? d.gallery : [],
      address: d.address || '', mapsUrl: d.mapsUrl || '', whatsapp: d.whatsapp || '', openingHours: d.openingHours || undefined,
      products: Array.isArray(d.products) ? d.products : [], status: d.status || 'draft',
      createdAt: d.createdAt || '', updatedAt: d.updatedAt || '',
    } as UMKM;
  });
}

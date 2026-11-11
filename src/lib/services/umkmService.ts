import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore/lite';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase/config';
import { mockUMKMList } from '../../data/mockData';
import { fetchCategoryBySlug } from './categoryService';
import type { UMKM, Category } from '../../types';
import { firestoreList } from '../firebase/firestoreRest';
import { verifyAdminSession } from '../firebase/verifyAdmin';
import { listDemoUMKM } from '../dev/demoStore';

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

  if (!isFirebaseConfigured()) {
    return isDev ? mockUMKMList.filter((item) => item.status === 'published') : [];
  }

  const db = getFirestoreDb();
  if (!db) {
    return isDev ? mockUMKMList.filter((item) => item.status === 'published') : [];
  }

  try {
    const umkmRef = collection(db, UMKM_COLLECTION);
    const q = query(umkmRef, where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Pada production, kembalikan array kosong jika belum ada data riil
      return isDev ? mockUMKMList.filter((item) => item.status === 'published') : [];
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
    return isDev ? mockUMKMList.filter((item) => item.status === 'published') : [];
  }
}

export async function fetchFeaturedUMKM(limit = 6): Promise<UMKM[]> {
  const all = await fetchPublishedUMKM();
  return all.slice(0, limit);
}

export async function fetchUMKMBySlug(slug: string): Promise<UMKM | undefined> {
  const all = await fetchPublishedUMKM();
  return all.find((item) => item.slug === slug);
}

export async function fetchUMKMByCategory(categoryId: string): Promise<UMKM[]> {
  const all = await fetchPublishedUMKM();
  return all.filter((item) => item.categoryId === categoryId);
}

export async function fetchCategoryUMKMCount(categoryId: string): Promise<number> {
  const all = await fetchPublishedUMKM();
  return all.filter((item) => item.categoryId === categoryId).length;
}

export async function searchUMKMService(params: {
  query?: string;
  categorySlug?: string;
}): Promise<{
  items: UMKM[];
  total: number;
  category?: Category;
}> {
  let results = await fetchPublishedUMKM();
  let matchedCategory: Category | undefined;

  if (params.categorySlug && params.categorySlug !== 'semua') {
    matchedCategory = await fetchCategoryBySlug(params.categorySlug);
    if (matchedCategory) {
      const catId = matchedCategory.id;
      results = results.filter((item) => item.categoryId === catId);
    }
  }

  if (params.query && params.query.trim() !== '') {
    const q = params.query.toLowerCase().trim();
    results = results.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.shortDescription.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      const matchAddress = item.address.toLowerCase().includes(q);
      const matchProducts = item.products.some(
        (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
      return matchName || matchDesc || matchAddress || matchProducts;
    });
  }

  return {
    items: results,
    total: results.length,
    category: matchedCategory,
  };
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

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore/lite';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase/config';
import { mockCategories } from '../../data/mockData';
import type { Category } from '../../types';
import { firestoreList } from '../firebase/firestoreRest';
import { verifyAdminSession } from '../firebase/verifyAdmin';
import { listDemoCategories } from '../dev/demoStore';

const CATEGORIES_COLLECTION = 'categories';

/** Semua kategori untuk panel admin, termasuk yang sedang nonaktif. */
export async function fetchAdminCategories(request: Request): Promise<Category[]> {
  if (import.meta.env.DEV === true) return listDemoCategories().sort((a, b) => a.sortOrder - b.sortOrder);
  const admin = await verifyAdminSession(request);
  if (!admin.verified) return [];
  const documents = await firestoreList(request, admin, CATEGORIES_COLLECTION);
  return documents.map((data) => ({
    id: data.id, name: data.name || '', slug: data.slug || data.id,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 99, active: data.active === true,
    createdAt: data.createdAt, updatedAt: data.updatedAt,
  })).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Mengambil seluruh kategori aktif.
 * Mengutamakan Firestore.
 * PENTING: Mock data HANYA boleh digunakan pada environment development (import.meta.env.DEV).
 * Pada environment production, jika Firestore belum terkonfigurasi atau kosong, sistem
 * mengembalikan array kosong demi menjaga integritas data riil desa.
 */
export async function fetchCategories(): Promise<Category[]> {
  const isDev = import.meta.env.DEV === true;
  if (isDev) return listDemoCategories().filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder);

  if (!isFirebaseConfigured()) {
    return isDev ? mockCategories.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder) : [];
  }

  const db = getFirestoreDb();
  if (!db) {
    return isDev ? mockCategories.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder) : [];
  }

  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(categoriesRef, where('active', '==', true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Jika kosong di production, kembalikan array kosong (bukan mock data)
      return isDev ? mockCategories.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder) : [];
    }

    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        name: data.name || '',
        slug: data.slug || doc.id,
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 99,
        active: data.active !== false,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      });
    });

    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error('[Firestore Service] Gagal mengambil kategori dari Firestore:', error);
    return isDev ? mockCategories.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder) : [];
  }
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | undefined> {
  const all = await fetchCategories();
  return all.find((c) => c.slug === slug);
}

export async function fetchCategoryById(id: string): Promise<Category | undefined> {
  const all = await fetchCategories();
  return all.find((c) => c.id === id);
}

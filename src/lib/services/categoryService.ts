import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  query,
  where,
} from 'firebase/firestore/lite';
import type { Category } from '../../types';
import { firestoreList } from '../firebase/firestoreRest';
import { verifyAdminSession } from '../firebase/verifyAdmin';
import { findActiveCategoryById, findActiveCategoryBySlug } from '../firebase/firestorePublicCore.mjs';
import { readFirestore, requireFirestoreDb } from './firestoreRead';

const CATEGORIES_COLLECTION = 'categories';
const categoryQueryApi = { collection, doc, getDoc, getDocs, limit, query, where };

export async function fetchAdminCategories(request: Request): Promise<Category[]> {
  const admin = await verifyAdminSession(request);
  if (!admin.verified) throw new Error('Sesi admin tidak valid. Silakan masuk kembali.');
  try {
    const documents = await firestoreList(request, admin, CATEGORIES_COLLECTION);
    return documents.map((data) => ({
      id: data.id,
      name: data.name || '',
      slug: data.slug || data.id,
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 99,
      active: data.active === true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (cause) {
    console.error('[Firestore] Gagal memuat kategori admin:', cause);
    throw new Error('Firestore gagal memuat kategori. Silakan coba lagi.', { cause });
  }
}

/** Returns active categories from Firestore; an empty result means no category documents exist. */
export async function fetchCategories(): Promise<Category[]> {
  return readFirestore('kategori', async () => {
    const db = requireFirestoreDb();
    const snapshot = await getDocs(query(collection(db, CATEGORIES_COLLECTION), where('active', '==', true)));
    return snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        name: data.name || '',
        slug: data.slug || item.id,
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 99,
        active: data.active === true,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  });
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | undefined> {
  return readFirestore('detail kategori', async () => {
    const db = requireFirestoreDb();
    const result = await findActiveCategoryBySlug(db, slug, categoryQueryApi);
    return result ? {
      id: result.id,
      name: result.data.name || '',
      slug: result.data.slug || result.id,
      sortOrder: typeof result.data.sortOrder === 'number' ? result.data.sortOrder : 99,
      active: true,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    } : undefined;
  });
}

export async function fetchCategoryById(id: string): Promise<Category | undefined> {
  return readFirestore('kategori UMKM', async () => {
    const db = requireFirestoreDb();
    const result = await findActiveCategoryById(db, id, { doc, getDoc });
    return result ? {
      id: result.id,
      name: result.data.name || '',
      slug: result.data.slug || result.id,
      sortOrder: typeof result.data.sortOrder === 'number' ? result.data.sortOrder : 99,
      active: true,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    } : undefined;
  });
}

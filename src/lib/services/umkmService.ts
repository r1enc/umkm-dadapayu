import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  query,
  where,
} from 'firebase/firestore/lite';
import type { UMKM } from '../../types';
import { firestoreList } from '../firebase/firestoreRest';
import { verifyAdminSession } from '../firebase/verifyAdmin';
import { findPublishedUMKM, listPublishedByCategory } from '../firebase/firestorePublicCore.mjs';
import { readFirestore, requireFirestoreDb } from './firestoreRead';

const UMKM_COLLECTION = 'umkms';
const publicQueryApi = { collection, doc, getDoc, getDocs, limit, query, where };

function mapPublicUMKM(id: string, data: Record<string, any>): UMKM {
  return {
    id,
    name: data.name || '',
    slug: data.slug || id,
    categoryId: data.categoryId || '',
    shortDescription: data.shortDescription || '',
    description: data.description || '',
    coverImage: data.coverImage || { publicId: '', url: '/images/placeholder-umkm.jpg' },
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    address: data.address || '',
    mapsUrl: data.mapsUrl || '',
    whatsapp: data.whatsapp || '',
    openingHours: data.openingHours || undefined,
    products: Array.isArray(data.products) ? data.products : [],
    status: 'published',
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || ''),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || ''),
  };
}

/** Returns only published UMKM documents from Firestore. */
export async function fetchPublishedUMKM(): Promise<UMKM[]> {
  return readFirestore('UMKM', async () => {
    const db = requireFirestoreDb();
    const snapshot = await getDocs(query(collection(db, UMKM_COLLECTION), where('status', '==', 'published')));
    return snapshot.docs.map((item) => mapPublicUMKM(item.id, item.data()));
  });
}

export async function fetchUMKMBySlug(slug: string): Promise<UMKM | undefined> {
  return readFirestore('detail UMKM', async () => {
    const db = requireFirestoreDb();
    const result = await findPublishedUMKM(db, slug, publicQueryApi);
    return result ? mapPublicUMKM(result.id, result.data) : undefined;
  });
}

export async function fetchUMKMByCategory(categoryId: string): Promise<UMKM[]> {
  return readFirestore('katalog kategori', async () => {
    const db = requireFirestoreDb();
    const documents = await listPublishedByCategory(db, categoryId, publicQueryApi);
    return documents.map((item: { id: string; data: Record<string, any> }) => mapPublicUMKM(item.id, item.data));
  });
}

export async function fetchRelatedUMKM(categoryId: string, excludeSlug: string, count = 3): Promise<UMKM[]> {
  return readFirestore('UMKM terkait', async () => {
    const db = requireFirestoreDb();
    const documents = await listPublishedByCategory(db, categoryId, publicQueryApi, { excludeSlug, limit: count });
    return documents.map((item: { id: string; data: Record<string, any> }) => mapPublicUMKM(item.id, item.data));
  });
}

/** Reads all UMKM states for the authenticated admin dashboard. */
export async function fetchAdminUMKM(request: Request): Promise<UMKM[]> {
  const admin = await verifyAdminSession(request);
  if (!admin.verified) throw new Error('Sesi admin tidak valid. Silakan masuk kembali.');
  try {
    const documents = await firestoreList(request, admin, UMKM_COLLECTION);
    return documents.map((data) => ({
      id: data.id,
      name: data.name || '',
      slug: data.slug || data.id,
      categoryId: data.categoryId || '',
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      coverImage: data.coverImage || { publicId: '', url: '' },
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      address: data.address || '',
      mapsUrl: data.mapsUrl || '',
      whatsapp: data.whatsapp || '',
      openingHours: data.openingHours || undefined,
      products: Array.isArray(data.products) ? data.products : [],
      status: data.status || 'draft',
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
    } as UMKM));
  } catch (cause) {
    console.error('[Firestore] Gagal memuat UMKM admin:', cause);
    throw new Error('Firestore gagal memuat data dashboard. Silakan coba lagi.', { cause });
  }
}

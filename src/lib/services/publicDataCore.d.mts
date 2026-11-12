import type { Category, UMKM } from '../../types';

export function filterPublishedUMKM(
  items: UMKM[],
  categories: Category[],
  params?: { query?: string; categorySlug?: string },
): { items: UMKM[]; total: number; category?: Category };

export function loadHomepageData(
  fetchCategories: () => Promise<Category[]>,
  fetchPublishedUMKM: () => Promise<UMKM[]>,
): Promise<{ categories: Category[]; allPublished: UMKM[]; featuredUMKM: UMKM[]; totalUMKM: number }>;

export function loadCatalogData(
  fetchCategories: () => Promise<Category[]>,
  fetchPublishedUMKM: () => Promise<UMKM[]>,
  params?: { query?: string; categorySlug?: string },
): Promise<{ categories: Category[]; allPublished: UMKM[]; items: UMKM[]; total: number; category?: Category }>;

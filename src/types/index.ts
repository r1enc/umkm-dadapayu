export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UMKMProduct {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
}

export interface UMKMImage {
  publicId: string;
  url: string;
  alt?: string;
}

export type UMKMStatus = 'draft' | 'published' | 'hidden';

export interface UMKM {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  coverImage: UMKMImage;
  gallery: UMKMImage[];
  address: string;
  mapsUrl: string;
  whatsapp: string;
  openingHours?: string;
  products: UMKMProduct[];
  status: UMKMStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}

export interface CatalogFilterOptions {
  categoryId?: string;
  searchQuery?: string;
}

export const PREVIEW_SEED_CONFIRMATION = 'BUAT_DATA_UJI_PREVIEW_NETLIFY';
export const PREVIEW_CLEANUP_CONFIRMATION = 'HAPUS_DATA_UJI_PREVIEW_NETLIFY';
export const PREVIEW_SEED_MARKER = 'DATA UJI PREVIEW NETLIFY — bukan data usaha nyata.';
export const PREVIEW_SEED_NAME_PREFIX = '[UJI PREVIEW NETLIFY]';
export const PREVIEW_CATEGORY_NAME_PREFIX = 'Uji Preview Netlify -';

export const PREVIEW_CATEGORY_SPECS = [
  { key: 'kuliner', label: 'Olahan Pangan', slug: 'uji-preview-netlify-olahan-pangan', sortOrder: 9901, keywords: ['makanan', 'minuman', 'kuliner', 'pangan', 'olahan'] },
  { key: 'pertanian', label: 'Pertanian dan Peternakan', slug: 'uji-preview-netlify-pertanian', sortOrder: 9902, keywords: ['pertanian', 'peternakan', 'perkebunan', 'perikanan', 'tani'] },
  { key: 'kerajinan', label: 'Kerajinan', slug: 'uji-preview-netlify-kerajinan', sortOrder: 9903, keywords: ['kerajinan', 'anyaman', 'kriya', 'craft'] },
  { key: 'jasa', label: 'Jasa', slug: 'uji-preview-netlify-jasa', sortOrder: 9904, keywords: ['jasa', 'layanan', 'servis'] },
];

export const PREVIEW_UMKM_FIXTURES = [
  {
    key: 'tiwul-mbah-sastro', categoryKey: 'kuliner', name: 'Tiwul Instan Mbah Sastro',
    shortDescription: 'Tiwul instan berbahan singkong pilihan, praktis disajikan di rumah.',
    description: 'Contoh usaha olahan singkong rumahan di Dadapayu. Produk disiapkan dalam kemasan untuk oleh-oleh dan konsumsi keluarga.',
    address: 'Dusun Dadapayu, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000001',
    openingHours: 'Senin–Sabtu, 08.00–16.00 WIB', products: [{ id: 'tiwul-500g', name: 'Tiwul instan 500 gram', price: 18000, description: 'Kemasan siap kukus.' }],
  },
  {
    key: 'gatot-bu-warsi', categoryKey: 'kuliner', name: 'Gatot dan Gaplek Bu Warsi',
    shortDescription: 'Olahan singkong tradisional dengan bahan dari kebun sekitar.',
    description: 'Contoh profil usaha pangan lokal. Gatot dan gaplek dibuat bertahap dengan cara pengeringan tradisional.',
    address: 'Padukuhan Sumberrejo, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000002',
    openingHours: 'Setiap hari, 07.00–15.00 WIB', products: [{ id: 'gatot-pack', name: 'Gatot kering 250 gram', price: 15000, description: 'Perlu dikukus sebelum disajikan.' }],
  },
  {
    key: 'keripik-pisang-lestari', categoryKey: 'kuliner', name: 'Keripik Pisang Lestari',
    shortDescription: 'Keripik pisang renyah dengan pilihan rasa manis dan gurih.',
    description: 'Contoh usaha camilan skala rumah tangga di Dadapayu dengan bahan baku pisang dari petani sekitar.',
    address: 'Padukuhan Karangwuni, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000003',
    openingHours: 'Senin–Jumat, 09.00–16.00 WIB', products: [{ id: 'keripik-200g', name: 'Keripik pisang 200 gram', price: 16000, description: 'Tersedia rasa original dan gula jawa.' }],
  },
  {
    key: 'sambal-widuri', categoryKey: 'kuliner', name: 'Sambal Bawang Widuri',
    shortDescription: 'Sambal bawang rumahan dengan cabai dan bawang pilihan.',
    description: 'Contoh katalog produk sambal kemasan yang dibuat dalam jumlah kecil dan diproduksi berdasarkan pesanan.',
    address: 'Padukuhan Mojo, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000004',
    openingHours: 'Selasa–Minggu, 08.00–14.00 WIB', products: [{ id: 'sambal-150g', name: 'Sambal bawang 150 gram', price: 22000, description: 'Simpan di tempat sejuk.' }],
  },
  {
    key: 'bibit-tani-makmur', categoryKey: 'pertanian', name: 'Bibit Tani Makmur',
    shortDescription: 'Menyediakan bibit sayur dan kebutuhan tanam skala rumah tangga.',
    description: 'Contoh usaha pertanian yang melayani kebutuhan bibit warga dan pekebun kecil di wilayah Dadapayu.',
    address: 'Padukuhan Ngasem, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000005',
    openingHours: 'Senin–Sabtu, 07.00–15.00 WIB', products: [{ id: 'bibit-cabai', name: 'Bibit cabai dalam polybag', price: 3000, description: 'Harga per bibit.' }],
  },
  {
    key: 'telur-kampung-sido-mulyo', categoryKey: 'pertanian', name: 'Telur Kampung Sido Mulyo',
    shortDescription: 'Telur ayam kampung segar dari peternakan keluarga.',
    description: 'Contoh profil peternakan kecil dengan penjualan telur berdasarkan ketersediaan harian.',
    address: 'Padukuhan Sumberrejo, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000006',
    openingHours: 'Setiap hari, 06.30–12.00 WIB', products: [{ id: 'telur-10', name: 'Telur ayam kampung 10 butir', price: 28000, description: 'Stok mengikuti hasil harian.' }],
  },
  {
    key: 'anyaman-bambu-rukun', categoryKey: 'kerajinan', name: 'Anyaman Bambu Rukun',
    shortDescription: 'Peralatan rumah tangga anyaman bambu buatan perajin lokal.',
    description: 'Contoh usaha kerajinan yang membuat besek, tampah, dan wadah anyaman sesuai pesanan.',
    address: 'Padukuhan Karangwuni, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000007',
    openingHours: 'Senin–Jumat, 08.00–16.00 WIB', products: [{ id: 'besek-medium', name: 'Besek bambu ukuran sedang', price: 12000, description: 'Harga per buah.' }],
  },
  {
    key: 'jahit-bu-rini', categoryKey: 'jasa', name: 'Jasa Jahit Bu Rini',
    shortDescription: 'Jasa permak dan jahit pakaian untuk warga sekitar.',
    description: 'Contoh usaha jasa jahit rumahan yang menerima permak, perbaikan, dan jahit sederhana berdasarkan pesanan.',
    address: 'Padukuhan Mojo, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000008',
    openingHours: 'Senin–Sabtu, 09.00–17.00 WIB', products: [{ id: 'permak-celana', name: 'Permak celana', price: 15000, description: 'Harga mulai dari.' }],
  },
  {
    key: 'servis-elektronik-dadapayu', categoryKey: 'jasa', name: 'Servis Elektronik Dadapayu',
    shortDescription: 'Layanan pemeriksaan dan perbaikan perangkat elektronik rumah.',
    description: 'Contoh profil jasa servis elektronik dengan pengecekan awal sebelum pelanggan menyetujui biaya perbaikan.',
    address: 'Padukuhan Dadapayu, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000009',
    openingHours: 'Senin–Sabtu, 09.00–16.00 WIB', products: [{ id: 'cek-elektronik', name: 'Pemeriksaan perangkat', price: 10000, description: 'Biaya awal, belum termasuk suku cadang.' }],
  },
];

export function previewCategoryDocumentId(key) {
  return `preview_test_category_${key}`;
}

export function previewUMKMDocumentId(key) {
  return `preview_test_umkm_${key}`;
}

export function toPreviewUMKMDocument(fixture, categoryId, now = new Date().toISOString()) {
  return {
    name: `${PREVIEW_SEED_NAME_PREFIX} ${fixture.name}`,
    slug: `uji-preview-netlify-${fixture.key}`,
    categoryId,
    status: 'draft',
    address: fixture.address,
    whatsapp: fixture.whatsapp,
    shortDescription: fixture.shortDescription,
    description: `${PREVIEW_SEED_MARKER}\n${fixture.description}`,
    coverImage: { publicId: '', url: '/images/placeholder-umkm.jpg', alt: 'Gambar contoh data uji' },
    gallery: [],
    mapsUrl: 'https://maps.google.com/?q=Desa+Dadapayu,+Semanu,+Gunungkidul',
    openingHours: fixture.openingHours,
    products: fixture.products,
    createdAt: now,
    updatedAt: now,
  };
}

export function isOwnedPreviewUMKM(document, fixture) {
  return document?.id === previewUMKMDocumentId(fixture.key) &&
    document.slug === `uji-preview-netlify-${fixture.key}` &&
    document.name === `${PREVIEW_SEED_NAME_PREFIX} ${fixture.name}` &&
    document.status === 'draft' &&
    typeof document.description === 'string' && document.description.startsWith(PREVIEW_SEED_MARKER);
}

export function isOwnedPreviewCategory(document, spec) {
  return document?.id === previewCategoryDocumentId(spec.key) &&
    document.slug === spec.slug &&
    document.name === `${PREVIEW_CATEGORY_NAME_PREFIX} ${spec.label}` &&
    document.sortOrder === spec.sortOrder &&
    document.active === true;
}

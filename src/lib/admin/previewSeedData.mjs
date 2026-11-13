// Seed identity lives in deterministic Firestore document IDs. The document
// fields stay within the public catalog schema and contain no seed marker.
export const PREVIEW_SEED_CONFIRMATION = 'CREATE_CATALOG_SAMPLE_DATA_DADAPAYU';
export const PREVIEW_CLEANUP_CONFIRMATION = 'REMOVE_CATALOG_SAMPLE_DATA_DADAPAYU';

const LEGACY_UMKM_ID_PREFIX = 'preview_test_umkm_';
const LEGACY_CATEGORY_ID_PREFIX = 'preview_test_category_';
const LEGACY_UMKM_SLUG_PREFIX = 'uji-preview-netlify-';
const LEGACY_UMKM_NAME_PREFIX = '[UJI PREVIEW NETLIFY] ';
const LEGACY_UMKM_DESCRIPTION_MARKER = 'DATA UJI PREVIEW NETLIFY — bukan data usaha nyata.';
const LEGACY_CATEGORY_NAME_PREFIX = 'Uji Preview Netlify - ';

export const PREVIEW_CATEGORY_SPECS = [
  { key: 'kuliner', label: 'Makanan dan Minuman', slug: 'makanan-minuman-dadapayu', legacySlug: 'uji-preview-netlify-olahan-pangan', sortOrder: 9901, keywords: ['makanan', 'minuman', 'kuliner', 'pangan', 'olahan'] },
  { key: 'pertanian', label: 'Pertanian dan Peternakan', slug: 'pertanian-peternakan-dadapayu', legacySlug: 'uji-preview-netlify-pertanian', sortOrder: 9902, keywords: ['pertanian', 'peternakan', 'perkebunan', 'perikanan', 'tani'] },
  { key: 'kerajinan', label: 'Kerajinan', slug: 'kerajinan-dadapayu', legacySlug: 'uji-preview-netlify-kerajinan', sortOrder: 9903, keywords: ['kerajinan', 'anyaman', 'kriya', 'craft'] },
  { key: 'jasa', label: 'Jasa', slug: 'jasa-dadapayu', legacySlug: 'uji-preview-netlify-jasa', sortOrder: 9904, keywords: ['jasa', 'layanan', 'servis'] },
];

export const PREVIEW_UMKM_FIXTURES = [
  {
    key: 'tiwul-mbah-sastro', categoryKey: 'kuliner', name: 'Pawon Sekar Arum', slug: 'pawon-sekar-arum-dadapayu',
    shortDescription: 'Aneka olahan singkong rumahan dengan cita rasa tradisional.',
    description: 'Pawon Sekar Arum mengolah singkong pilihan menjadi tiwul instan dan gatot. Produk dikemas praktis untuk persediaan di rumah maupun buah tangan.',
    address: 'Dusun Dadapayu, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000001',
    openingHours: 'Senin–Sabtu, 08.00–16.00 WIB', products: [{ id: 'tiwul-instan-500g', name: 'Tiwul instan 500 gram', price: 18000, description: 'Siap dikukus dan disajikan bersama lauk atau kelapa parut.' }],
  },
  {
    key: 'gatot-bu-warsi', categoryKey: 'kuliner', name: 'Olahan Singkong Mbok Sarmi', slug: 'olahan-singkong-mbok-sarmi',
    shortDescription: 'Gatot dan gaplek kering yang diolah secara tradisional.',
    description: 'Mengolah singkong hasil kebun menjadi gatot dan gaplek dengan proses pengeringan bertahap. Tersedia dalam kemasan untuk dimasak di rumah.',
    address: 'Padukuhan Sumberrejo, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000002',
    openingHours: 'Setiap hari, 07.00–15.00 WIB', products: [{ id: 'gatot-kering-250g', name: 'Gatot kering 250 gram', price: 15000, description: 'Rendam dan kukus hingga empuk sebelum disajikan.' }],
  },
  {
    key: 'keripik-pisang-lestari', categoryKey: 'kuliner', name: 'Keripik Pisang Sari Rasa', slug: 'keripik-pisang-sari-rasa',
    shortDescription: 'Keripik pisang renyah dengan pilihan rasa manis dan gurih.',
    description: 'Pisang pilihan diolah menjadi keripik tipis yang renyah. Cocok untuk camilan keluarga dan tersedia dalam beberapa pilihan rasa.',
    address: 'Padukuhan Karangwuni, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000003',
    openingHours: 'Senin–Jumat, 09.00–16.00 WIB', products: [{ id: 'keripik-pisang-200g', name: 'Keripik pisang 200 gram', price: 16000, description: 'Pilihan rasa original dan gula jawa.' }],
  },
  {
    key: 'sambal-widuri', categoryKey: 'kuliner', name: 'Sambal Bawang Bu Tini', slug: 'sambal-bawang-bu-tini',
    shortDescription: 'Sambal bawang rumahan dengan cabai dan bawang pilihan.',
    description: 'Sambal dibuat dalam jumlah kecil agar rasa pedas dan gurihnya tetap terjaga. Tersedia berdasarkan pesanan untuk teman makan sehari-hari.',
    address: 'Padukuhan Mojo, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000004',
    openingHours: 'Selasa–Minggu, 08.00–14.00 WIB', products: [{ id: 'sambal-bawang-150g', name: 'Sambal bawang 150 gram', price: 22000, description: 'Simpan di tempat sejuk dan kering.' }],
  },
  {
    key: 'bibit-tani-makmur', categoryKey: 'pertanian', name: 'Kebun Bibit Lestari', slug: 'kebun-bibit-lestari-dadapayu',
    shortDescription: 'Bibit sayuran untuk kebun rumah dan pekarangan.',
    description: 'Menyediakan bibit sayuran yang cocok ditanam di pekarangan. Warga dapat bertanya tentang pilihan bibit dan perawatan dasar sebelum membeli.',
    address: 'Padukuhan Ngasem, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000005',
    openingHours: 'Senin–Sabtu, 07.00–15.00 WIB', products: [{ id: 'bibit-cabai-polybag', name: 'Bibit cabai dalam polybag', price: 3000, description: 'Harga per bibit; ketersediaan mengikuti stok.' }],
  },
  {
    key: 'telur-kampung-sido-mulyo', categoryKey: 'pertanian', name: 'Ternak Sido Rukun', slug: 'ternak-sido-rukun-dadapayu',
    shortDescription: 'Telur ayam kampung segar dari peternakan keluarga.',
    description: 'Peternakan keluarga yang menyediakan telur ayam kampung sesuai hasil harian. Pemesanan dapat dilakukan terlebih dahulu untuk memastikan stok.',
    address: 'Padukuhan Sumberrejo, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000006',
    openingHours: 'Setiap hari, 06.30–12.00 WIB', products: [{ id: 'telur-kampung-10', name: 'Telur ayam kampung 10 butir', price: 28000, description: 'Stok mengikuti hasil harian.' }],
  },
  {
    key: 'anyaman-bambu-rukun', categoryKey: 'kerajinan', name: 'Anyaman Bambu Ngudi Rukun', slug: 'anyaman-bambu-ngudi-rukun',
    shortDescription: 'Peralatan rumah tangga dari anyaman bambu buatan tangan.',
    description: 'Membuat besek, tampah, dan wadah anyaman untuk kebutuhan rumah tangga. Pesanan ukuran tertentu dapat dibicarakan langsung dengan perajin.',
    address: 'Padukuhan Karangwuni, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000007',
    openingHours: 'Senin–Jumat, 08.00–16.00 WIB', products: [{ id: 'besek-bambu-sedang', name: 'Besek bambu ukuran sedang', price: 12000, description: 'Harga per buah; ukuran lain tersedia berdasarkan pesanan.' }],
  },
  {
    key: 'jahit-bu-rini', categoryKey: 'jasa', name: 'Jahit Busana Bu Rini', slug: 'jahit-busana-bu-rini',
    shortDescription: 'Jasa jahit, permak, dan perbaikan pakaian.',
    description: 'Menerima permak celana, perbaikan pakaian, dan jahit sederhana. Biaya disesuaikan dengan jenis pekerjaan dan bahan yang dibutuhkan.',
    address: 'Padukuhan Mojo, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000008',
    openingHours: 'Senin–Sabtu, 09.00–17.00 WIB', products: [{ id: 'permak-celana', name: 'Permak celana', price: 15000, description: 'Harga mulai dari, menyesuaikan jenis permak.' }],
  },
  {
    key: 'servis-elektronik-dadapayu', categoryKey: 'jasa', name: 'Servis Elektronik Dadapayu', slug: 'servis-elektronik-dadapayu',
    shortDescription: 'Pemeriksaan dan perbaikan perangkat elektronik rumah.',
    description: 'Melayani pemeriksaan awal peralatan elektronik rumah tangga. Perbaikan dan penggantian komponen dilakukan setelah biaya disepakati.',
    address: 'Padukuhan Dadapayu, Kalurahan Dadapayu, Semanu, Gunungkidul', whatsapp: '6280000000009',
    openingHours: 'Senin–Sabtu, 09.00–16.00 WIB', products: [{ id: 'pemeriksaan-elektronik', name: 'Pemeriksaan perangkat', price: 10000, description: 'Biaya pemeriksaan awal, belum termasuk suku cadang.' }],
  },
];

export function previewCategoryDocumentId(key) {
  return `seed_category_dadapayu_${key}`;
}

export function previewUMKMDocumentId(key) {
  return `seed_umkm_dadapayu_${key}`;
}

export function legacyPreviewCategoryDocumentId(key) {
  return `${LEGACY_CATEGORY_ID_PREFIX}${key}`;
}

export function legacyPreviewUMKMDocumentId(key) {
  return `${LEGACY_UMKM_ID_PREFIX}${key}`;
}

export function isLegacyPreviewUMKMIdentity(document, fixture) {
  return document?.id === legacyPreviewUMKMDocumentId(fixture.key);
}

export function isLegacyPreviewCategoryIdentity(document, spec) {
  return document?.id === legacyPreviewCategoryDocumentId(spec.key);
}

export function toPreviewCategoryDocument(spec, now = new Date().toISOString()) {
  return {
    name: spec.label,
    slug: spec.slug,
    sortOrder: spec.sortOrder,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function toPreviewUMKMDocument(fixture, categoryId, now = new Date().toISOString()) {
  return {
    name: fixture.name,
    slug: fixture.slug,
    categoryId,
    status: 'draft',
    address: fixture.address,
    whatsapp: fixture.whatsapp,
    shortDescription: fixture.shortDescription,
    description: fixture.description,
    coverImage: { publicId: '', url: '/images/placeholder-umkm.jpg', alt: 'Foto produk' },
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
    document.slug === fixture.slug &&
    document.name === fixture.name &&
    document.status === 'draft' &&
    document.address === fixture.address &&
    document.shortDescription === fixture.shortDescription &&
    document.description === fixture.description;
}

export function isOwnedLegacyPreviewUMKM(document, fixture) {
  return isLegacyPreviewUMKMIdentity(document, fixture) &&
    document.slug === `${LEGACY_UMKM_SLUG_PREFIX}${fixture.key}` &&
    typeof document.name === 'string' && document.name.startsWith(LEGACY_UMKM_NAME_PREFIX) &&
    document.status === 'draft' &&
    typeof document.description === 'string' && document.description.startsWith(LEGACY_UMKM_DESCRIPTION_MARKER);
}

export function isOwnedPreviewCategory(document, spec) {
  return document?.id === previewCategoryDocumentId(spec.key) &&
    document.slug === spec.slug &&
    document.name === spec.label &&
    document.sortOrder === spec.sortOrder &&
    document.active === true;
}

export function isOwnedLegacyPreviewCategory(document, spec) {
  return isLegacyPreviewCategoryIdentity(document, spec) &&
    document.slug === spec.legacySlug &&
    typeof document.name === 'string' && document.name.startsWith(LEGACY_CATEGORY_NAME_PREFIX) &&
    document.sortOrder === spec.sortOrder &&
    document.active === true;
}

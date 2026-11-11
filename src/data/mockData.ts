import type { Category, UMKM } from '../types';

export const mockCategories: Category[] = [
  {
    id: 'cat-kuliner',
    name: 'Kuliner & Olahan Pangan',
    slug: 'kuliner-olahan',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'cat-kerajinan',
    name: 'Kerajinan & Seni Kriya',
    slug: 'kerajinan-kriya',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'cat-pertanian',
    name: 'Hasil Bumi & Pertanian',
    slug: 'hasil-bumi-pertanian',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'cat-jasa-warung',
    name: 'Warung & Jasa Lokal',
    slug: 'warung-jasa-lokal',
    sortOrder: 4,
    active: true,
  },
];

export const mockUMKMList: UMKM[] = [
  {
    id: 'umkm-tiwul-bu-sri',
    name: 'Tiwul & Gatot Tradisional Bu Sri',
    slug: 'tiwul-gatot-bu-sri',
    categoryId: 'cat-kuliner',
    shortDescription: 'Olahan singkong khas Dadapayu dengan resep turun-temurun, manis gurih beraroma daun pisang alami.',
    description: 'Usaha olahan pangan tradisional yang dirintis oleh Bu Sri sejak tahun 2012 di Dusun Dadap. Menggunakan singkong lokal pilihan hasil panen petani Dadapayu tanpa bahan pengawet. Menyajikan tiwul manis gula jawa kelapa muda parut, gatot legit kenyal, serta tepung tiwul instan yang siap dikukus untuk oleh-oleh khas Gunungkidul.',
    coverImage: {
      publicId: 'mock/tiwul-1',
      url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1000&q=80',
      alt: 'Tiwul manis tradisional khas Dadapayu',
    },
    gallery: [
      {
        publicId: 'mock/tiwul-2',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        alt: 'Proses pengukusan singkong olahan',
      },
      {
        publicId: 'mock/tiwul-3',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        alt: 'Kemasan oleh-oleh tiwul instan',
      },
    ],
    address: 'RT 02 / RW 04, Dusun Dadap, Kalurahan Dadapayu, Semanu, Gunungkidul',
    mapsUrl: 'https://maps.google.com/?q=Dadapayu,+Semanu,+Gunung+Kidul',
    whatsapp: '6281234567801',
    openingHours: 'Setiap Hari, 07.00 - 18.00 WIB',
    status: 'published',
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-02-10T10:30:00Z',
    products: [
      {
        id: 'prod-t1',
        name: 'Tiwul Manis Gula Kelapa (Porsi Siap Saji)',
        description: 'Tiwul hangat dengan taburan kelapa parut gurih dan lelehan juruh gula jawa asli.',
        price: 10000,
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'prod-t2',
        name: 'Gatot Kenyal Tabur Kelapa',
        description: 'Olahan singkong fermentasi khas yang kenyal legit bercita rasa tradisional.',
        price: 12000,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'prod-t3',
        name: 'Tepung Tiwul Instan 500gr',
        description: 'Bahan baku tiwul kering kemasan higienis, tahan hingga 6 bulan, praktis tinggal kukus.',
        price: 18000,
      },
    ],
  },
  {
    id: 'umkm-keripik-pak-marwanto',
    name: 'Keripik Pisang & Singkong Renyah Berkah',
    slug: 'keripik-berkah-pak-marwanto',
    categoryId: 'cat-kuliner',
    shortDescription: 'Camilan keripik pisang tanduk dan keripik singkong gurih renyah tanpa bahan pengawet.',
    description: 'Rumah produksi camilan renyah yang mempekerjakan ibu-ibu warga Dusun Kerdon. Mengolah hasil kebun pisang tanduk dan ketela pohon menjadi keripik aneka rasa (original asin gurih, manis karamel, dan balado). Sangat diminati sebagai oleh-oleh wisatawan yang melintas di jalur Semanu-Rongkop.',
    coverImage: {
      publicId: 'mock/keripik-1',
      url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1000&q=80',
      alt: 'Aneka keripik renyah kemasan khas Dadapayu',
    },
    gallery: [
      {
        publicId: 'mock/keripik-2',
        url: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80',
        alt: 'Keripik singkong bumbu rempah lokal',
      },
    ],
    address: 'Dusun Kerdon RT 03 / RW 01, Kalurahan Dadapayu, Semanu, Gunungkidul',
    mapsUrl: 'https://maps.google.com/?q=Dusun+Kerdon+Dadapayu+Semanu',
    whatsapp: '6282133445566',
    openingHours: 'Senin - Sabtu, 08.00 - 17.00 WIB',
    status: 'published',
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-02-12T14:15:00Z',
    products: [
      {
        id: 'prod-k1',
        name: 'Keripik Pisang Gurih Original 250gr',
        description: 'Irisan pisang tanduk tipis renyah digoreng dengan minyak kelapa pilihan.',
        price: 15000,
      },
      {
        id: 'prod-k2',
        name: 'Keripik Singkong Balado Daun Jeruk 300gr',
        description: 'Keripik ketela dengan balutan bumbu pedas manis segar daun jeruk asli.',
        price: 14000,
      },
    ],
  },
  {
    id: 'umkm-kerajinan-bambu-moro-seneng',
    name: 'Anyaman Bambu & Besek Moro Seneng',
    slug: 'anyaman-bambu-moro-seneng',
    categoryId: 'cat-kerajinan',
    shortDescription: 'Kerajinan anyaman bambu alami, besek hantaran hajatan, kukusan, dan wadah ramah lingkungan.',
    description: 'Kelompok pengrajin anyaman bambu tradisional di Dusun Pokdadap. Memanfaatkan bambu apus dan bambu tali yang melimpah di perbukitan Dadapayu. Menghasilkan produk perkakas dapur tradisional, wadah hantaran kenduri, caping, dan keranjang souvenir dengan anyaman halus dan tahan lama.',
    coverImage: {
      publicId: 'mock/bambu-1',
      url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80',
      alt: 'Kerajinan anyaman bambu rapi khas Dadapayu',
    },
    gallery: [
      {
        publicId: 'mock/bambu-2',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        alt: 'Produk wadah anyaman dan besek bambu',
      },
    ],
    address: 'Dusun Pokdadap RT 01 / RW 05, Dadapayu, Semanu, Gunungkidul',
    mapsUrl: 'https://maps.google.com/?q=Dadapayu,+Semanu,+Gunung+Kidul',
    whatsapp: '6285290112233',
    openingHours: 'Senin - Minggu, 08.00 - 16.30 WIB',
    status: 'published',
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-02-14T11:00:00Z',
    products: [
      {
        id: 'prod-b1',
        name: 'Besek Bambu Hantaran (Pasang 15x15 cm)',
        description: 'Anyaman bambu putih bersih rapi untuk wadah makanan syukuran atau oleh-oleh.',
        price: 4500,
      },
      {
        id: 'prod-b2',
        name: 'Tenggok / Keranjang Bambu Serbaguna',
        description: 'Wadah anyaman kokoh untuk belanja pasar atau wadah panen hasil kebun.',
        price: 25000,
      },
      {
        id: 'prod-b3',
        name: 'Kukusan Bambu Tumpeng Tradisional',
        description: 'Kukusan kerucut dari bambu alami untuk memasak nasi tumpeng wangi.',
        price: 20000,
      },
    ],
  },
  {
    id: 'umkm-kayu-ukir-kreasi-jati',
    name: 'Kreasi Kayu Jati & Souvenir Mas Joko',
    slug: 'kreasi-kayu-mas-joko',
    categoryId: 'cat-kerajinan',
    shortDescription: 'Peralatan makan kayu jati, telenan estetik, sendok garpu, dan souvenir ukiran khas perbukitan.',
    description: 'Bengkel kriya kayu yang didirikan oleh Mas Joko di Dusun Semanu-Dadapayu. Mengolah sisa potongan kayu jati dan sonokeling menjadi produk bernilai tinggi seperti telenan estetik, piring kayu, cangkir bubut, mangkuk saji, dan plakat kenang-kenangan. Seluruh produk menggunakan finishing minyak alami (food grade) yang aman untuk makanan.',
    coverImage: {
      publicId: 'mock/kayu-1',
      url: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=1000&q=80',
      alt: 'Peralatan makan kayu jati estetik halus',
    },
    gallery: [
      {
        publicId: 'mock/kayu-2',
        url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
        alt: 'Koleksi sendok dan piring kayu kerajinan',
      },
    ],
    address: 'Jl. Raya Dadapayu - Bedoyo No. 14, Dadapayu, Semanu, Gunungkidul',
    mapsUrl: 'https://maps.google.com/?q=Dadapayu,+Semanu,+Gunung+Kidul',
    whatsapp: '6287712349988',
    openingHours: 'Senin - Sabtu, 08.30 - 17.00 WIB',
    status: 'published',
    createdAt: '2025-01-25T13:00:00Z',
    updatedAt: '2025-02-15T09:00:00Z',
    products: [
      {
        id: 'prod-w1',
        name: 'Telenan Kayu Jati Motif Alami (30x18 cm)',
        description: 'Telenan kayu utuh serat padat dengan handle ergonomis, awet dan ramah pisau.',
        price: 45000,
      },
      {
        id: 'prod-w2',
        name: 'Set Sendok Garpu Kayu Sonokeling',
        description: 'Sepasang alat makan kayu halus elegan tahan panas dan tidak beracun.',
        price: 18000,
      },
      {
        id: 'prod-w3',
        name: 'Piring Saji Cekung Kayu Mahoni 20cm',
        description: 'Piring kayu rustic cocok untuk cafe, restoran etnik, atau wadah buah.',
        price: 35000,
      },
    ],
  },
  {
    id: 'umkm-madu-klanceng-gunung-sewu',
    name: 'Madu Klanceng Asli Dadap Asri',
    slug: 'madu-klanceng-dadap-asri',
    categoryId: 'cat-pertanian',
    shortDescription: 'Madu murni dari lebah trigona (klanceng) vegetasi alami perbukitan karst Dadapayu.',
    description: 'Budidaya lebah tanpa sengat (Trigona / Klanceng) yang dikembangkan oleh kelompok tani di Dusun Pelang. Lebah menghisap nektar bunga liar, kaliandra, dan pohon buah di perbukitan karst Gunungkidul. Memiliki cita rasa khas manis dengan sedikit sensasi asam segar serta kaya akan antioksidan dan propolis alami.',
    coverImage: {
      publicId: 'mock/madu-1',
      url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
      alt: 'Madu murni alami keemasan dari sarang lebah',
    },
    gallery: [
      {
        publicId: 'mock/madu-2',
        url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80',
        alt: 'Botol madu murni siap kirim',
      },
    ],
    address: 'Dusun Pelang RT 04 / RW 02, Dadapayu, Semanu, Gunungkidul',
    mapsUrl: 'https://maps.google.com/?q=Dusun+Pelang+Dadapayu',
    whatsapp: '6281398765432',
    openingHours: 'Setiap Hari, 08.00 - 17.00 WIB',
    status: 'published',
    createdAt: '2025-01-28T11:20:00Z',
    updatedAt: '2025-02-18T16:00:00Z',
    products: [
      {
        id: 'prod-m1',
        name: 'Madu Klanceng Asli 250ml',
        description: 'Madu murni lebah trigona kemasan botol kaca bersegel, kaya propolis alami.',
        price: 85000,
      },
      {
        id: 'prod-m2',
        name: 'Madu Multiflora Hutan Karst 500ml',
        description: 'Madu lebah Apis cerana dari nektar aneka bunga liar perbukitan karst.',
        price: 95000,
      },
    ],
  },
  {
    id: 'umkm-bibit-singkong-tani-makmur',
    name: 'Kelompok Tani Makmur — Bibit & Olahan Gaplek',
    slug: 'tani-makmur-gaplek-singkong',
    categoryId: 'cat-pertanian',
    shortDescription: 'Penyedia gaplek kering berkualitas super, tepung mocaf, dan bibit singkong unggul ketan.',
    description: 'Pusat pengumpulan dan pengeringan gaplek hasil tani warga Desa Dadapayu. Menghasilkan gaplek putih bersih melalui proses penjemuran di lantai semen beralas bersih. Menyediakan juga tepung Mocaf (Modified Cassava Flour) yang bebas gluten untuk alternatif tepung terigu.',
    coverImage: {
      publicId: 'mock/singkong-1',
      url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1000&q=80',
      alt: 'Hasil panen singkong berkualitas melimpah',
    },
    gallery: [],
    address: 'Kompleks Balai Dusun Nongkosingit, Dadapayu, Semanu, Gunungkidul',
    mapsUrl: 'https://maps.google.com/?q=Dadapayu,+Semanu,+Gunung+Kidul',
    whatsapp: '6281987654321',
    openingHours: 'Senin - Jumat, 08.00 - 15.00 WIB',
    status: 'published',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-02-18T10:00:00Z',
    products: [
      {
        id: 'prod-g1',
        name: 'Tepung Mocaf Bebas Gluten 1 Kg',
        description: 'Tepung singkong termodifikasi putih bersih, cocok untuk bolu, mie, dan gorengan.',
        price: 16000,
      },
      {
        id: 'prod-g2',
        name: 'Gaplek Kering Super Grade A (per Karung 25kg)',
        description: 'Gaplek singkong kupas bersih kering sinar matahari, bebas jamur.',
        price: 120000,
      },
    ],
  },
  {
    id: 'umkm-warung-makan-bu-daliyem',
    name: 'Warung Makan & Sayur Lombok Ijo Bu Daliyem',
    slug: 'warung-sayur-lombok-ijo-bu-daliyem',
    categoryId: 'cat-kuliner',
    shortDescription: 'Kuliner ndeso sayur tempe lombok ijo, ayam kampung bacem goreng, dan nasi tiwul gurih.',
    description: 'Warung makan sederhana di tepi jalan utama Dadapayu yang menyajikan masakan otentik pedesaan Gunungkidul. Menu andalan adalah jangan lombok ijo (sayur tempe bumbu cabai hijau santan gurih), trancam daun kemangi segar, dan ayam ungkep bumbu ketumbar.',
    coverImage: {
      publicId: 'mock/warung-1',
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
      alt: 'Sajian kuliner tradisional sayur lombok ijo hangat',
    },
    gallery: [
      {
        publicId: 'mock/warung-2',
        url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        alt: 'Menu sayuran pedesaan segar',
      },
    ],
    address: 'Jl. Dadapayu - Semanu Km 2, Dusun Kerdon, Dadapayu',
    mapsUrl: 'https://maps.google.com/?q=Dadapayu,+Semanu,+Gunung+Kidul',
    whatsapp: '6282333444555',
    openingHours: 'Setiap Hari, 06.30 - 15.00 WIB',
    status: 'published',
    createdAt: '2025-02-05T07:30:00Z',
    updatedAt: '2025-02-20T08:00:00Z',
    products: [
      {
        id: 'prod-w1',
        name: 'Paket Nasi Tiwul Sayur Lombok Ijo + Tempe Garit',
        description: 'Menu favorit sarapan dan makan siang warga dan pelintas jalan.',
        price: 12000,
      },
      {
        id: 'prod-w2',
        name: 'Ayam Kampung Goreng Bacem (Potong)',
        description: 'Ayam kampung gurih manis legit digoreng dadakan saat dipesan.',
        price: 22000,
      },
    ],
  },
  {
    id: 'umkm-bengkel-las-sinar-mulya',
    name: 'Bengkel Las & Konstruksi Besi Sinar Mulya',
    slug: 'bengkel-las-sinar-mulya',
    categoryId: 'cat-jasa-warung',
    shortDescription: 'Jasa pembuatan pagar rumah, kanopi, tralis, pintu lipat, dan perbaikan alat pertanian warga.',
    description: 'Penyedia jasa fabrikasi besi dan pengelasan terpercaya di Desa Dadapayu yang dikelola oleh Mas Yanto. Melayani pembuatan pagar minimalis, pintu besi, rangka kanopi atap baja ringan, hingga perbaikan cangkul, bajak traktor tangan, dan gerobak angkut petani.',
    coverImage: {
      publicId: 'mock/las-1',
      url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80',
      alt: 'Pekerjaan konstruksi besi dan bengkel las berkualitas',
    },
    gallery: [],
    address: 'Dusun Dayakan RT 02 / RW 06, Dadapayu, Semanu, Gunungkidul',
    mapsUrl: 'https://maps.google.com/?q=Dadapayu,+Semanu,+Gunung+Kidul',
    whatsapp: '6285700112244',
    openingHours: 'Senin - Sabtu, 08.00 - 16.30 WIB',
    status: 'published',
    createdAt: '2025-02-08T10:00:00Z',
    updatedAt: '2025-02-22T11:00:00Z',
    products: [
      {
        id: 'prod-l1',
        name: 'Jasa Pembuatan Kanopi Baja Ringan / Besi Hollow',
        description: 'Per meter persegi sudah termasuk material atap galvalum dan ongkos pasang.',
        price: 220000,
      },
      {
        id: 'prod-l2',
        name: 'Pagar Minimalis Motif Tempa / Hollow',
        description: 'Desain kokoh finishing cat anti karat tahan cuaca ekstrem.',
      },
    ],
  },
];

// Helper Functions
export function getAllCategories(): Category[] {
  return mockCategories
    .filter((cat) => cat.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return mockCategories.find((cat) => cat.slug === slug && cat.active);
}

export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find((cat) => cat.id === id);
}

export function getAllUMKM(): UMKM[] {
  return mockUMKMList.filter((umkm) => umkm.status === 'published');
}

export function getFeaturedUMKM(limit = 4): UMKM[] {
  return getAllUMKM().slice(0, limit);
}

export function getUMKMBySlug(slug: string): UMKM | undefined {
  return mockUMKMList.find((umkm) => umkm.slug === slug && umkm.status === 'published');
}

export function getUMKMByCategory(categoryId: string): UMKM[] {
  return getAllUMKM().filter((umkm) => umkm.categoryId === categoryId);
}

export function searchUMKM(params: {
  query?: string;
  categorySlug?: string;
}): {
  items: UMKM[];
  total: number;
  category?: Category;
} {
  let results = getAllUMKM();
  let matchedCategory: Category | undefined;

  if (params.categorySlug && params.categorySlug !== 'semua') {
    matchedCategory = getCategoryBySlug(params.categorySlug);
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

export function getCategoryUMKMCount(categoryId: string): number {
  return getAllUMKM().filter((item) => item.categoryId === categoryId).length;
}

export function formatRupiah(amount?: number): string {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return 'Hubungi Penjual';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createWhatsAppLink(phoneNumber: string, umkmName: string, productName?: string): string {
  // Clean phone number: remove +, -, spaces
  let cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  let message = `Halo ${umkmName}, saya melihat usaha Anda di Katalog Digital UMKM Desa Dadapayu.`;
  if (productName) {
    message += ` Saya tertarik dengan produk: "${productName}". Apakah produk ini masih tersedia?`;
  } else {
    message += ` Boleh saya bertanya informasi lebih lanjut mengenai produk/layanan Anda?`;
  }

  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

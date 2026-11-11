import { test, describe, before, after, beforeEach } from 'node:test';
import fs from 'node:fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const PROJECT_ID = 'demo-umkm-dadapayu-test';

describe('Firestore Security Rules Test Suite - Katalog UMKM Dadapayu', () => {
  let testEnv;

  before(async () => {
    const rules = fs.readFileSync('firestore.rules', 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();

      // Seed data administratif menggunakan withSecurityRulesDisabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();

        // 1. Seed Admin & Superadmin docs
        await setDoc(doc(db, 'admins', 'admin_123'), {
          email: 'admin@dadapayu.desa.id',
          role: 'admin',
          uid: 'admin_123',
          createdAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'admins', 'super_999'), {
          email: 'lurah@dadapayu.desa.id',
          role: 'superadmin',
          uid: 'super_999',
          createdAt: new Date().toISOString(),
        });

        // 2. Seed Sample Categories
        await setDoc(doc(db, 'categories', 'cat_active'), {
          name: 'Kuliner Tradisional',
          slug: 'kuliner-tradisional',
          sortOrder: 1,
          active: true,
          createdAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'categories', 'cat_inactive'), {
          name: 'Kategori Nonaktif',
          slug: 'kategori-nonaktif',
          sortOrder: 9,
          active: false,
          createdAt: new Date().toISOString(),
        });

        // 3. Seed Sample UMKMs
        await setDoc(doc(db, 'umkms', 'umkm_published'), {
          name: 'Tiwul Bu Sri',
          slug: 'tiwul-bu-sri',
          categoryId: 'cat_active',
          status: 'published',
          address: 'Dusun Dadap',
          whatsapp: '6281234567890',
          createdAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'umkms', 'umkm_draft'), {
          name: 'Keripik Baru (Draft)',
          slug: 'keripik-baru-draft',
          categoryId: 'cat_active',
          status: 'draft',
          address: 'Dusun Kerdon',
          whatsapp: '6281234567891',
          createdAt: new Date().toISOString(),
        });
      });
    }
  });

  // ========================================================
  // 1. PENGUJIAN AKSES PUBLIK (UNAUTHENTICATED)
  // ========================================================
  describe('Akses Publik (Pengunjung Tanpa Login)', () => {
    test('Dapat membaca kategori yang aktif', async () => {
      const publicDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(publicDb, 'categories', 'cat_active')));
    });

    test('DITOLAK saat membaca kategori non-aktif', async () => {
      const publicDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(publicDb, 'categories', 'cat_inactive')));
    });

    test('Dapat membaca UMKM yang berstatus published', async () => {
      const publicDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(publicDb, 'umkms', 'umkm_published')));
    });

    test('DITOLAK saat membaca UMKM yang masih draft', async () => {
      const publicDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(publicDb, 'umkms', 'umkm_draft')));
    });

    test('DITOLAK saat mencoba menulis (create) UMKM baru', async () => {
      const publicDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        setDoc(doc(publicDb, 'umkms', 'hacker_umkm'), {
          name: 'Hacked UMKM',
          slug: 'hacked-umkm',
          categoryId: 'cat_active',
          status: 'published',
          address: 'Unknown',
          whatsapp: '628999999999',
        })
      );
    });

    test('DITOLAK saat mencoba menulis kategori', async () => {
      const publicDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(setDoc(doc(publicDb, 'categories', 'public_category'), {
        name: 'Kategori Publik', slug: 'kategori-publik', sortOrder: 1, active: true,
      }));
    });

    test('DITOLAK saat membaca koleksi admins', async () => {
      const publicDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(publicDb, 'admins', 'admin_123')));
    });
  });

  // ========================================================
  // 2. PENGUJIAN USER TERAUTENTIKASI NON-ADMIN
  // ========================================================
  describe('Akses Pengguna Terautentikasi Non-Admin', () => {
    test('DITOLAK saat mencoba membuat UMKM baru', async () => {
      const regularUserDb = testEnv.authenticatedContext('user_regular_456').firestore();
      await assertFails(
        setDoc(doc(regularUserDb, 'umkms', 'unauth_umkm'), {
          name: 'Ilegal UMKM',
          slug: 'ilegal-umkm',
          categoryId: 'cat_active',
          status: 'published',
          address: 'Dusun Pelang',
          whatsapp: '6281234567899',
        })
      );
    });

    test('DITOLAK saat mencoba melihat dokumen admin lain', async () => {
      const regularUserDb = testEnv.authenticatedContext('user_regular_456').firestore();
      await assertFails(getDoc(doc(regularUserDb, 'admins', 'admin_123')));
    });

    test('DITOLAK saat mengubah kategori atau menghapus UMKM', async () => {
      const regularUserDb = testEnv.authenticatedContext('user_regular_456').firestore();
      await assertFails(setDoc(doc(regularUserDb, 'categories', 'new_cat'), {
        name: 'Ilegal', slug: 'ilegal', sortOrder: 1, active: true,
      }));
      await assertFails(deleteDoc(doc(regularUserDb, 'umkms', 'umkm_published')));
    });
  });

  // ========================================================
  // 3. PENGUJIAN ADMIN TERVERIFIKASI
  // ========================================================
  describe('Akses Administrator Desa (admin_123)', () => {
    test('Dapat membaca UMKM draft maupun published', async () => {
      const adminDb = testEnv.authenticatedContext('admin_123').firestore();
      await assertSucceeds(getDoc(doc(adminDb, 'umkms', 'umkm_published')));
      await assertSucceeds(getDoc(doc(adminDb, 'umkms', 'umkm_draft')));
    });

    test('Dapat membaca kategori nonaktif', async () => {
      const adminDb = testEnv.authenticatedContext('admin_123').firestore();
      await assertSucceeds(getDoc(doc(adminDb, 'categories', 'cat_inactive')));
    });

    test('Dapat membuat kategori dengan data valid', async () => {
      const adminDb = testEnv.authenticatedContext('admin_123').firestore();
      await assertSucceeds(setDoc(doc(adminDb, 'categories', 'cat_new'), {
        name: 'Kategori Baru', slug: 'kategori-baru', sortOrder: 3, active: true,
      }));
    });

    test('Dapat memperbarui UMKM tanpa mengubah createdAt', async () => {
      const adminDb = testEnv.authenticatedContext('admin_123').firestore();
      await assertSucceeds(updateDoc(doc(adminDb, 'umkms', 'umkm_draft'), {
        name: 'Keripik Diperbarui', status: 'hidden', updatedAt: new Date().toISOString(),
      }));
    });

    test('Dapat membuat UMKM baru dengan data valid', async () => {
      const adminDb = testEnv.authenticatedContext('admin_123').firestore();
      await assertSucceeds(
        setDoc(doc(adminDb, 'umkms', 'umkm_baru'), {
          name: 'Madu Klanceng Asli',
          slug: 'madu-klanceng-asli',
          categoryId: 'cat_active',
          status: 'published',
          address: 'Dusun Pelang RT 04',
          whatsapp: '6281398765432',
          createdAt: new Date().toISOString(),
        })
      );
    });

    test('DITOLAK saat membuat UMKM dengan nomor WhatsApp tidak valid (< 10 digit)', async () => {
      const adminDb = testEnv.authenticatedContext('admin_123').firestore();
      await assertFails(
        setDoc(doc(adminDb, 'umkms', 'umkm_invalid'), {
          name: 'Usaha Tanpa WA Valid',
          slug: 'usaha-tanpa-wa',
          categoryId: 'cat_active',
          status: 'published',
          address: 'Dusun Dadap',
          whatsapp: '123', // Terlalu pendek
        })
      );
    });

    test('Dapat menghapus UMKM', async () => {
      const adminDb = testEnv.authenticatedContext('admin_123').firestore();
      await assertSucceeds(deleteDoc(doc(adminDb, 'umkms', 'umkm_draft')));
    });

    test('DITOLAK saat admin biasa mencoba menambah atau mengubah koleksi admins', async () => {
      const adminDb = testEnv.authenticatedContext('admin_123').firestore();
      await assertFails(
        setDoc(doc(adminDb, 'admins', 'new_admin'), {
          email: 'newadmin@dadapayu.desa.id',
          role: 'admin',
        })
      );
    });
  });

  // ========================================================
  // 4. PENGUJIAN SUPERADMIN
  // ========================================================
  describe('Akses Superadmin (super_999)', () => {
    test('Custom claim superadmin memberi hak admin sesuai rule', async () => {
      const claimDb = testEnv.authenticatedContext('claim_super', { role: 'superadmin' }).firestore();
      await assertSucceeds(setDoc(doc(claimDb, 'umkms', 'claim_umkm'), {
        name: 'UMKM Claim', slug: 'umkm-claim', categoryId: 'cat_active',
        status: 'draft', address: 'Dusun Dadap', whatsapp: '6281234567890',
      }));
      await assertFails(deleteDoc(doc(claimDb, 'admins', 'claim_super')));
    });

    test('Dapat mendaftarkan admin baru ke koleksi admins', async () => {
      const superDb = testEnv.authenticatedContext('super_999').firestore();
      await assertSucceeds(
        setDoc(doc(superDb, 'admins', 'admin_baru_777'), {
          email: 'sekretaris@dadapayu.desa.id',
          role: 'admin',
          uid: 'admin_baru_777',
        })
      );
    });

    test('DITOLAK saat superadmin mencoba menghapus akunnya sendiri (Self-Lockout Protection)', async () => {
      const superDb = testEnv.authenticatedContext('super_999').firestore();
      await assertFails(deleteDoc(doc(superDb, 'admins', 'super_999')));
    });

    test('Dapat menghapus akun admin lain', async () => {
      const superDb = testEnv.authenticatedContext('super_999').firestore();
      await assertSucceeds(deleteDoc(doc(superDb, 'admins', 'admin_123')));
    });
  });
});

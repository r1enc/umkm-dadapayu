import type { APIRoute } from 'astro';
import {
  firestoreCreate,
  firestoreDelete,
  firestoreErrorResponse,
  firestoreList,
  firestoreQueryEqual,
} from '../../../lib/firebase/firestoreRest';
import { verifyAdminSession } from '../../../lib/firebase/verifyAdmin';
import { isNetlifyPreview } from '../../../lib/netlifyPreview';
import {
  PREVIEW_CATEGORY_SPECS,
  PREVIEW_CLEANUP_CONFIRMATION,
  PREVIEW_SEED_CONFIRMATION,
  PREVIEW_UMKM_FIXTURES,
  isOwnedLegacyPreviewCategory,
  isOwnedLegacyPreviewUMKM,
  isOwnedPreviewCategory,
  isOwnedPreviewUMKM,
  legacyPreviewCategoryDocumentId,
  previewCategoryDocumentId,
  previewUMKMDocumentId,
  toPreviewCategoryDocument,
  toPreviewUMKMDocument,
} from '../../../lib/admin/previewSeedData.mjs';

const noStore = { 'Cache-Control': 'no-store, private' };

function json(data: Record<string, unknown>, status = 200) {
  return Response.json(data, { status, headers: noStore });
}

async function rejectLegacySeedRecords(request: Request, admin: Awaited<ReturnType<typeof verifyAdminSession>>) {
  for (const fixture of PREVIEW_UMKM_FIXTURES) {
    const slug = `uji-preview-netlify-${fixture.key}`;
    const legacy = await firestoreQueryEqual(request, admin, 'umkms', 'slug', slug);
    if (!legacy.length) continue;
    if (legacy.length !== 1 || !isOwnedLegacyPreviewUMKM(legacy[0], fixture)) {
      throw new Response('Salah satu nama profil yang disiapkan sudah digunakan dokumen lain. Tidak ada dokumen yang diubah.', { status: 409 });
    }
    throw new Response('Profil contoh dengan format lama masih tersimpan. Hapus melalui tindakan manual pada panel ini sebelum menyiapkan data baru.', { status: 409 });
  }
}

async function seedData(request: Request, admin: Awaited<ReturnType<typeof verifyAdminSession>>) {
  await rejectLegacySeedRecords(request, admin);
  const allCategories = await firestoreList(request, admin, 'categories');
  const seedCategoryIds = new Set(PREVIEW_CATEGORY_SPECS.flatMap((spec) => [
    previewCategoryDocumentId(spec.key),
    legacyPreviewCategoryDocumentId(spec.key),
  ]));
  const activeCategories = allCategories.filter((item) => item.active === true && !seedCategoryIds.has(item.id));
  const usedCategoryIds = new Set<string>();
  const categoryIds = new Map<string, string>();
  let createdCategories = 0;
  let reusedCategories = 0;

  for (const spec of PREVIEW_CATEGORY_SPECS) {
    const matching = activeCategories.find((category) => {
      if (usedCategoryIds.has(category.id)) return false;
      const label = `${category.slug || ''} ${category.name || ''}`.toLowerCase();
      return spec.keywords.some((keyword) => label.includes(keyword));
    });
    const fallback = matching || activeCategories.find((category) => !usedCategoryIds.has(category.id));

    if (fallback) {
      categoryIds.set(spec.key, fallback.id);
      usedCategoryIds.add(fallback.id);
      reusedCategories++;
      continue;
    }

    const existing = await firestoreQueryEqual(request, admin, 'categories', 'slug', spec.slug);
    if (existing.length) {
      if (existing.length !== 1 || !isOwnedPreviewCategory(existing[0], spec)) {
        throw new Response(`Nama kategori "${spec.label}" sudah digunakan. Tidak ada dokumen yang diubah.`, { status: 409 });
      }
      categoryIds.set(spec.key, existing[0].id);
      reusedCategories++;
      continue;
    }

    const id = previewCategoryDocumentId(spec.key);
    const now = new Date().toISOString();
    await firestoreCreate(request, admin, 'categories', toPreviewCategoryDocument(spec, now), id);
    categoryIds.set(spec.key, id);
    createdCategories++;
  }

  let createdUMKM = 0;
  let existingUMKM = 0;
  for (const fixture of PREVIEW_UMKM_FIXTURES) {
    const matches = await firestoreQueryEqual(request, admin, 'umkms', 'slug', fixture.slug);
    if (matches.length) {
      if (matches.length !== 1 || !isOwnedPreviewUMKM(matches[0], fixture)) {
        throw new Response(`Nama profil "${fixture.name}" sudah digunakan. Tidak ada dokumen yang ditimpa.`, { status: 409 });
      }
      existingUMKM++;
      continue;
    }

    const categoryId = categoryIds.get(fixture.categoryKey);
    if (!categoryId) throw new Error(`Kategori ${fixture.categoryKey} tidak tersedia.`);
    const data = toPreviewUMKMDocument(fixture, categoryId);
    await firestoreCreate(request, admin, 'umkms', data, previewUMKMDocumentId(fixture.key));
    createdUMKM++;
  }

  return { createdUMKM, existingUMKM, createdCategories, reusedCategories };
}

async function cleanupData(request: Request, admin: Awaited<ReturnType<typeof verifyAdminSession>>) {
  let removedUMKM = 0;
  let skippedUMKM = 0;
  let removedCategories = 0;
  let preservedCategories = 0;

  for (const fixture of PREVIEW_UMKM_FIXTURES) {
    const candidates = [
      { slug: fixture.slug, isOwned: isOwnedPreviewUMKM },
      { slug: `uji-preview-netlify-${fixture.key}`, isOwned: isOwnedLegacyPreviewUMKM },
    ];
    for (const candidate of candidates) {
      const matches = await firestoreQueryEqual(request, admin, 'umkms', 'slug', candidate.slug);
      if (!matches.length) continue;
      if (matches.length !== 1 || !candidate.isOwned(matches[0], fixture)) {
        skippedUMKM++;
        continue;
      }
      await firestoreDelete(request, admin, 'umkms', matches[0].id);
      removedUMKM++;
    }
  }

  for (const spec of PREVIEW_CATEGORY_SPECS) {
    const candidates = [
      { slug: spec.slug, isOwned: isOwnedPreviewCategory },
      { slug: spec.legacySlug, isOwned: isOwnedLegacyPreviewCategory },
    ];
    for (const candidate of candidates) {
      const matches = await firestoreQueryEqual(request, admin, 'categories', 'slug', candidate.slug);
      if (!matches.length) continue;
      if (matches.length !== 1 || !candidate.isOwned(matches[0], spec)) {
        preservedCategories++;
        continue;
      }
      const usedByUMKM = await firestoreQueryEqual(request, admin, 'umkms', 'categoryId', matches[0].id);
      if (usedByUMKM.length) {
        preservedCategories++;
        continue;
      }
      await firestoreDelete(request, admin, 'categories', matches[0].id);
      removedCategories++;
    }
  }

  return { removedUMKM, skippedUMKM, removedCategories, preservedCategories };
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isNetlifyPreview) return json({ error: 'Tindakan ini tidak tersedia.' }, 404);

  const requestOrigin = request.headers.get('Origin');
  if (!requestOrigin || requestOrigin !== new URL(request.url).origin) {
    return json({ error: 'Permintaan harus berasal dari halaman ini.' }, 403);
  }

  const env = locals.runtime?.env as Record<string, string> | undefined;
  const admin = await verifyAdminSession(request, env);
  if (!admin.verified) {
    return Response.json({ error: admin.error, code: admin.code }, {
      status: admin.status,
      headers: {
        ...noStore,
        ...(admin.status === 401 ? { 'Set-Cookie': '__Host-admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' } : {}),
      },
    });
  }

  let body: { action?: string; confirmation?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Isi permintaan tidak dapat dibaca.' }, 400);
  }

  try {
    if (body.action === 'seed' && body.confirmation === PREVIEW_SEED_CONFIRMATION) {
      return json({ success: true, action: 'seed', ...await seedData(request, admin) });
    }
    if (body.action === 'cleanup' && body.confirmation === PREVIEW_CLEANUP_CONFIRMATION) {
      return json({ success: true, action: 'cleanup', ...await cleanupData(request, admin) });
    }
    return json({ error: 'Konfirmasi operasi tidak valid.' }, 400);
  } catch (error) {
    if (error instanceof Response) return json({ error: await error.text() }, error.status);
    return firestoreErrorResponse(error);
  }
};

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PREVIEW_CATEGORY_SPECS,
  PREVIEW_UMKM_FIXTURES,
  isOwnedLegacyPreviewCategory,
  isOwnedLegacyPreviewUMKM,
  isOwnedPreviewCategory,
  isOwnedPreviewUMKM,
  isLegacyPreviewCategoryIdentity,
  isLegacyPreviewUMKMIdentity,
  legacyPreviewCategoryDocumentId,
  legacyPreviewUMKMDocumentId,
  previewCategoryDocumentId,
  previewUMKMDocumentId,
  toPreviewCategoryDocument,
  toPreviewUMKMDocument,
} from '../src/lib/admin/previewSeedData.mjs';

const INTERNAL_LABEL = /\b(?:uji|preview|dummy|test)\b/i;

test('seed fixtures read like ordinary Dadapayu catalog entries', () => {
  assert.equal(PREVIEW_UMKM_FIXTURES.length, 9);
  assert.equal(new Set(PREVIEW_UMKM_FIXTURES.map(({ key }) => key)).size, 9);
  assert.equal(new Set(PREVIEW_UMKM_FIXTURES.map(({ slug }) => slug)).size, 9);
  assert.equal(new Set(PREVIEW_CATEGORY_SPECS.map(({ key }) => key)).size, PREVIEW_CATEGORY_SPECS.length);

  for (const fixture of PREVIEW_UMKM_FIXTURES) {
    assert.ok(PREVIEW_CATEGORY_SPECS.some(({ key }) => key === fixture.categoryKey));
    const document = toPreviewUMKMDocument(fixture, 'active-category', '2026-11-12T00:00:00.000Z');
    const customerVisibleValues = [
      document.name,
      document.slug,
      document.address,
      document.shortDescription,
      document.description,
      document.openingHours,
      document.coverImage.alt,
      ...document.products.flatMap(({ name, description }) => [name, description]),
    ];

    assert.ok(customerVisibleValues.every((value) => !INTERNAL_LABEL.test(value)), fixture.name);
    assert.deepEqual(Object.keys(document).sort(), [
      'address', 'categoryId', 'coverImage', 'createdAt', 'description', 'gallery', 'mapsUrl',
      'name', 'openingHours', 'products', 'shortDescription', 'slug', 'status', 'updatedAt', 'whatsapp',
    ].sort());
    assert.equal(document.name, fixture.name);
    assert.equal(document.slug, fixture.slug);
    assert.equal(document.description, fixture.description);
    assert.equal(document.status, 'draft');
    assert.ok(document.whatsapp.length >= 10 && document.whatsapp.length <= 25);
    assert.ok(document.name.length <= 150);
    assert.ok(document.slug.length <= 150);
    assert.ok(document.address.length <= 300);
    assert.ok(document.shortDescription.length <= 500);
    assert.ok(document.description.length <= 5000);
    assert.ok(document.products.length <= 50);
    assert.equal(document.gallery.length, 0);
  }

  for (const spec of PREVIEW_CATEGORY_SPECS) {
    const category = toPreviewCategoryDocument(spec, '2026-11-12T00:00:00.000Z');
    assert.equal(INTERNAL_LABEL.test(category.name), false);
    assert.equal(INTERNAL_LABEL.test(category.slug), false);
    assert.equal(category.name, spec.label);
    assert.deepEqual(Object.keys(category).sort(), ['active', 'createdAt', 'name', 'slug', 'sortOrder', 'updatedAt'].sort());
  }
});

test('new seed identity is internal and cleanup verifies the deterministic ID plus catalog fields', () => {
  const fixture = PREVIEW_UMKM_FIXTURES[0];
  const category = PREVIEW_CATEGORY_SPECS[0];
  const umkm = {
    ...toPreviewUMKMDocument(fixture, 'active-category'),
    id: previewUMKMDocumentId(fixture.key),
  };
  const categoryDocument = {
    ...toPreviewCategoryDocument(category),
    id: previewCategoryDocumentId(category.key),
  };

  assert.match(umkm.id, /^seed_umkm_dadapayu_/);
  assert.match(categoryDocument.id, /^seed_category_dadapayu_/);
  assert.equal(isOwnedPreviewUMKM(umkm, fixture), true);
  assert.equal(isOwnedPreviewUMKM({ ...umkm, id: 'business-123' }, fixture), false);
  assert.equal(isOwnedPreviewUMKM({ ...umkm, description: 'Deskripsi yang berbeda' }, fixture), false);
  assert.equal(isOwnedPreviewUMKM({ ...umkm, status: 'published' }, fixture), false);
  assert.equal(isOwnedPreviewCategory(categoryDocument, category), true);
  assert.equal(isOwnedPreviewCategory({ ...categoryDocument, id: 'category-123' }, category), false);
  assert.equal(isOwnedPreviewCategory({ ...categoryDocument, active: false }, category), false);
});

test('cleanup still recognizes only the exact legacy seed shape', () => {
  const fixture = PREVIEW_UMKM_FIXTURES[0];
  const category = PREVIEW_CATEGORY_SPECS[0];
  const legacyUMKM = {
    id: legacyPreviewUMKMDocumentId(fixture.key),
    slug: `uji-preview-netlify-${fixture.key}`,
    name: '[UJI PREVIEW NETLIFY] Tiwul Instan Mbah Sastro',
    status: 'draft',
    description: 'DATA UJI PREVIEW NETLIFY — bukan data usaha nyata.\nOlahan singkong.',
  };
  const legacyCategory = {
    id: legacyPreviewCategoryDocumentId(category.key),
    slug: category.legacySlug,
    name: 'Uji Preview Netlify - Olahan Pangan',
    sortOrder: category.sortOrder,
    active: true,
  };

  assert.equal(isOwnedLegacyPreviewUMKM(legacyUMKM, fixture), true);
  assert.equal(isLegacyPreviewUMKMIdentity({ ...legacyUMKM, status: 'published' }, fixture), true);
  assert.equal(isOwnedLegacyPreviewUMKM({ ...legacyUMKM, id: 'real-business' }, fixture), false);
  assert.equal(isOwnedLegacyPreviewUMKM({ ...legacyUMKM, description: 'Profil usaha biasa' }, fixture), false);
  assert.equal(isOwnedLegacyPreviewCategory(legacyCategory, category), true);
  assert.equal(isLegacyPreviewCategoryIdentity(legacyCategory, category), true);
  assert.equal(isOwnedLegacyPreviewCategory({ ...legacyCategory, id: 'real-category' }, category), false);
  assert.equal(isOwnedLegacyPreviewCategory({ ...legacyCategory, name: 'Kategori biasa' }, category), false);
});

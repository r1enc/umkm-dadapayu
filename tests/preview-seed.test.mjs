import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PREVIEW_CATEGORY_SPECS,
  PREVIEW_SEED_MARKER,
  PREVIEW_SEED_NAME_PREFIX,
  PREVIEW_UMKM_FIXTURES,
  isOwnedPreviewCategory,
  isOwnedPreviewUMKM,
  previewCategoryDocumentId,
  previewUMKMDocumentId,
  toPreviewUMKMDocument,
} from '../src/lib/admin/previewSeedData.mjs';

test('preview seed contains nine distinct, rule-compatible UMKM drafts', () => {
  assert.equal(PREVIEW_UMKM_FIXTURES.length, 9);
  assert.equal(new Set(PREVIEW_UMKM_FIXTURES.map(({ key }) => key)).size, 9);
  assert.equal(new Set(PREVIEW_CATEGORY_SPECS.map(({ key }) => key)).size, PREVIEW_CATEGORY_SPECS.length);

  for (const fixture of PREVIEW_UMKM_FIXTURES) {
    assert.ok(PREVIEW_CATEGORY_SPECS.some(({ key }) => key === fixture.categoryKey));
    const document = toPreviewUMKMDocument(fixture, 'existing-active-category', '2026-11-12T00:00:00.000Z');
    assert.deepEqual(Object.keys(document).sort(), [
      'address', 'categoryId', 'coverImage', 'createdAt', 'description', 'gallery', 'mapsUrl',
      'name', 'openingHours', 'products', 'shortDescription', 'slug', 'status', 'updatedAt', 'whatsapp',
    ].sort());
    assert.equal(document.status, 'draft');
    assert.ok(document.name.startsWith(PREVIEW_SEED_NAME_PREFIX));
    assert.ok(document.description.startsWith(PREVIEW_SEED_MARKER));
    assert.ok(document.whatsapp.length >= 10 && document.whatsapp.length <= 25);
    assert.ok(document.name.length <= 150);
    assert.ok(document.slug.length <= 150);
    assert.ok(document.address.length <= 300);
    assert.ok(document.shortDescription.length <= 500);
    assert.ok(document.description.length <= 5000);
    assert.ok(document.products.length <= 50);
    assert.equal(document.gallery.length, 0);
  }
});

test('preview cleanup ownership requires the exact deterministic document identity and marker', () => {
  const fixture = PREVIEW_UMKM_FIXTURES[0];
  const category = PREVIEW_CATEGORY_SPECS[0];
  const umkm = {
    id: previewUMKMDocumentId(fixture.key),
    slug: `uji-preview-netlify-${fixture.key}`,
    name: `${PREVIEW_SEED_NAME_PREFIX} ${fixture.name}`,
    status: 'draft',
    description: `${PREVIEW_SEED_MARKER}\n${fixture.description}`,
  };
  const categoryDocument = {
    id: previewCategoryDocumentId(category.key),
    slug: category.slug,
    name: `Uji Preview Netlify - ${category.label}`,
    sortOrder: category.sortOrder,
    active: true,
  };

  assert.equal(isOwnedPreviewUMKM(umkm, fixture), true);
  assert.equal(isOwnedPreviewUMKM({ ...umkm, id: 'real-business' }, fixture), false);
  assert.equal(isOwnedPreviewUMKM({ ...umkm, description: 'usaha biasa' }, fixture), false);
  assert.equal(isOwnedPreviewUMKM({ ...umkm, status: 'published' }, fixture), false);
  assert.equal(isOwnedPreviewCategory(categoryDocument, category), true);
  assert.equal(isOwnedPreviewCategory({ ...categoryDocument, id: 'real-category' }, category), false);
  assert.equal(isOwnedPreviewCategory({ ...categoryDocument, active: false }, category), false);
});

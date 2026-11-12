import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadCatalogData, loadHomepageData } from '../src/lib/services/publicDataCore.mjs';
import {
  findActiveCategoryById,
  findActiveCategoryBySlug,
  findPublishedUMKM,
  listPublishedByCategory,
} from '../src/lib/firebase/firestorePublicCore.mjs';
import {
  PUBLIC_PAGE_CACHE_TTL,
  isPublicPageRequest,
  withPublicPageCache,
} from '../src/lib/cache/publicPageCache.mjs';

const categories = [
  { id: 'cat-food', name: 'Makanan', slug: 'makanan', active: true, sortOrder: 1 },
  { id: 'cat-hidden', name: 'Lama', slug: 'lama', active: false, sortOrder: 2 },
];
const umkms = [
  { id: 'umkm-1', name: 'Tiwul Bu Sari', slug: 'tiwul-bu-sari', categoryId: 'cat-food', status: 'published', shortDescription: 'Tiwul', description: '', address: 'Dadapayu', products: [] },
  { id: 'umkm-2', name: 'Gatot Mbah', slug: 'gatot-mbah', categoryId: 'cat-food', status: 'published', shortDescription: 'Gatot', description: '', address: 'Dadapayu', products: [{ name: 'Gatot', description: 'Tiwul kering' }] },
  { id: 'umkm-3', name: 'Hidden', slug: 'hidden', categoryId: 'cat-food', status: 'draft', shortDescription: '', description: '', address: '', products: [] },
];

test('homepage loads each public collection once and derives featured items and count', async () => {
  let categoryReads = 0;
  let umkmReads = 0;
  const data = await loadHomepageData(async () => { categoryReads++; return categories; }, async () => { umkmReads++; return umkms.slice(0, 2); });
  assert.equal(categoryReads, 1);
  assert.equal(umkmReads, 1);
  assert.equal(data.featuredUMKM.length, 2);
  assert.equal(data.totalUMKM, 2);
});

test('catalog reuses one category and one UMKM read for count, filter, and search', async () => {
  let categoryReads = 0;
  let umkmReads = 0;
  const data = await loadCatalogData(async () => { categoryReads++; return categories; }, async () => { umkmReads++; return umkms.slice(0, 2); }, { categorySlug: 'makanan', query: 'kering' });
  assert.equal(categoryReads, 1);
  assert.equal(umkmReads, 1);
  assert.equal(data.total, 1);
  assert.equal(data.items[0].id, 'umkm-2');
  assert.equal(data.allPublished.length, 2);
});

function mockFirestore(rows = [], byId) {
  const calls = [];
  const api = {
    collection: (_db, name) => ({ name }),
    doc: (_db, collection, id) => ({ collection, id }),
    where: (field, op, value) => ({ type: 'where', field, op, value }),
    limit: (count) => ({ type: 'limit', count }),
    query: (collection, ...constraints) => ({ collection, constraints }),
    getDocs: async (query) => { calls.push({ type: 'query', query }); return { docs: rows }; },
    getDoc: async (ref) => {
      calls.push({ type: 'get', ref });
      return { id: ref.id, exists: () => Boolean(byId), data: () => byId };
    },
  };
  return { api, calls };
}

test('UMKM detail queries only one published slug, then falls back to a published document ID', async () => {
  const row = { id: 'doc-1', data: () => ({ slug: 'usaha-satu', status: 'published' }) };
  const direct = mockFirestore([row]);
  assert.deepEqual(await findPublishedUMKM({}, 'usaha-satu', direct.api), { id: 'doc-1', data: { slug: 'usaha-satu', status: 'published' } });
  assert.equal(direct.calls.length, 1);
  assert.deepEqual(direct.calls[0].query.constraints.map(({ field, op, value, count }) => [field, op, value, count]), [
    ['slug', '==', 'usaha-satu', undefined], ['status', '==', 'published', undefined], [undefined, undefined, undefined, 1],
  ]);

  const fallback = mockFirestore([], { slug: 'legacy-doc-id', status: 'published' });
  assert.equal((await findPublishedUMKM({}, 'legacy-doc-id', fallback.api)).id, 'legacy-doc-id');
  assert.deepEqual(fallback.calls.map((call) => call.type), ['query', 'get']);
});

test('category detail uses slug query or one active document read', async () => {
  const active = mockFirestore([{ id: 'cat-food', data: () => ({ slug: 'makanan', active: true }) }]);
  assert.equal((await findActiveCategoryBySlug({}, 'makanan', active.api)).id, 'cat-food');
  assert.equal(active.calls.length, 1);

  const byId = mockFirestore([], { slug: 'makanan', active: true });
  assert.equal((await findActiveCategoryById({}, 'makanan', byId.api)).id, 'makanan');
  assert.deepEqual(byId.calls.map((call) => call.type), ['get']);
});

test('related UMKM query filters category, published status, excludes current slug, and limits to three', async () => {
  const db = mockFirestore([
    { id: 'one', data: () => ({ status: 'published' }) },
    { id: 'two', data: () => ({ status: 'published' }) },
    { id: 'three', data: () => ({ status: 'published' }) },
  ]);
  const result = await listPublishedByCategory({}, 'cat-food', db.api, { excludeSlug: 'current', limit: 3 });
  assert.equal(result.length, 3);
  assert.deepEqual(db.calls[0].query.constraints.map((item) => item.type === 'where' ? [item.field, item.op, item.value] : ['limit', item.count]), [
    ['categoryId', '==', 'cat-food'], ['status', '==', 'published'], ['slug', '!=', 'current'], ['limit', 3],
  ]);
});

test('development demo store loaders stay shared, while production services have no mock fallback', async () => {
  const { createDemoStore } = await import('../src/lib/dev/demoStoreCore.mjs');
  const store = createDemoStore(umkms.slice(0, 2), categories);
  const home = await loadHomepageData(store.listCategories, store.listUMKM);
  const before = home.totalUMKM;
  const { id: _id, ...newDemoUMKM } = umkms[0];
  store.createUMKM({ ...newDemoUMKM, name: 'Demo baru', slug: 'demo-baru' });
  const catalog = await loadCatalogData(store.listCategories, store.listUMKM, { categorySlug: 'makanan' });
  assert.equal(catalog.total, before + 1);

  const [umkmService, categoryService] = await Promise.all([
    readFile(new URL('../src/lib/services/umkmService.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/services/categoryService.ts', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(umkmService, /mockUMKMList/);
  assert.doesNotMatch(categoryService, /mockCategories/);
  assert.match(umkmService, /if \(isDev\) return listDemoUMKM/);
  assert.match(umkmService, /if \(!isFirebaseConfigured\(\)\) return \[\]/);
  assert.match(categoryService, /if \(isDev\) return listDemoCategories/);
  assert.match(categoryService, /if \(!isFirebaseConfigured\(\)\) return \[\]/);
});

function createCache() {
  const entries = new Map();
  return {
    entries,
    storage: { default: {
      match: async (request) => entries.get(request.url)?.clone(),
      put: async (request, response) => { entries.set(request.url, response.clone()); },
    } },
  };
}

test('public HTML is stored for 60 seconds and served from Cache API on the next request', async () => {
  const cache = createCache();
  const request = new Request('https://catalog.test/katalog?kategori=makanan');
  let renders = 0;
  const next = async () => { renders++; return new Response('<h1>Katalog</h1>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); };
  const waiters = [];
  const first = await withPublicPageCache(request, next, cache.storage, { waitUntil: (promise) => waiters.push(promise) });
  await Promise.all(waiters);
  const second = await withPublicPageCache(request, next, cache.storage, { waitUntil: (promise) => waiters.push(promise) });
  assert.equal(PUBLIC_PAGE_CACHE_TTL, 60);
  assert.equal(first.headers.get('X-UMKM-Edge-Cache'), 'MISS');
  assert.equal(second.headers.get('X-UMKM-Edge-Cache'), 'HIT');
  assert.equal(second.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate');
  assert.equal(cache.entries.get(request.url).headers.get('Cache-Control'), 'public, max-age=60');
  assert.equal(renders, 1);
});

test('admin, API, and cookie-bearing requests bypass public cache', async () => {
  const cache = createCache();
  const paths = [
    new Request('https://catalog.test/admin/dashboard'),
    new Request('https://catalog.test/admin/login'),
    new Request('https://catalog.test/api/admin/umkm'),
    new Request('https://catalog.test/katalog', { headers: { Cookie: '__Host-admin_session=secret' } }),
  ];
  for (const [index, request] of paths.entries()) {
    assert.equal(isPublicPageRequest(request), false);
    let renders = 0;
    const response = await withPublicPageCache(request, async () => { renders++; return new Response('private', { headers: { 'Cache-Control': 'private, no-store' } }); }, cache.storage);
    assert.equal(response.headers.get('X-UMKM-Edge-Cache'), index === 3 ? 'BYPASS' : null);
    if (index === 3) assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(renders, 1);
  }
  assert.equal(cache.entries.size, 0);
});

test('non-HTML and Set-Cookie responses are never stored', async () => {
  const cache = createCache();
  const request = new Request('https://catalog.test/');
  const xml = await withPublicPageCache(request, async () => new Response('{}', { headers: { 'Content-Type': 'application/json' } }), cache.storage);
  assert.equal(xml.headers.get('X-UMKM-Edge-Cache'), 'BYPASS');
  const personalized = await withPublicPageCache(request, async () => new Response('<p>user</p>', { headers: { 'Content-Type': 'text/html', 'Set-Cookie': 'session=secret' } }), cache.storage);
  assert.equal(personalized.headers.get('X-UMKM-Edge-Cache'), 'BYPASS');
  assert.equal(personalized.headers.get('Cache-Control'), 'private, no-store');
  const privateResponse = await withPublicPageCache(request, async () => new Response('<p>private</p>', { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'private, no-store' } }), cache.storage);
  assert.equal(privateResponse.headers.get('Cache-Control'), 'private, no-store');
  const varied = await withPublicPageCache(request, async () => new Response('<p>varied</p>', { headers: { 'Content-Type': 'text/html', Vary: 'Cookie' } }), cache.storage);
  assert.equal(varied.headers.get('X-UMKM-Edge-Cache'), 'BYPASS');
  assert.equal(cache.entries.size, 0);
});

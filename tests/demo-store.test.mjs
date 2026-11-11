import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoStore } from '../src/lib/dev/demoStoreCore.mjs';

test('demo store starts from shared fixtures and supports UMKM CRUD', () => {
  const store = createDemoStore([{ id: 'u1', slug: 'awal', createdAt: 't0', name: 'Awal' }], []);
  assert.equal(store.listUMKM()[0].name, 'Awal');
  const id = store.createUMKM({ slug: 'baru', name: 'Baru', createdAt: 't1' });
  assert.equal(store.getUMKM(id).name, 'Baru');
  assert.equal(store.updateUMKM('u1', { name: 'Diubah', createdAt: 't2' }), true);
  assert.equal(store.getUMKM('u1').name, 'Diubah');
  assert.equal(store.getUMKM('u1').createdAt, 't0');
  assert.equal(store.deleteUMKM(id), true);
  assert.equal(store.getUMKM(id), null);
});

test('demo store supports category CRUD', () => {
  const store = createDemoStore([], [{ id: 'c1', name: 'Awal', createdAt: 't0' }]);
  const id = store.createCategory({ name: 'Baru' });
  assert.equal(store.updateCategory('c1', { name: 'Diubah' }), true);
  assert.equal(store.listCategories().find((item) => item.id === 'c1').name, 'Diubah');
  assert.equal(store.deleteCategory(id), true);
  assert.equal(store.listCategories().length, 1);
});

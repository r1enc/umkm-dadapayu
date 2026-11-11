const clone = (value) => structuredClone(value);

export function createDemoStore(initialUMKM, initialCategories) {
  let umkm = clone(initialUMKM);
  let categories = clone(initialCategories);

  return {
    listUMKM: () => clone(umkm),
    getUMKM: (id) => clone(umkm.find((item) => item.id === id || item.slug === id) || null),
    createUMKM: (data) => {
      const id = `demo-${crypto.randomUUID()}`;
      umkm.push({ id, ...clone(data) });
      return id;
    },
    updateUMKM: (id, data) => {
      const index = umkm.findIndex((item) => item.id === id);
      if (index < 0) return false;
      umkm[index] = { ...umkm[index], ...clone(data), id, createdAt: umkm[index].createdAt };
      return true;
    },
    deleteUMKM: (id) => {
      const next = umkm.filter((item) => item.id !== id);
      if (next.length === umkm.length) return false;
      umkm = next;
      return true;
    },
    listCategories: () => clone(categories),
    createCategory: (data) => {
      const id = `demo-${crypto.randomUUID()}`;
      categories.push({ id, ...clone(data) });
      return id;
    },
    updateCategory: (id, data) => {
      const index = categories.findIndex((item) => item.id === id);
      if (index < 0) return false;
      categories[index] = { ...categories[index], ...clone(data), id, createdAt: categories[index].createdAt };
      return true;
    },
    deleteCategory: (id) => {
      const next = categories.filter((item) => item.id !== id);
      if (next.length === categories.length) return false;
      categories = next;
      return true;
    },
  };
}

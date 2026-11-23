export async function findPublishedUMKM(db, slug, api) {
  const bySlug = await api.getDocs(api.query(
    api.collection(db, 'umkms'),
    api.where('slug', '==', slug),
    api.where('status', '==', 'published'),
    api.limit(1),
  ));
  const match = bySlug.docs[0];
  if (match) return { id: match.id, data: match.data() };

  const byId = await api.getDoc(api.doc(db, 'umkms', slug));
  if (!byId.exists() || byId.data().status !== 'published') return undefined;
  return { id: byId.id, data: byId.data() };
}

export async function findActiveCategoryBySlug(db, slug, api) {
  const bySlug = await api.getDocs(api.query(
    api.collection(db, 'categories'),
    api.where('slug', '==', slug),
    api.where('active', '==', true),
    api.limit(1),
  ));
  const match = bySlug.docs[0];
  if (match) return { id: match.id, data: match.data() };

  const byId = await api.getDoc(api.doc(db, 'categories', slug));
  if (!byId.exists() || byId.data().active !== true) return undefined;
  return { id: byId.id, data: byId.data() };
}

export async function findActiveCategoryById(db, id, api) {
  const snapshot = await api.getDoc(api.doc(db, 'categories', id));
  if (!snapshot.exists() || snapshot.data().active !== true) return undefined;
  return { id: snapshot.id, data: snapshot.data() };
}

export async function listPublishedByCategory(db, categoryId, api, options = {}) {
  const constraints = [
    api.where('categoryId', '==', categoryId),
    api.where('status', '==', 'published'),
  ];
  if (options.excludeSlug) constraints.push(api.where('slug', '!=', options.excludeSlug));
  if (Number.isInteger(options.limit) && options.limit > 0) constraints.push(api.limit(options.limit));
  const snapshot = await api.getDocs(api.query(api.collection(db, 'umkms'), ...constraints));
  return snapshot.docs.map((item) => ({ id: item.id, data: item.data() }));
}

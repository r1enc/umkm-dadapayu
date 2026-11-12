export function filterPublishedUMKM(items, categories, { query = '', categorySlug = 'semua' } = {}) {
  const category = categorySlug === 'semua' ? undefined : categories.find((item) => item.slug === categorySlug);
  let results = category ? items.filter((item) => item.categoryId === category.id) : items;
  const term = query.trim().toLowerCase();

  if (term) {
    results = results.filter((item) =>
      item.name.toLowerCase().includes(term) ||
      item.shortDescription.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.address.toLowerCase().includes(term) ||
      item.products.some((product) => product.name.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term)),
    );
  }

  return { items: results, total: results.length, category };
}

export async function loadHomepageData(fetchCategories, fetchPublishedUMKM) {
  const [categories, allPublished] = await Promise.all([fetchCategories(), fetchPublishedUMKM()]);
  return { categories, allPublished, featuredUMKM: allPublished.slice(0, 6), totalUMKM: allPublished.length };
}

export async function loadCatalogData(fetchCategories, fetchPublishedUMKM, params) {
  const [categories, allPublished] = await Promise.all([fetchCategories(), fetchPublishedUMKM()]);
  return { categories, allPublished, ...filterPublishedUMKM(allPublished, categories, params) };
}

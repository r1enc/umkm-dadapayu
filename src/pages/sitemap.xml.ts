import type { APIRoute } from 'astro';
import { fetchCategories } from '../lib/services/categoryService';
import { fetchPublishedUMKM } from '../lib/services/umkmService';

export const GET: APIRoute = async ({ url }) => {
  const siteUrl = url.origin;
  const categories = await fetchCategories();
  const umkmList = await fetchPublishedUMKM();

  const staticRoutes = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/katalog`, changefreq: 'daily', priority: '0.9' },
    { loc: `${siteUrl}/kategori`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${siteUrl}/tentang`, changefreq: 'monthly', priority: '0.7' },
  ];

  const categoryRoutes = categories.map((cat) => ({
    loc: `${siteUrl}/kategori/${cat.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const umkmRoutes = umkmList.map((umkm) => ({
    loc: `${siteUrl}/umkm/${umkm.slug}`,
    changefreq: 'weekly',
    priority: '0.85',
    lastmod: umkm.updatedAt ? new Date(umkm.updatedAt).toISOString() : new Date().toISOString(),
  }));

  const allUrls = [...staticRoutes, ...categoryRoutes, ...umkmRoutes];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map((u) => {
    return `  <url>
    <loc>${u.loc}</loc>
    ${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};

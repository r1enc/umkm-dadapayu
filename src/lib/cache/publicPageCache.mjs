export const PUBLIC_PAGE_CACHE_TTL = 60;
export const PUBLIC_PAGE_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

export function isPublicPagePath(path) {
  return path === '/' || path === '/katalog' || path === '/kategori' || path === '/tentang' || path === '/sitemap.xml' ||
    /^\/(?:kategori|umkm)\/[^/]+\/?$/.test(path);
}

export function isPublicPageRequest(request) {
  if (request.method !== 'GET' || request.headers.has('cookie') || request.headers.has('authorization')) return false;
  const path = new URL(request.url).pathname;
  return isPublicPagePath(path);
}

function withCacheHeaders(response, status, cacheControl = PUBLIC_PAGE_CACHE_CONTROL) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', cacheControl);
  headers.set('X-UMKM-Edge-Cache', status);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function bypass(response, isCredentialedRequest = false) {
  const cacheControl = isCredentialedRequest || response.headers.has('Set-Cookie') || /\b(?:private|no-store)\b/i.test(response.headers.get('Cache-Control') || '')
    ? 'private, no-store'
    : PUBLIC_PAGE_CACHE_CONTROL;
  return withCacheHeaders(response, 'BYPASS', cacheControl);
}

export async function withPublicPageCache(request, next, caches, executionContext) {
  if (!isPublicPagePath(new URL(request.url).pathname)) return next();
  if (!isPublicPageRequest(request)) return bypass(await next(), true);
  if (!caches?.default) return bypass(await next());

  const key = new Request(request.url, { method: 'GET' });
  let cached;
  try {
    cached = await caches.default.match(key);
  } catch {
    return bypass(await next());
  }
  if (cached) return withCacheHeaders(cached, 'HIT');

  const response = await next();
  if (response.status !== 200 || !/^text\/(?:html|xml)|application\/(?:xml|xhtml\+xml)/i.test(response.headers.get('Content-Type') || '') || response.headers.has('Set-Cookie') || /\b(?:private|no-store)\b/i.test(response.headers.get('Cache-Control') || '') || /(?:^|,)\s*(?:\*|cookie|authorization)\s*(?:,|$)/i.test(response.headers.get('Vary') || '')) {
    return bypass(response);
  }

  const storedHeaders = new Headers(response.headers);
  storedHeaders.set('Cache-Control', `public, max-age=${PUBLIC_PAGE_CACHE_TTL}`);
  storedHeaders.set('X-UMKM-Edge-Cache', 'HIT');
  const storedResponse = new Response(response.clone().body, { status: response.status, statusText: response.statusText, headers: storedHeaders });
  const write = caches.default.put(key, storedResponse).catch(() => undefined);
  if (executionContext?.waitUntil) executionContext.waitUntil(write);
  else await write;
  return withCacheHeaders(response, 'MISS');
}

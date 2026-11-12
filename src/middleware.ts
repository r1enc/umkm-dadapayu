import { defineMiddleware } from 'astro:middleware';
import { verifyAdminSession } from './lib/firebase/verifyAdmin';
import { withPublicPageCache } from './lib/cache/publicPageCache.mjs';

const SESSION_COOKIE = '__Host-admin_session';
type CloudflareRuntime = {
  env?: Record<string, string>;
  caches?: { default?: { match: (request: Request) => Promise<Response | undefined>; put: (request: Request, response: Response) => Promise<void> } };
  ctx?: { waitUntil: (promise: Promise<unknown>) => void };
};

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname === '/admin' || context.url.pathname.startsWith('/admin/')) {
    if (context.url.pathname !== '/admin/login') {
      const runtime = context.locals.runtime as unknown as CloudflareRuntime | undefined;
      const admin = await verifyAdminSession(context.request, runtime?.env || {});
      if (!admin.verified) {
        const response = context.redirect('/admin/login', 302);
        response.headers.set('Cache-Control', 'no-store, private');
        response.headers.append('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
        return response;
      }

      context.locals.admin = { uid: admin.uid, email: admin.email, role: admin.role };
    }

    const response = await next();
    response.headers.set('Cache-Control', 'no-store, private');
    return response;
  }

  const runtime = context.locals.runtime as unknown as CloudflareRuntime | undefined;
  return withPublicPageCache(context.request, next, runtime?.caches, runtime?.ctx);
});

import { defineMiddleware } from 'astro:middleware';
import { verifyAdminRequest } from './lib/firebase/verifyAdmin';

const SESSION_COOKIE = '__Host-admin_session';

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.url.pathname.startsWith('/admin/') || context.url.pathname === '/admin/login') {
    return next();
  }

  const env = (context.locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  const admin = await verifyAdminRequest(context.request, env);
  if (!admin.verified) {
    const response = context.redirect('/admin/login', 302);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.append('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    return response;
  }

  context.locals.admin = { uid: admin.uid, email: admin.email, role: admin.role };
  const response = await next();
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
});

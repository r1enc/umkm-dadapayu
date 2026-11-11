import type { APIRoute } from 'astro';
import { verifyAdminRequest } from '../../../lib/firebase/verifyAdmin';

const cookieName = '__Host-admin_session';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  const headers = new Headers(request.headers);
  headers.delete('Cookie');
  const result = await verifyAdminRequest(new Request(request, { headers }), env);
  if (!result.verified) return Response.json({ error: result.error, code: result.code }, { status: result.status });
  const token = /^Bearer\s+(.+)$/i.exec(request.headers.get('Authorization') || '')?.[1]?.trim();
  if (!token) return Response.json({ error: 'Token tidak ditemukan.' }, { status: 401 });
  return Response.json({ success: true, email: result.email }, {
    headers: {
      'Cache-Control': 'no-store',
      'Set-Cookie': `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`,
    },
  });
};

export const DELETE: APIRoute = async () => new Response(null, {
  status: 204,
  headers: {
    'Cache-Control': 'no-store',
    'Set-Cookie': `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  },
});

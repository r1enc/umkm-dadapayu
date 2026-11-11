import type { APIRoute } from 'astro';
import { verifyAdminRequest } from '../../../lib/firebase/verifyAdmin';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  const result = await verifyAdminRequest(request, env);
  const body = result.verified
    ? { verified: true, uid: result.uid, role: result.role }
    : { verified: false, code: result.code, error: result.error };
  return new Response(JSON.stringify(body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};

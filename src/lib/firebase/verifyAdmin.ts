import { getFirebaseConfig } from './config';
import { verifyAdminRequestCore } from './verifyAdminCore.mjs';

export interface VerifiedAdmin {
  verified: boolean;
  status: number;
  code?: string;
  uid?: string;
  email?: string;
  role?: 'admin' | 'superadmin';
  error?: string;
}

/** Verify a Firebase ID token and its admins/{UID} record without exposing the token in logs. */
export async function verifyAdminRequest(
  request: Request,
  env?: Record<string, string>
): Promise<VerifiedAdmin> {
  const config = getFirebaseConfig();
  const projectId = config?.projectId;
  const apiKey = env?.PUBLIC_FIREBASE_API_KEY || config?.apiKey;
  const result = await verifyAdminRequestCore(request, { projectId, apiKey }) as VerifiedAdmin;

  if (!result.verified) {
    console.warn('[VerifyAdmin] Admin verification rejected', {
      projectId: projectId || 'missing',
      status: result.status,
      code: result.code,
      uid: result.uid,
      documentPath: result.uid ? `admins/${result.uid}` : undefined,
    });
  } else {
    console.info('[VerifyAdmin] Admin verification succeeded', {
      projectId,
      uid: result.uid,
      documentPath: `admins/${result.uid}`,
      role: result.role,
    });
  }
  return result;
}

/** API routes call this variant so a caller cannot replace the session cookie with another user's bearer token. */
export async function verifyAdminSession(request: Request, env?: Record<string, string>): Promise<VerifiedAdmin> {
  const headers = new Headers(request.headers);
  headers.delete('Authorization');
  return verifyAdminRequest(new Request(request.url, { method: 'GET', headers }), env);
}

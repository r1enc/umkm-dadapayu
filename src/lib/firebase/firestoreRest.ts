import type { VerifiedAdmin } from './verifyAdmin';
import { executeFirestoreRequest, FirestoreRestError } from './firestoreRestCore.mjs';
export { FirestoreRestError } from './firestoreRestCore.mjs';

const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
const SESSION_COOKIE = '__Host-admin_session';

export function sessionToken(request: Request): string {
  const value = (request.headers.get('Cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return value ? decodeURIComponent(value.slice(SESSION_COOKIE.length + 1)) : '';
}

export function bearerToken(request: Request): string {
  const header = request.headers.get('Authorization') || '';
  return sessionToken(request) || /^Bearer\s+(.+)$/i.exec(header)?.[1]?.trim() || '';
}

function root() {
  if (!projectId) throw new FirestoreRestError(500, 'firebase-not-configured', 'Project Firebase belum dikonfigurasi.');
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;
}

export const firestoreDocument = (collection: string, id: string) => `${encodeURIComponent(collection)}/${encodeURIComponent(id)}`;
export const firestoreCollection = (collection: string) => encodeURIComponent(collection);

function encodeValue(value: unknown): Record<string, unknown> {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, encodeValue(item)])) } };
  throw new TypeError('Nilai Firestore tidak didukung.');
}

function decodeValue(value: any): any {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, decodeValue(item)]));
  return undefined;
}

export const firestoreFields = (data: Record<string, unknown>) => ({ fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)])) });
export const firestoreData = (doc: any) => Object.fromEntries(Object.entries(doc?.fields || {}).map(([key, value]) => [key, decodeValue(value)]));
export const firestoreDocumentData = (doc: any) => ({ id: String(doc?.name || '').split('/').pop() || '', ...firestoreData(doc) });

export async function firestoreRequest(request: Request, admin: VerifiedAdmin, path: string, method = 'GET', body?: unknown) {
  if (!admin.verified) throw new FirestoreRestError(403, 'admin-required', 'Akses admin ditolak.');
  const token = sessionToken(request);
  return executeFirestoreRequest(fetch, { root: root(), path, token, method, body });
}

export async function firestoreCreate(request: Request, admin: VerifiedAdmin, collection: string, data: Record<string, unknown>, documentId: string = crypto.randomUUID()) {
  const id = documentId;
  await firestoreRequest(request, admin, `${firestoreCollection(collection)}?documentId=${encodeURIComponent(id)}`, 'POST', firestoreFields(data));
  return id;
}
export const firestoreGet = (request: Request, admin: VerifiedAdmin, collection: string, id: string) => firestoreRequest(request, admin, firestoreDocument(collection, id));
export async function firestoreUpdate(request: Request, admin: VerifiedAdmin, collection: string, id: string, data: Record<string, unknown>) {
  const masks = Object.keys(data).map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&');
  return firestoreRequest(request, admin, `${firestoreDocument(collection, id)}?${masks}`, 'PATCH', firestoreFields(data));
}
export const firestoreDelete = (request: Request, admin: VerifiedAdmin, collection: string, id: string) => firestoreRequest(request, admin, firestoreDocument(collection, id), 'DELETE');
export async function firestoreList(request: Request, admin: VerifiedAdmin, collection: string) {
  const documents: Record<string, any>[] = [];
  let pageToken = '';
  do {
    const query = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : '';
    const result = await firestoreRequest(request, admin, `${firestoreCollection(collection)}${query}`);
    documents.push(...(result?.documents || []).map(firestoreDocumentData));
    pageToken = result?.nextPageToken || '';
  } while (pageToken);
  return documents;
}
export async function firestoreQueryEqual(request: Request, admin: VerifiedAdmin, collection: string, field: string, value: string) {
  const result = await firestoreRequest(request, admin, ':runQuery', 'POST', { structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: encodeValue(value) } } } });
  return (result || []).map((item: any) => item.document).filter(Boolean).map(firestoreDocumentData);
}
export function firestoreErrorResponse(error: unknown) {
  if (error instanceof FirestoreRestError) return Response.json({ error: error.message, code: error.code }, { status: error.status, headers: { 'Cache-Control': 'no-store', ...(error.status === 401 ? { 'Set-Cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } : {}) } });
  return Response.json({ error: error instanceof Error ? error.message : 'Kesalahan Firestore tidak diketahui.', code: 'firestore-error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
}

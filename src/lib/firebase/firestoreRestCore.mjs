export class FirestoreRestError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; this.name = 'FirestoreRestError'; }
}

export async function executeFirestoreRequest(fetchImpl, { root, path, token, method = 'GET', body }) {
  if (!token) throw new FirestoreRestError(401, 'missing-session', 'Sesi admin tidak ditemukan. Silakan masuk kembali.');
  const url = path.startsWith(':') ? `${root}${path}` : `${root}/${path}`;
  let response;
  try {
    response = await fetchImpl(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new FirestoreRestError(502, 'firestore-network-error', 'Tidak dapat menghubungi Firestore.');
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const status = response.status;
    const code = status === 401 ? 'session-expired' : status === 403 ? 'permission-denied' : status === 404 ? 'not-found' : 'firestore-request-failed';
    throw new FirestoreRestError(status, code, String(data?.error?.message || `Firestore request gagal (HTTP ${status}).`));
  }
  return response.status === 204 ? null : response.json();
}

const failure = (status, code, error) => ({ verified: false, status, code, error });

/** Verify an ID token and resolve its admins/{uid} document through Firestore REST. */
export async function verifyAdminRequestCore(request, { projectId, apiKey, fetchImpl = fetch }) {
  const authHeader = request.headers.get('Authorization') || '';
  const cookieToken = request.headers.get('Cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith('__Host-admin_session='))?.slice('__Host-admin_session='.length);
  // Credentialed API requests must use the freshly supplied ID token even if
  // the browser also sends an older session cookie. Page middleware calls
  // verifyAdminSession(), which removes Authorization and therefore remains
  // cookie-only.
  const match = /^Bearer\s+(.+)$/i.exec(authHeader) || (cookieToken ? [cookieToken, cookieToken] : null);
  if (!match) return failure(401, 'missing-token', 'Token autentikasi tidak ditemukan.');
  const idToken = match[1].trim();
  if (!idToken) return failure(401, 'missing-token', 'Token autentikasi tidak ditemukan.');
  if (!projectId || !apiKey) {
    return failure(500, 'firebase-not-configured', 'Konfigurasi Firebase server belum lengkap.');
  }

  let authResponse;
  try {
    authResponse = await fetchImpl(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    return failure(502, 'auth-network-error', 'Tidak dapat menghubungi Firebase Authentication.');
  }
  if (!authResponse.ok) {
    const authError = await authResponse.json().catch(() => ({}));
    const authReason = String(authError?.error?.message || '').toUpperCase();
    if (authReason.includes('API_KEY') || authReason.includes('CONFIGURATION_NOT_FOUND') || authReason.includes('API KEY NOT VALID')) {
      return failure(500, 'firebase-auth-config-error', 'Firebase Authentication API key atau project belum dikonfigurasi dengan benar.');
    }
    return failure(authResponse.status >= 500 ? 502 : 401, 'invalid-token', 'Token Firebase tidak valid atau tidak dapat diverifikasi.');
  }

  let authData;
  try { authData = await authResponse.json(); } catch {
    return failure(502, 'auth-invalid-response', 'Respons Firebase Authentication tidak dapat dibaca.');
  }
  const user = authData?.users?.[0];
  if (!user?.localId || !user?.email) {
    return failure(401, 'auth-user-missing', 'Identitas akun tidak ditemukan pada token Firebase.');
  }

  const uid = user.localId;
  const documentPath = `admins/${uid}`;
  const adminUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${documentPath.split('/').map(encodeURIComponent).join('/')}`;
  let adminResponse;
  try {
    adminResponse = await fetchImpl(adminUrl, { headers: { Authorization: `Bearer ${idToken}` } });
  } catch {
    return { ...failure(502, 'firestore-network-error', 'Tidak dapat menghubungi Firestore untuk memeriksa admin.'), uid };
  }
  if (adminResponse.status === 404) {
    const details = await adminResponse.json().catch(() => ({}));
    const reason = String(details?.error?.message || '');
    const databaseMissing = /database.{0,80}(not found|does not exist|not exist)/i.test(reason);
    return {
      ...failure(404, databaseMissing ? 'firestore-database-not-found' : 'firestore-resource-not-found',
        databaseMissing
          ? `Database Firestore (default) tidak ditemukan pada project ${projectId}.`
          : `Firestore mengembalikan HTTP 404 untuk ${documentPath} pada project ${projectId}, database (default). Periksa path dokumen dan konfigurasi database.`),
      uid,
    };
  }
  if (adminResponse.status === 403) {
    return { ...failure(403, 'firestore-permission-denied', 'Firestore menolak pembacaan dokumen admin. Periksa izin baca untuk UID yang login.'), uid };
  }
  if (!adminResponse.ok) {
    return { ...failure(adminResponse.status >= 500 ? 502 : adminResponse.status, 'firestore-request-failed', `Firestore gagal memeriksa dokumen admin (HTTP ${adminResponse.status}).`), uid };
  }

  let adminDoc;
  try { adminDoc = await adminResponse.json(); } catch {
    return { ...failure(502, 'firestore-invalid-response', 'Respons dokumen admin dari Firestore tidak dapat dibaca.'), uid };
  }
  const fields = adminDoc?.fields;
  const role = fields?.role?.stringValue;
  const storedUid = fields?.uid?.stringValue;
  const storedEmail = fields?.email?.stringValue;
  if (storedUid && storedUid !== uid) {
    return { ...failure(403, 'admin-uid-mismatch', 'Field uid pada dokumen admin tidak cocok dengan UID akun.'), uid };
  }
  if (!storedEmail || storedEmail.toLowerCase() !== user.email.toLowerCase()) {
    return { ...failure(403, 'admin-email-mismatch', 'Email pada dokumen admin tidak cocok dengan akun Firebase.'), uid };
  }
  if (role !== 'admin' && role !== 'superadmin') {
    return { ...failure(403, 'admin-role-invalid', 'Role pada dokumen admin bukan admin atau superadmin.'), uid };
  }
  return { verified: true, status: 200, uid, email: user.email, role };
}

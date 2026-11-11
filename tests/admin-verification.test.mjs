import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAdminRequestCore } from '../src/lib/firebase/verifyAdminCore.mjs';

const uid = 'test-admin-uid-123';
const idToken = 'test-id-token';
const projectId = 'umkm-dadapayu-test';
const userResponse = () => Response.json({ users: [{ localId: uid, email: 'admin@example.com' }] });
const request = (token = idToken) => new Request('https://app.test/api/admin/verify', {
  method: 'POST',
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

test('verifies token, looks up admins/{UID}, and parses a valid admin document', async () => {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (calls.length === 1) return userResponse();
    return Response.json({ fields: {
      email: { stringValue: 'admin@example.com' },
      role: { stringValue: 'admin' },
      uid: { stringValue: uid },
    } });
  };
  const result = await verifyAdminRequestCore(request(), { projectId, apiKey: 'test-api-key', fetchImpl });
  assert.equal(result.verified, true);
  assert.equal(result.uid, uid);
  assert.equal(result.role, 'admin');
  assert.match(calls[1].url, new RegExp(`/projects/${projectId}/databases/\\(default\\)/documents/admins/${uid}$`));
  assert.equal(calls[1].init.headers.Authorization, `Bearer ${idToken}`);
});

test('accepts the HttpOnly session cookie for server-side page verification', async () => {
  const calls = [];
  const sessionRequest = new Request('https://app.test/admin/dashboard', {
    headers: { Cookie: `__Host-admin_session=${idToken}` },
  });
  const result = await verifyAdminRequestCore(sessionRequest, {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async (url, init = {}) => {
      calls.push({ url: String(url), init });
      return calls.length === 1 ? userResponse() : Response.json({ fields: {
        email: { stringValue: 'admin@example.com' }, role: { stringValue: 'admin' }, uid: { stringValue: uid },
      } });
    },
  });
  assert.equal(result.verified, true);
  assert.equal(calls[1].init.headers.Authorization, `Bearer ${idToken}`);
});

test('a fresh Authorization token takes precedence over a stale session cookie', async () => {
  const calls = [];
  const sessionRequest = new Request('https://app.test/admin/dashboard', {
    headers: { Cookie: `__Host-admin_session=${idToken}`, Authorization: 'Bearer fresh-id-token' },
  });
  const result = await verifyAdminRequestCore(sessionRequest, {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async (url, init = {}) => {
      calls.push({ url: String(url), init });
      return calls.length === 1 ? userResponse() : Response.json({ fields: {
        email: { stringValue: 'admin@example.com' }, role: { stringValue: 'admin' }, uid: { stringValue: uid },
      } });
    },
  });
  assert.equal(result.verified, true);
  assert.equal(JSON.parse(calls[0].init.body).idToken, 'fresh-id-token');
});

test('rejects requests without a session token before contacting Firebase', async () => {
  let calls = 0;
  const result = await verifyAdminRequestCore(new Request('https://app.test/admin/dashboard'), {
    projectId, apiKey: 'test-api-key', fetchImpl: async () => { calls += 1; return Response.json({}); },
  });
  assert.equal(result.status, 401);
  assert.equal(result.code, 'missing-token');
  assert.equal(calls, 0);
});

test('rejects an expired Firebase ID token', async () => {
  const result = await verifyAdminRequestCore(request(), {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async () => Response.json({ error: { message: 'TOKEN_EXPIRED' } }, { status: 400 }),
  });
  assert.equal(result.status, 401);
  assert.equal(result.code, 'invalid-token');
});

test('returns a distinct not-found result for a missing admin document', async () => {
  let calls = 0;
  const result = await verifyAdminRequestCore(request(), {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async () => ++calls === 1 ? userResponse() : new Response('{}', { status: 404 }),
  });
  assert.equal(result.status, 404);
  assert.equal(result.code, 'firestore-resource-not-found');
  assert.equal(result.uid, uid);
});

test('distinguishes a missing Firestore database from a missing document', async () => {
  let calls = 0;
  const result = await verifyAdminRequestCore(request(), {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async () => ++calls === 1 ? userResponse() : Response.json({ error: { message: "Database '(default)' does not exist." } }, { status: 404 }),
  });
  assert.equal(result.status, 404);
  assert.equal(result.code, 'firestore-database-not-found');
});

test('reports Firebase API key configuration separately from an invalid user token', async () => {
  const result = await verifyAdminRequestCore(request(), {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async () => Response.json({ error: { message: 'API_KEY_INVALID' } }, { status: 400 }),
  });
  assert.equal(result.status, 500);
  assert.equal(result.code, 'firebase-auth-config-error');
});

test('keeps Firestore permission denial separate from missing document', async () => {
  let calls = 0;
  const result = await verifyAdminRequestCore(request(), {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async () => ++calls === 1 ? userResponse() : new Response('{}', { status: 403 }),
  });
  assert.equal(result.status, 403);
  assert.equal(result.code, 'firestore-permission-denied');
});

test('returns a network error instead of treating it as a non-admin', async () => {
  let calls = 0;
  const result = await verifyAdminRequestCore(request(), {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async () => {
      if (++calls === 1) return userResponse();
      throw new TypeError('network unavailable');
    },
  });
  assert.equal(result.status, 502);
  assert.equal(result.code, 'firestore-network-error');
});

test('rejects an invalid role after reading the document', async () => {
  let calls = 0;
  const result = await verifyAdminRequestCore(request(), {
    projectId, apiKey: 'test-api-key',
    fetchImpl: async () => ++calls === 1 ? userResponse() : Response.json({ fields: {
      email: { stringValue: 'admin@example.com' },
      role: { stringValue: 'viewer' },
      uid: { stringValue: uid },
    } }),
  });
  assert.equal(result.status, 403);
  assert.equal(result.code, 'admin-role-invalid');
});

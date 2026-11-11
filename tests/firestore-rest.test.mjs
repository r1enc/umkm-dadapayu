import test from 'node:test';
import assert from 'node:assert/strict';
import { executeFirestoreRequest, FirestoreRestError } from '../src/lib/firebase/firestoreRestCore.mjs';

test('REST request forwards the Firebase session ID token and decodes document response', async () => {
  let captured;
  const result = await executeFirestoreRequest(async (url, init) => {
    captured = { url, init };
    return Response.json({ name: 'projects/demo/databases/(default)/documents/categories/cat_test', fields: { name: { stringValue: 'Uji' } } });
  }, { root: 'https://firestore.googleapis.com/v1/projects/demo/databases/(default)/documents', path: 'categories/cat_test', token: 'verified-id-token' });
  assert.equal(captured.init.headers.Authorization, 'Bearer verified-id-token');
  assert.equal(captured.url.endsWith('/categories/cat_test'), true);
  assert.equal(result.fields.name.stringValue, 'Uji');
});

test('REST request reports expired session and permission errors distinctly', async () => {
  for (const [status, expected] of [[401, 'session-expired'], [403, 'permission-denied'], [404, 'not-found']]) {
    await assert.rejects(executeFirestoreRequest(async () => Response.json({ error: { message: 'denied' } }, { status }), {
      root: 'https://firestore.googleapis.com/v1/x', path: 'categories/a', token: 'id-token',
    }), (error) => error instanceof FirestoreRestError && error.status === status && error.code === expected);
  }
});

test('REST request does not call Firestore without a session token', async () => {
  let called = false;
  await assert.rejects(executeFirestoreRequest(async () => { called = true; return Response.json({}); }, {
    root: 'https://firestore.googleapis.com/v1/x', path: 'categories/a', token: '',
  }), (error) => error.code === 'missing-session');
  assert.equal(called, false);
});

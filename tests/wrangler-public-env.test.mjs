import assert from 'node:assert/strict';
import test from 'node:test';
import { parseWranglerPublicEnv, PUBLIC_BUILD_VARIABLES } from '../scripts/wrangler-public-env.mjs';

const config = (vars) => `{
  // JSONC comments and trailing commas are supported.
  "name": "test",
  "vars": ${JSON.stringify(vars)},
}`;

const publicValues = Object.fromEntries(PUBLIC_BUILD_VARIABLES.map((name) => [name, `public-${name}`]));

test('loads only public build variables from Wrangler JSONC', () => {
  const values = parseWranglerPublicEnv(config({ ...publicValues, UNRELATED: 'ignored' }));
  assert.deepEqual(values, publicValues);
});

test('reports missing public variables by name without values', () => {
  assert.throws(() => parseWranglerPublicEnv(config({})), (error) => {
    assert.match(error.message, /PUBLIC_FIREBASE_API_KEY/);
    assert.doesNotMatch(error.message, /public-/);
    return true;
  });
});

test('refuses private credentials in Wrangler vars', () => {
  assert.throws(
    () => parseWranglerPublicEnv(config({ ...publicValues, CLOUDINARY_API_SECRET: 'private-value' })),
    /CLOUDINARY_API_SECRET/,
  );
});

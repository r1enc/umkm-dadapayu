import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export const PUBLIC_BUILD_VARIABLES = [
  'PUBLIC_FIREBASE_API_KEY',
  'PUBLIC_FIREBASE_AUTH_DOMAIN',
  'PUBLIC_FIREBASE_PROJECT_ID',
  'PUBLIC_FIREBASE_STORAGE_BUCKET',
  'PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'PUBLIC_FIREBASE_APP_ID',
  'PUBLIC_CLOUDINARY_CLOUD_NAME',
];

const PRIVATE_VARIABLES = ['CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'ADMIN_REGISTRATION_KEY'];

export function parseWranglerPublicEnv(source) {
  const result = ts.parseConfigFileTextToJson('wrangler.jsonc', source);
  if (result.error) {
    const message = ts.flattenDiagnosticMessageText(result.error.messageText, '\n');
    throw new Error(`Tidak dapat membaca wrangler.jsonc: ${message}`);
  }

  const vars = result.config.vars;
  if (!vars || typeof vars !== 'object' || Array.isArray(vars)) {
    throw new Error('wrangler.jsonc harus mendefinisikan object "vars" untuk konfigurasi publik.');
  }

  const privateNames = PRIVATE_VARIABLES.filter((name) => Object.hasOwn(vars, name));
  if (privateNames.length) {
    throw new Error(`Pindahkan binding sensitif dari wrangler.jsonc ke Cloudflare Secrets: ${privateNames.join(', ')}.`);
  }

  const missing = PUBLIC_BUILD_VARIABLES.filter((name) => typeof vars[name] !== 'string' || !vars[name].trim());
  if (missing.length) {
    throw new Error(`wrangler.jsonc vars belum memuat konfigurasi publik wajib: ${missing.join(', ')}.`);
  }

  return Object.fromEntries(PUBLIC_BUILD_VARIABLES.map((name) => [name, vars[name]]));
}

export function loadWranglerPublicEnv() {
  const configPath = fileURLToPath(new URL('../wrangler.jsonc', import.meta.url));
  return parseWranglerPublicEnv(readFileSync(configPath, 'utf8'));
}

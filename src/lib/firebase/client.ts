import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig } from './config';

class AdminVerificationError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'AdminVerificationError';
  }
}

class LoginStageTimeoutError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'LoginStageTimeoutError';
  }
}

async function withTimeout<T>(promise: Promise<T>, milliseconds: number, error: Error): Promise<T> {
  let timer = 0;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(error), milliseconds);
      }),
    ]);
  } finally {
    window.clearTimeout(timer);
  }
}

function getClientFirebaseApp() {
  const config = getFirebaseConfig();
  if (!config) {
    throw new Error('Konfigurasi Firebase belum diatur. Harap periksa file .env.');
  }

  const existing = getApps().find((app) => app.name === '[DEFAULT]');
  if (existing) {
    if (existing.options.projectId !== config.projectId) {
      console.error('[AdminLogin] Firebase project mismatch', {
        configuredProjectId: config.projectId,
        initializedProjectId: existing.options.projectId || 'missing',
      });
      throw new Error('Konfigurasi Firebase mengarah ke project yang berbeda.');
    }
    return existing;
  }
  return initializeApp(config);
}

export function getClientAuth() {
  return getAuth(getClientFirebaseApp());
}

export function getClientDb() {
  return getFirestore(getClientFirebaseApp());
}

/** Authenticate and ask the server to verify the UID-bound admin document. */
export async function loginAdminWithCredentials(
  email: string,
  pass: string,
  onProgress?: (message: string) => void
): Promise<User> {
  const auth = getClientAuth();
  onProgress?.('Menghubungi Firebase Authentication…');
  const signInPromise = signInWithEmailAndPassword(auth, email, pass);
  let user: User;
  try {
    user = (await withTimeout(
      signInPromise,
      15000,
      new LoginStageTimeoutError('login/auth-timeout', 'Firebase Authentication tidak merespons dalam 15 detik.')
    )).user;
  } catch (error) {
    if (error instanceof LoginStageTimeoutError) {
      // If Auth completes after the UI timeout, do not leave an unexpected logged-in session behind.
      void signInPromise.then(() => signOut(auth)).catch(() => undefined);
    }
    throw error;
  }
  const projectId = getFirebaseConfig()?.projectId || 'missing';
  const documentPath = `admins/${user.uid}`;
  console.info('[AdminLogin] Firebase Authentication succeeded', { projectId, uid: user.uid });

  try {
    onProgress?.('Memeriksa hak admin di Firestore…');
    const idToken = await withTimeout(
      user.getIdToken(),
      10000,
      new LoginStageTimeoutError('login/id-token-timeout', 'Firebase tidak mengirim ID Token dalam 10 detik.')
    );
    const response = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.verified !== true) {
      const messages: Record<string, string> = {
        'admin-document-not-found': `Dokumen admin ${documentPath} tidak ditemukan di project ${projectId}, database (default).`,
        'firestore-permission-denied': 'Firestore menolak pembacaan dokumen admin (permission denied).',
        'firestore-network-error': 'Server tidak dapat terhubung ke Firestore untuk memeriksa status admin.',
        'auth-network-error': 'Server tidak dapat memverifikasi ID Token ke Firebase Authentication.',
        'firebase-not-configured': 'Konfigurasi Firebase pada server belum lengkap.',
      };
      const code = typeof result?.code === 'string' ? result.code : 'admin-verification-failed';
      throw new AdminVerificationError(code, messages[code] || result?.error || `Pemeriksaan admin gagal (HTTP ${response.status}).`);
    }

    const sessionResponse = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!sessionResponse.ok) {
      throw new AdminVerificationError('admin-session-failed', 'Server tidak dapat membuat sesi admin. Silakan coba lagi.');
    }

    console.info('[AdminLogin] Admin verification succeeded', { projectId, uid: user.uid, documentPath });
    return user;
  } catch (err: unknown) {
    if (err instanceof AdminVerificationError) {
      console.warn('[AdminLogin] Admin verification rejected', { projectId, uid: user.uid, documentPath, code: err.code });
    } else {
      const diagnostic = err as { code?: unknown; name?: unknown };
      console.error('[AdminLogin] Admin verification request failed', {
        projectId,
        uid: user.uid,
        documentPath,
        errorCode: typeof diagnostic?.code === 'string' ? diagnostic.code : 'network-or-response-error',
        errorName: typeof diagnostic?.name === 'string' ? diagnostic.name : 'unknown',
      });
    }
    await signOut(auth);
    throw err;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    const response = await fetch('/api/admin/session', { method: 'DELETE', credentials: 'same-origin' });
    if (!response.ok) throw new Error('Server tidak menghapus cookie sesi.');
  } finally {
    await signOut(getClientAuth());
  }
}

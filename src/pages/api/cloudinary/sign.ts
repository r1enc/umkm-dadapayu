import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/firebase/verifyAdmin';
import { isNetlifyPreview } from '../../../lib/netlifyPreview';

// Helper Web Crypto API untuk membuat SHA-1 signature (Kompatibel 100% dengan Cloudflare Workers)
async function sha1(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};

  // 1. Verifikasi Kriptografis Token Firebase dan Hak Akses Admin
  const adminCheck = await verifyAdminSession(request, env);
  if (!adminCheck.verified) {
    return new Response(
      JSON.stringify({
        error: 'Otorisasi ditolak.',
        details: adminCheck.error,
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (isNetlifyPreview) {
    return Response.json(
      { error: 'Unggah foto dinonaktifkan pada preview Netlify. Gunakan gambar contoh atau foto yang sudah tersedia.' },
      { status: 409, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  if (import.meta.env.DEV) {
    return Response.json({ error: 'Upload gambar dinonaktifkan untuk data demo lokal.' }, { status: 409 });
  }

  // 2. Ambil environment secret (dari Cloudflare runtime env atau import.meta.env)
  const apiSecret = env.CLOUDINARY_API_SECRET || import.meta.env.CLOUDINARY_API_SECRET;
  const apiKey = env.CLOUDINARY_API_KEY || import.meta.env.CLOUDINARY_API_KEY;
  const cloudName = env.PUBLIC_CLOUDINARY_CLOUD_NAME || import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'desa-dadapayu';

  if (!apiSecret || !apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Konfigurasi Cloudinary belum lengkap di server. Pastikan CLOUDINARY_API_SECRET & CLOUDINARY_API_KEY terpasang.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = body.folder || 'umkm-dadapayu';

    // Cloudinary signature string: parameter diurutkan secara alfabetis + api_secret
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = await sha1(toSign);

    return new Response(
      JSON.stringify({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
        verifiedAdmin: adminCheck.email,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Gagal membuat signature Cloudinary.', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

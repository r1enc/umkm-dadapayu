import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/firebase/verifyAdmin';
import { isNetlifyPreview } from '../../../lib/netlifyPreview';

async function sha1(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};

  // 1. Verifikasi Admin
  const adminCheck = await verifyAdminSession(request, env);
  if (!adminCheck.verified) {
    return new Response(
      JSON.stringify({ error: 'Otorisasi ditolak.', details: adminCheck.error }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (isNetlifyPreview) {
    return Response.json(
      { error: 'Penghapusan foto Cloudinary dinonaktifkan pada preview Netlify; foto yang tersimpan tetap dipertahankan.' },
      { status: 409, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  if (import.meta.env.DEV) {
    return Response.json({ error: 'Penghapusan gambar dinonaktifkan untuk data demo lokal.' }, { status: 409 });
  }

  const apiSecret = env.CLOUDINARY_API_SECRET || import.meta.env.CLOUDINARY_API_SECRET;
  const apiKey = env.CLOUDINARY_API_KEY || import.meta.env.CLOUDINARY_API_KEY;
  const cloudName = env.PUBLIC_CLOUDINARY_CLOUD_NAME || import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'desa-dadapayu';

  if (!apiSecret || !apiKey) {
    return new Response(
      JSON.stringify({ error: 'Konfigurasi Cloudinary server belum lengkap.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { publicId } = await request.json();
    if (!publicId || typeof publicId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Parameter publicId wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await sha1(toSign);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    const res = await fetch(destroyUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Gagal menghapus gambar di Cloudinary.', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { firestoreCreate, firestoreData, firestoreDelete, firestoreErrorResponse, firestoreGet, firestoreUpdate } from '../../../lib/firebase/firestoreRest';
import { verifyAdminSession } from '../../../lib/firebase/verifyAdmin';
import type { UMKM, UMKMStatus } from '../../../types';
import { createDemoUMKM, deleteDemoUMKM, updateDemoUMKM } from '../../../lib/dev/demoStore';

async function authorize(request: Request, locals: App.Locals) {
  const admin = await verifyAdminSession(request, locals.runtime?.env as Record<string, string> | undefined);
  if (admin.verified) return { ok: true as const, admin };
  return { ok: false as const, response: Response.json({ error: admin.error, code: admin.code }, { status: admin.status, headers: { 'Cache-Control': 'no-store', ...(admin.status === 401 ? { 'Set-Cookie': '__Host-admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' } : {}) } }) };
}

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await authorize(request, locals); if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const { name, slug, categoryId, shortDescription, description, coverImage, gallery, address, mapsUrl, whatsapp, openingHours, products, status } = body;
    if (typeof name !== 'string' || !name.trim() || name.length > 150) return Response.json({ error: 'Nama usaha wajib diisi (maksimal 150 karakter).' }, { status: 400 });
    if (typeof slug !== 'string' || !slug.trim() || slug.length > 150) return Response.json({ error: 'Slug URL wajib diisi.' }, { status: 400 });
    if (typeof categoryId !== 'string' || !categoryId) return Response.json({ error: 'Kategori usaha wajib dipilih.' }, { status: 400 });
    if (typeof address !== 'string' || !address.trim()) return Response.json({ error: 'Alamat usaha wajib diisi.' }, { status: 400 });
    if (typeof whatsapp !== 'string' || whatsapp.replace(/\D/g, '').length < 10) return Response.json({ error: 'Nomor WhatsApp wajib diisi (minimal 10 digit).' }, { status: 400 });
    const now = new Date().toISOString();
    const chosenStatus: UMKMStatus = ['draft', 'published', 'hidden'].includes(status) ? status : 'draft';
    const data: Record<string, unknown> = {
      name: name.trim(), slug: slug.trim().toLowerCase(), categoryId, shortDescription: shortDescription || '', description: description || '',
      coverImage: coverImage || { publicId: '', url: '/images/placeholder-umkm.jpg' }, gallery: Array.isArray(gallery) ? gallery : [],
      address: address.trim(), mapsUrl: mapsUrl || '', whatsapp: whatsapp.replace(/\D/g, ''), products: Array.isArray(products) ? products : [],
      status: chosenStatus, createdAt: now, updatedAt: now,
    };
    if (openingHours) data.openingHours = openingHours;
    if (import.meta.env.DEV) {
      const id = createDemoUMKM(data as Omit<UMKM, 'id'>);
      return Response.json({ success: true, id, slug: data.slug }, { status: 201 });
    }
    const id = await firestoreCreate(request, auth.admin, 'umkms', data);
    return Response.json({ success: true, id, slug: data.slug }, { status: 201 });
  } catch (error) { return firestoreErrorResponse(error); }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const auth = await authorize(request, locals); if (!auth.ok) return auth.response;
  try {
    const { id, ...updates } = await request.json();
    if (typeof id !== 'string' || !id) return Response.json({ error: 'ID dokumen UMKM wajib disertakan.' }, { status: 400 });
    const data: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };
    delete data.createdAt; delete data.id;
    if (typeof data.whatsapp === 'string') data.whatsapp = data.whatsapp.replace(/\D/g, '');
    if (import.meta.env.DEV) {
      if (!updateDemoUMKM(id, data as Partial<UMKM>)) return Response.json({ error: 'Data UMKM tidak ditemukan.', code: 'not-found' }, { status: 404 });
      return Response.json({ success: true, id });
    }
    const existing = await firestoreGet(request, auth.admin, 'umkms', id);
    // Keep createdAt immutable and avoid sending accidental undefined values.
    if (existing?.fields?.createdAt) delete data.createdAt;
    await firestoreUpdate(request, auth.admin, 'umkms', id, data);
    return Response.json({ success: true, id });
  } catch (error) { return firestoreErrorResponse(error); }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const auth = await authorize(request, locals); if (!auth.ok) return auth.response;
  try {
    const { id } = await request.json();
    if (typeof id !== 'string' || !id) return Response.json({ error: 'ID UMKM wajib disertakan.' }, { status: 400 });
    if (import.meta.env.DEV) {
      if (!deleteDemoUMKM(id)) return Response.json({ error: 'Data UMKM tidak ditemukan.', code: 'not-found' }, { status: 404 });
      return Response.json({ success: true, message: 'UMKM demo berhasil dihapus.' });
    }
    const document = await firestoreGet(request, auth.admin, 'umkms', id);
    const data = firestoreData(document);
    const images = [data.coverImage?.publicId, ...(Array.isArray(data.gallery) ? data.gallery.map((image: { publicId?: string }) => image?.publicId) : [])].filter((value): value is string => typeof value === 'string' && !!value);
    await firestoreDelete(request, auth.admin, 'umkms', id);

    const env = locals.runtime?.env as Record<string, string> | undefined;
    const apiSecret = env?.CLOUDINARY_API_SECRET || import.meta.env.CLOUDINARY_API_SECRET;
    const apiKey = env?.CLOUDINARY_API_KEY || import.meta.env.CLOUDINARY_API_KEY;
    const cloudName = env?.PUBLIC_CLOUDINARY_CLOUD_NAME || import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'desa-dadapayu';
    if (images.length && (!apiSecret || !apiKey)) return Response.json({ success: true, warning: 'Dokumen terhapus; foto tertinggal karena konfigurasi Cloudinary belum lengkap.', orphanedAssets: images }, { status: 207 });

    const orphanedAssets: string[] = [];
    for (const publicId of images) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`));
        const signature = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
        const form = new FormData(); form.set('public_id', publicId); form.set('api_key', apiKey!); form.set('timestamp', String(timestamp)); form.set('signature', signature);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body: form });
        const result = await response.json() as { result?: string };
        if (!response.ok || !['ok', 'not found'].includes(result.result || '')) orphanedAssets.push(publicId);
      } catch { orphanedAssets.push(publicId); }
    }
    return Response.json({ success: true, orphanedAssets }, { status: orphanedAssets.length ? 207 : 200 });
  } catch (error) { return firestoreErrorResponse(error); }
};

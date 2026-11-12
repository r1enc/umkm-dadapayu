import type { APIRoute } from 'astro';
import { firestoreCreate, firestoreDelete, firestoreErrorResponse, firestoreGet, firestoreQueryEqual, firestoreUpdate } from '../../../lib/firebase/firestoreRest';
import { verifyAdminSession } from '../../../lib/firebase/verifyAdmin';
import { createDemoCategory, deleteDemoCategory, listDemoUMKM, updateDemoCategory } from '../../../lib/dev/demoStore';
import { isNetlifyPreview } from '../../../lib/netlifyPreview';

async function authorize(request: Request, locals: App.Locals) {
  const env = locals.runtime?.env as Record<string, string> | undefined;
  const admin = await verifyAdminSession(request, env);
  if (admin.verified) return { ok: true as const, admin };
  return { ok: false as const, response: Response.json({ error: admin.error, code: admin.code }, { status: admin.status, headers: { 'Cache-Control': 'no-store', ...(admin.status === 401 ? { 'Set-Cookie': '__Host-admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' } : {}) } }) };
}

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await authorize(request, locals); if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const { name, slug, sortOrder, active } = body;
    if (typeof name !== 'string' || !name.trim() || name.length > 100) return Response.json({ error: 'Nama kategori wajib diisi (maksimal 100 karakter).' }, { status: 400 });
    if (typeof slug !== 'string' || !slug.trim() || slug.length > 100) return Response.json({ error: 'Slug kategori wajib diisi.' }, { status: 400 });
    const now = new Date().toISOString();
    const data = { name: name.trim(), slug: slug.trim().toLowerCase(), sortOrder: typeof sortOrder === 'number' ? sortOrder : 1, active: active !== false, createdAt: now, updatedAt: now };
    const id = import.meta.env.DEV && !isNetlifyPreview ? createDemoCategory(data) : await firestoreCreate(request, auth.admin, 'categories', data);
    return Response.json({ success: true, id }, { status: 201 });
  } catch (error) { return firestoreErrorResponse(error); }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const auth = await authorize(request, locals); if (!auth.ok) return auth.response;
  try {
    const { id, name, slug, sortOrder, active } = await request.json();
    if (typeof id !== 'string' || !id) return Response.json({ error: 'ID kategori wajib disertakan.' }, { status: 400 });
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (typeof name === 'string' && name.trim()) update.name = name.trim();
    if (typeof slug === 'string' && slug.trim()) update.slug = slug.trim().toLowerCase();
    if (typeof sortOrder === 'number') update.sortOrder = sortOrder;
    if (typeof active === 'boolean') update.active = active;
    if (import.meta.env.DEV && !isNetlifyPreview) {
      if (!updateDemoCategory(id, update)) return Response.json({ error: 'Kategori tidak ditemukan.', code: 'not-found' }, { status: 404 });
    } else {
      await firestoreGet(request, auth.admin, 'categories', id);
      await firestoreUpdate(request, auth.admin, 'categories', id, update);
    }
    return Response.json({ success: true, id });
  } catch (error) { return firestoreErrorResponse(error); }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const auth = await authorize(request, locals); if (!auth.ok) return auth.response;
  try {
    const { id } = await request.json();
    if (typeof id !== 'string' || !id) return Response.json({ error: 'ID kategori wajib disertakan.' }, { status: 400 });
    if (import.meta.env.DEV && !isNetlifyPreview) {
      const used = listDemoUMKM().filter((item) => item.categoryId === id);
      if (used.length) return Response.json({ error: `Kategori tidak dapat dihapus karena masih digunakan oleh ${used.length} UMKM.` }, { status: 400 });
      if (!deleteDemoCategory(id)) return Response.json({ error: 'Kategori tidak ditemukan.', code: 'not-found' }, { status: 404 });
      return Response.json({ success: true, message: 'Kategori demo berhasil dihapus.' });
    }
    const used = await firestoreQueryEqual(request, auth.admin, 'umkms', 'categoryId', id);
    if (used.length) return Response.json({ error: `Kategori tidak dapat dihapus karena masih digunakan oleh ${used.length} UMKM.` }, { status: 400 });
    await firestoreDelete(request, auth.admin, 'categories', id);
    return Response.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (error) { return firestoreErrorResponse(error); }
};

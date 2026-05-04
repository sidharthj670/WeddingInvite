import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { storage } from '$lib/server/storage/local';
import type { UploadKind } from '$lib/server/storage/types';

const KINDS: UploadKind[] = ['hero', 'gallery', 'music'];

/** Browsers (esp. Windows) often send empty type or octet-stream; infer from extension */
function resolveMime(kind: UploadKind, file: File): string {
	let mime = (file.type || '').trim().toLowerCase();
	const name = (file.name || '').toLowerCase();

	if (!mime || mime === 'application/octet-stream') {
		if (kind === 'music') {
			if (name.endsWith('.mp3')) mime = 'audio/mpeg';
			else if (name.endsWith('.m4a') || name.endsWith('.mp4')) mime = 'audio/mp4';
		} else {
			if (name.endsWith('.png')) mime = 'image/png';
			else if (name.endsWith('.webp')) mime = 'image/webp';
			else if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.jfif')) mime = 'image/jpeg';
		}
	}

	if (mime === 'image/jpg' || mime === 'image/pjpeg') mime = 'image/jpeg';
	if (kind === 'music' && (mime === 'audio/x-m4a' || mime === 'audio/m4a')) mime = 'audio/mp4';

	return mime;
}

export const POST: RequestHandler = async ({ request, params }) => {
	const token = request.headers.get('x-edit-token');
	if (!token) return json({ message: 'X-Edit-Token header required' }, { status: 400 });

	const db = getDb();
	const row = await db.invite.findUnique({ where: { slug: params.slug } });
	if (!row) return json({ message: 'Not found' }, { status: 404 });
	if (row.editToken !== token) return json({ message: 'Invalid token' }, { status: 403 });

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return json({ message: 'Invalid form data' }, { status: 400 });
	}

	const kind = String(form.get('kind') ?? '');
	if (!KINDS.includes(kind as UploadKind)) {
		return json({ message: 'Invalid kind' }, { status: 400 });
	}

	const file = form.get('file');
	if (!file || !(file instanceof File)) {
		return json({ message: 'file is required' }, { status: 400 });
	}

	const buf = Buffer.from(await file.arrayBuffer());
	const mime = resolveMime(kind as UploadKind, file);

	try {
		const result = await storage.save({
			slug: params.slug,
			kind: kind as UploadKind,
			buffer: buf,
			mime,
			originalName: file.name || 'upload'
		});
		return json({ url: result.publicPath, kind });
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Upload failed';
		return json({ message: msg }, { status: 400 });
	}
};

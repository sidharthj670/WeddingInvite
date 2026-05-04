import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { storage } from '$lib/server/storage/local';

export const GET: RequestHandler = async ({ params, url }) => {
	const slug = params.slug;
	const filename = params.filename;
	if (!slug || !filename || filename.includes('..') || /[/\\]/.test(filename)) {
		return new Response('Bad request', { status: 400 });
	}

	const db = getDb();
	const row = await db.invite.findUnique({ where: { slug } });
	if (!row) return new Response('Not found', { status: 404 });

	const token = url.searchParams.get('token');
	const allowed = !!row.publishedAt || (token && token === row.editToken);
	if (!allowed) return new Response('Forbidden', { status: 403 });

	const abs = storage.getAbsolutePath(slug, filename);
	const resolved = path.resolve(abs);
	const base = path.resolve(path.join(process.cwd(), 'data', 'uploads', slug));
	if (!resolved.startsWith(base + path.sep) && resolved !== base) {
		return new Response('Forbidden', { status: 403 });
	}
	if (!existsSync(resolved)) return new Response('Not found', { status: 404 });

	const st = await stat(resolved);
	const ext = path.extname(filename).toLowerCase();
	const mime =
		ext === '.jpg' || ext === '.jpeg'
			? 'image/jpeg'
			: ext === '.png'
				? 'image/png'
				: ext === '.webp'
					? 'image/webp'
					: ext === '.mp3'
						? 'audio/mpeg'
						: 'application/octet-stream';

	const body = await readFile(resolved);
	return new Response(body, {
		headers: {
			'Content-Type': mime,
			'Content-Length': String(st.size),
			'Cache-Control': 'public, max-age=86400'
		}
	});
};

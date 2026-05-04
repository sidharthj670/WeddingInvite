import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { parsePayload } from '$lib/payload';

export const load: PageServerLoad = async ({ params, url }) => {
	const db = getDb();
	const row = await db.invite.findUnique({ where: { slug: params.slug } });
	if (!row?.publishedAt) error(404, 'Not found');
	return {
		slug: row.slug,
		templateId: row.templateId,
		payload: parsePayload(row.payload),
		origin: url.origin
	};
};

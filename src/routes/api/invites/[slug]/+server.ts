import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import {
	validateForPublish,
	isValidTemplateId,
	type WeddingPayload,
	parsePayload
} from '$lib/payload';

export const GET: RequestHandler = async ({ url, params }) => {
	const token = url.searchParams.get('token');
	if (!token) return json({ message: 'token required' }, { status: 400 });

	const db = getDb();
	const row = await db.invite.findUnique({ where: { slug: params.slug } });
	if (!row) return json({ message: 'Not found' }, { status: 404 });
	if (row.editToken !== token) return json({ message: 'Invalid token' }, { status: 403 });

	return json({
		slug: row.slug,
		templateId: row.templateId,
		payload: parsePayload(row.payload),
		published: !!row.publishedAt
	});
};

export const PUT: RequestHandler = async ({ request, params }) => {
	const token = request.headers.get('x-edit-token');
	if (!token) return json({ message: 'X-Edit-Token header required' }, { status: 400 });

	let body: { payload?: WeddingPayload; publish?: boolean; templateId?: string };
	try {
		body = await request.json();
	} catch {
		return json({ message: 'Invalid JSON' }, { status: 400 });
	}

	const payload = body.payload;
	if (!payload || typeof payload !== 'object') {
		return json({ message: 'payload is required' }, { status: 400 });
	}

	const db = getDb();
	const row = await db.invite.findUnique({ where: { slug: params.slug } });
	if (!row) return json({ message: 'Not found' }, { status: 404 });
	if (row.editToken !== token) return json({ message: 'Invalid token' }, { status: 403 });

	const publish = body.publish === true;
	const nextTemplateId = isValidTemplateId(body.templateId) ? body.templateId : undefined;
	if (publish) {
		const tid = nextTemplateId ?? row.templateId;
		const v = validateForPublish(payload, tid);
		if (!v.ok) return json({ errors: v.errors }, { status: 400 });
	}

	const shouldPublishNow = publish && !row.publishedAt;

	await db.invite.update({
		where: { slug: params.slug },
		data: {
			payload: JSON.stringify(payload),
			...(shouldPublishNow ? { publishedAt: new Date() } : {}),
			...(nextTemplateId ? { templateId: nextTemplateId } : {})
		}
	});

	const final = await db.invite.findUnique({ where: { slug: params.slug } });

	return json({
		slug: final!.slug,
		published: !!final!.publishedAt,
		templateId: final!.templateId
	});
};

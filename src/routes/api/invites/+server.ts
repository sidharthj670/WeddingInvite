import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { makeEditToken, makeInviteSlug } from '$lib/slug';
import {
	validateForPublish,
	WEDDING_CLASSIC_ID,
	getSlugSeed,
	isValidTemplateId,
	type WeddingPayload
} from '$lib/payload';
import { Prisma } from '../../../../generated/prisma/client';

export const POST: RequestHandler = async ({ request }) => {
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

	const publish = body.publish === true;
	const templateId = isValidTemplateId(body.templateId) ? body.templateId : WEDDING_CLASSIC_ID;
	if (publish) {
		const v = validateForPublish(payload, templateId);
		if (!v.ok) return json({ errors: v.errors }, { status: 400 });
	}

	const db = getDb();
	const editToken = makeEditToken();
	let lastErr: unknown;

	for (let attempt = 0; attempt < 8; attempt++) {
		const slug = makeInviteSlug(getSlugSeed(payload));
		try {
			const invite = await db.invite.create({
				data: {
					slug,
					templateId,
					payload: JSON.stringify(payload),
					editToken,
					publishedAt: publish ? new Date() : null
				}
			});
			return json({
				slug: invite.slug,
				editToken: invite.editToken,
				published: !!invite.publishedAt
			});
		} catch (e) {
			lastErr = e;
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				continue;
			}
			throw e;
		}
	}

	console.error('Could not allocate unique slug', lastErr);
	return json({ message: 'Could not create invite' }, { status: 500 });
};

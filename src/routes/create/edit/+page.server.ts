import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { WEDDING_CLASSIC_ID, isValidTemplateId } from '$lib/payload';

export const load: PageServerLoad = async ({ url }) => {
	const edit = url.searchParams.get('edit')?.trim();
	const token = url.searchParams.get('token')?.trim();
	const hasSession = !!(edit && token);
	const q = url.searchParams.get('template')?.trim();
	const template = isValidTemplateId(q) ? q : undefined;

	/* Editor is only for an existing session or an explicit new-invite (?template=) flow */
	if (!hasSession && !template) {
		throw redirect(302, '/create/new');
	}

	return {
		edit: url.searchParams.get('edit'),
		token: url.searchParams.get('token'),
		initialTemplate: template ?? WEDDING_CLASSIC_ID
	};
};

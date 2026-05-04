import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Legacy URLs used `/create?edit=…&token=…` — forward to the editor. */
export const load: PageServerLoad = ({ url }) => {
	const edit = url.searchParams.get('edit')?.trim();
	const token = url.searchParams.get('token')?.trim();
	if (edit && token) {
		const sp = new URLSearchParams();
		sp.set('edit', edit);
		sp.set('token', token);
		const t = url.searchParams.get('template')?.trim();
		if (t) sp.set('template', t);
		throw redirect(302, `/create/edit?${sp.toString()}`);
	}
	/* ?template= alone: stay on hub so user sees drafts first; hub shows a resume banner. */
	return {};
};

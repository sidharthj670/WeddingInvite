import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url }) => ({
	isPublishedInvite: url.pathname.startsWith('/i/')
});

export function slugify(s: string): string {
	const base = s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 48);
	return base || 'invite';
}

export function randomSuffix(): string {
	return Math.random().toString(36).slice(2, 8);
}

export function makeInviteSlug(coupleNames: string): string {
	return `${slugify(coupleNames)}-${randomSuffix()}`;
}

export function makeEditToken(): string {
	const a = crypto.randomUUID().replace(/-/g, '');
	return a.slice(0, 32);
}

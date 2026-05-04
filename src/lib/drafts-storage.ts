const KEY = 'vowscroll_invite_drafts_v1';

export type StoredDraft = {
	slug: string;
	editToken: string;
	templateId: string;
	label: string;
	updatedAt: string;
	published: boolean;
};

function isDraft(x: unknown): x is StoredDraft {
	if (!x || typeof x !== 'object') return false;
	const o = x as Record<string, unknown>;
	return (
		typeof o.slug === 'string' &&
		typeof o.editToken === 'string' &&
		typeof o.templateId === 'string' &&
		typeof o.label === 'string' &&
		typeof o.updatedAt === 'string' &&
		typeof o.published === 'boolean'
	);
}

function readRaw(): StoredDraft[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isDraft);
	} catch {
		return [];
	}
}

/** Newest first */
export function listDraftsSorted(): StoredDraft[] {
	return readRaw().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function rememberDraft(entry: {
	slug: string;
	editToken: string;
	templateId: string;
	label: string;
	published: boolean;
}): void {
	if (typeof localStorage === 'undefined') return;
	const list = readRaw().filter((d) => d.slug !== entry.slug);
	list.push({
		...entry,
		updatedAt: new Date().toISOString()
	});
	localStorage.setItem(KEY, JSON.stringify(list));
}

export function forgetDraft(slug: string): void {
	if (typeof localStorage === 'undefined') return;
	const list = readRaw().filter((d) => d.slug !== slug);
	localStorage.setItem(KEY, JSON.stringify(list));
}

export function draftEditorUrl(slug: string, token: string, templateId?: string): string {
	const sp = new URLSearchParams();
	sp.set('edit', slug);
	sp.set('token', token);
	if (templateId) sp.set('template', templateId);
	return `/create/edit?${sp.toString()}`;
}

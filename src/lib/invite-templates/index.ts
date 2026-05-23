import { type TemplateId } from '$lib/payload';
import { weddingClassicV1 } from './wedding-classic-v1/meta';
import { weddingCityLuxeV1 } from './wedding-city-luxe-v1/meta';
import { weddingScrollV2 } from './wedding-scroll-v2/meta';
import { weddingOceanicV1 } from './wedding-oceanic-v1/meta';
import { weddingMountainV1 } from './wedding-mountain-v1/meta';
import type { InviteTemplateDefinition } from './types';

export type { InviteTemplateDefinition, InviteTemplateProps } from './types';

/**
 * Invite templates live in one folder each: `./<folder>/InviteTemplate.svelte` + `./<folder>/meta.ts`.
 * To add a template:
 * 1. Add `NEW_ID` to `TEMPLATE_IDS` in `$lib/payload.ts` (and validation rules if needed).
 * 2. Copy an existing folder under `invite-templates/`, implement `InviteTemplate.svelte` (props: payload, preview).
 * 3. Export a definition from `meta.ts` and append it here in `INVITE_TEMPLATE_LIST`.
 */
export const INVITE_TEMPLATE_LIST: readonly InviteTemplateDefinition[] = [
	weddingClassicV1,
	weddingScrollV2,
	weddingCityLuxeV1,
	weddingOceanicV1,
	weddingMountainV1
];

const fallback = weddingClassicV1;

const byId = new Map<TemplateId, InviteTemplateDefinition>(
	INVITE_TEMPLATE_LIST.map((t) => [t.id, t])
);

export function getInviteTemplateDefinition(
	id: string | null | undefined
): InviteTemplateDefinition {
	if (!id) return fallback;
	const t = byId.get(id as TemplateId);
	return t ?? fallback;
}

export function getInviteTemplateComponent(id: string | null | undefined) {
	return getInviteTemplateDefinition(id).component;
}

/** Deep link into the editor with a template pre-selected */
export function getCreateUrlForTemplate(id: TemplateId): string {
	return `/create/edit?template=${encodeURIComponent(id)}`;
}

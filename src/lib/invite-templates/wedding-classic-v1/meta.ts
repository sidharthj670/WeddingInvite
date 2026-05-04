import { WEDDING_CLASSIC_ID } from '$lib/payload';
import type { InviteTemplateDefinition } from '../types';
import Component from './InviteTemplate.svelte';

export const weddingClassicV1: InviteTemplateDefinition = {
	id: WEDDING_CLASSIC_ID,
	folder: 'wedding-classic-v1',
	label: 'Classic scroll',
	shortLabel: 'Classic',
	description: 'Hero, families, events, gallery, background music, and RSVP — full multi-event layout.',
	component: Component
};

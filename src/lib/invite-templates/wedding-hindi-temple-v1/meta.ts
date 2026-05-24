import { WEDDING_HINDI_TEMPLE_ID } from '$lib/payload';
import type { InviteTemplateDefinition } from '../types';
import Component from './InviteTemplate.svelte';

export const weddingHindiTempleV1: InviteTemplateDefinition = {
	id: WEDDING_HINDI_TEMPLE_ID,
	folder: 'wedding-hindi-temple-v1',
	label: 'Hindi Temple',
	shortLabel: 'Temple',
	description:
		'A sacred temple backdrop with invitation details revealed as you scroll — names, blessings, events, and RSVP layered over the scene.',
	component: Component
};

import { WEDDING_SCROLL_V2_ID } from '$lib/payload';
import type { InviteTemplateDefinition } from '../types';
import Component from './InviteTemplate.svelte';

export const weddingScrollV2: InviteTemplateDefinition = {
	id: WEDDING_SCROLL_V2_ID,
	folder: 'wedding-scroll-v2',
	label: 'Mountain-style scroll',
	shortLabel: 'Mountain',
	description: 'Long-form storytelling: opener, blessings, letter, things to know, countdown.',
	component: Component
};

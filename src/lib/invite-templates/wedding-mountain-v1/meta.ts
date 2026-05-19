import { WEDDING_MOUNTAIN_ID } from '$lib/payload';
import type { InviteTemplateDefinition } from '../types';
import Component from './InviteTemplate.svelte';

export const weddingMountainV1: InviteTemplateDefinition = {
	id: WEDDING_MOUNTAIN_ID,
	folder: 'wedding-mountain-v1',
	label: 'Mountain regal',
	shortLabel: 'Mountain',
	description:
		'Teal-and-gold palette with layered mountain silhouettes, celestial accents, circular event cards, and ornate Indian motifs.',
	component: Component
};

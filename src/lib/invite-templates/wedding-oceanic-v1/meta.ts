import { WEDDING_OCEANIC_ID } from '$lib/payload';
import type { InviteTemplateDefinition } from '../types';
import Component from './InviteTemplate.svelte';

export const weddingOceanicV1: InviteTemplateDefinition = {
	id: WEDDING_OCEANIC_ID,
	folder: 'wedding-oceanic-v1',
	label: 'Oceanic luxe interactive',
	shortLabel: 'Oceanic Luxe',
	description:
		'An immersive destination-style invite with floating lanterns, envelope open, 3D perspective couple section, event carousel, gallery, and countdown — inspired by resort weddings.',
	component: Component
};

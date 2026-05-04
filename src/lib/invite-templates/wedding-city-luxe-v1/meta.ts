import { WEDDING_CITY_LUXE_ID } from '$lib/payload';
import type { InviteTemplateDefinition } from '../types';
import Component from './InviteTemplate.svelte';

export const weddingCityLuxeV1: InviteTemplateDefinition = {
	id: WEDDING_CITY_LUXE_ID,
	folder: 'wedding-city-luxe-v1',
	label: 'City luxe interactive',
	shortLabel: 'City Luxe',
	description:
		'An interactive city-inspired invite with an opening cover, animated hero, event carousel, route panels, RSVP, details, gallery, and countdown.',
	component: Component
};

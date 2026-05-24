import { WEDDING_CINEMATIC_FRAMES_ID } from '$lib/payload';
import type { InviteTemplateDefinition } from '../types';
import Component from './InviteTemplate.svelte';

export const weddingCinematicFramesV1: InviteTemplateDefinition = {
	id: WEDDING_CINEMATIC_FRAMES_ID,
	folder: 'wedding-cinematic-frames-v1',
	label: 'Cinematic frames',
	shortLabel: 'Cinematic',
	description:
		'A scroll-driven film made from video frames — smooth compressed scrubbing with text beats across the scroll. Full-screen when published.',
	component: Component
};

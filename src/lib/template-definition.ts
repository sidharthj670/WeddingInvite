/**
 * Declarative schema for `wedding-classic-v1` — drives validation and future form codegen.
 */

import type { WeddingPayload } from './payload';

export const WEDDING_CLASSIC_V1 = {
	id: 'wedding-classic-v1',
	label: 'Classic scroll',
	description: 'Hero, optional quote, families, events, gallery, background audio, CTAs.',
	fields: [
		{ key: 'coupleNames', label: 'Couple / title', type: 'text', required: true },
		{ key: 'weddingDate', label: 'Wedding date', type: 'text', required: true },
		{ key: 'tagline', label: 'Tagline', type: 'text', required: false },
		{ key: 'heroImageUrl', label: 'Hero image URL', type: 'url', required: false },
		{ key: 'openingQuote', label: 'Opening quote', type: 'textarea', required: false },
		{ key: 'openingAttribution', label: 'Quote attribution', type: 'text', required: false },
		{ key: 'brideParents', label: "Bride's parents", type: 'text', required: false },
		{ key: 'brideFamilyNote', label: "Bride's note", type: 'textarea', required: false },
		{ key: 'groomParents', label: "Groom's parents", type: 'text', required: false },
		{ key: 'groomFamilyNote', label: "Groom's note", type: 'textarea', required: false },
		{ key: 'events', label: 'Events', type: 'events', required: true },
		{ key: 'galleryTitle', label: 'Gallery title', type: 'text', required: false },
		{ key: 'galleryImageUrls', label: 'Gallery images', type: 'urls', required: false },
		{ key: 'musicUrl', label: 'Background music URL', type: 'url', required: false },
		{ key: 'rsvpUrl', label: 'RSVP URL', type: 'url', required: false },
		{ key: 'instagramUrl', label: 'Instagram', type: 'url', required: false },
		{ key: 'hashtag', label: 'Hashtag', type: 'text', required: false },
		{ key: 'coordinatorNote', label: 'Coordinator / logistics', type: 'textarea', required: false },
		{ key: 'contactPhone', label: 'Contact phone', type: 'text', required: false },
		{ key: 'footerNote', label: 'Footer', type: 'text', required: false }
	] as const
} as const;

export type TemplateFieldKey = keyof WeddingPayload | 'events';

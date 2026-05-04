import type { Component } from 'svelte';
import type { TemplateId, WeddingPayload } from '$lib/payload';

/** Props contract every invite template view must implement */
export type InviteTemplateProps = {
	payload: WeddingPayload;
	preview?: boolean;
};

/** One registerable template — add a folder + meta + list entry in index.ts */
export type InviteTemplateDefinition = {
	id: TemplateId;
	/** Folder name under invite-templates/ (for humans & docs) */
	folder: string;
	label: string;
	shortLabel: string;
	description: string;
	component: Component<InviteTemplateProps>;
};

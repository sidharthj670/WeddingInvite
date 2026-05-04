<script lang="ts">
	import { getInviteTemplateComponent } from '$lib/invite-templates';
	import { getDisplayCoupleLine, getHeroImageAbsolute } from '$lib/payload';

	let { data } = $props();

	const InviteCmp = $derived(getInviteTemplateComponent(data.templateId));
	const coupleLine = $derived(getDisplayCoupleLine(data.payload));
	const title = $derived(
		coupleLine.trim() && coupleLine !== 'Names go here' ? `${coupleLine} · Wedding` : 'Wedding invitation'
	);
	const desc = $derived(
		data.payload.tagline?.trim() ||
			data.payload.weddingDate?.trim() ||
			'You’re invited to celebrate with us.'
	);
	const ogImage = $derived(getHeroImageAbsolute(data.payload, data.origin));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={desc} />
	<meta property="og:type" content="website" />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={ogImage} />
	{/if}
</svelte:head>

<InviteCmp payload={data.payload} />

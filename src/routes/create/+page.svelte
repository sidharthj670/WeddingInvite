<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		draftEditorUrl,
		forgetDraft,
		listDraftsSorted,
		type StoredDraft
	} from '$lib/drafts-storage';
	import { getCreateUrlForTemplate, getInviteTemplateDefinition } from '$lib/invite-templates';
	import { isValidTemplateId, type TemplateId } from '$lib/payload';
	import { onMount } from 'svelte';

	let drafts = $state<StoredDraft[]>([]);

	const suggestedTemplate = $derived.by((): TemplateId | null => {
		const t = page.url.searchParams.get('template')?.trim();
		return isValidTemplateId(t) ? t : null;
	});

	function refresh() {
		drafts = listDraftsSorted();
	}

	onMount(() => {
		if (browser) refresh();
	});

	function dismissSuggested() {
		void goto('/create', { replaceState: true });
	}

	function removeDraft(slug: string, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		forgetDraft(slug);
		refresh();
	}

	function tplLabel(id: string): string {
		return getInviteTemplateDefinition(id).shortLabel;
	}
</script>

<svelte:head>
	<title>Your invites · Vow & Scroll</title>
	<meta
		name="description"
		content="Continue a saved wedding invite or start a new one from a template — drafts stay on this device."
	/>
</svelte:head>

<main class="hub">
	<header class="hub-head">
		<p class="eyebrow">Create</p>
		<h1>Your invites</h1>
		<p class="lead">
			Drafts you save on this browser show up here. Open one to keep editing, or start fresh with a
			template.
		</p>
		<a class="btn primary" href="/create/new">+ New invite</a>
		{#if suggestedTemplate}
			<aside class="suggested">
				<p>
					Start a new invite using the <strong>{getInviteTemplateDefinition(suggestedTemplate).label}</strong>{' '}
					layout?
				</p>
				<div class="suggested-row">
					<a class="btn secondary" href={getCreateUrlForTemplate(suggestedTemplate)}>Start with this template</a>
					<button type="button" class="linkish" onclick={dismissSuggested}>Not now</button>
				</div>
			</aside>
		{/if}
	</header>

	<section class="list-section" aria-labelledby="drafts-heading">
		<h2 id="drafts-heading" class="sr-only">Saved drafts</h2>
		{#if drafts.length === 0}
			<p class="empty">No drafts yet — when you save an invite, it appears here on this device.</p>
		{:else}
			<ul class="draft-list">
				{#each drafts as d (d.slug)}
					<li>
						<a class="draft-card" href={draftEditorUrl(d.slug, d.editToken, d.templateId)}>
							<div class="draft-main">
								<span class="draft-title">{d.label.trim() || 'Untitled invite'}</span>
								<span class="draft-meta">
									{tplLabel(d.templateId)}
									{#if d.published}
										<span class="pill pub">Live</span>
									{:else}
										<span class="pill">Draft</span>
									{/if}
									· <span class="mono">{d.slug}</span>
								</span>
							</div>
							<span class="chev" aria-hidden="true">→</span>
						</a>
						<button
							type="button"
							class="remove"
							onclick={(e) => removeDraft(d.slug, e)}
							aria-label="Remove from this list"
							title="Remove from this list (does not delete the invite link)"
						>
							×
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	.hub {
		max-width: 40rem;
		margin: 0 auto;
		padding: clamp(3.5rem, 10vw, 5rem) clamp(1.25rem, 4vw, 2rem) 4rem;
	}

	.hub-head {
		margin-bottom: 2.5rem;
	}

	.eyebrow {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--maroon);
		margin: 0 0 0.75rem;
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(1.85rem, 4vw, 2.35rem);
		margin: 0 0 0.75rem;
		letter-spacing: -0.02em;
		color: var(--ink);
	}

	.lead {
		margin: 0 0 1.5rem;
		font-size: 1.05rem;
		line-height: 1.65;
		color: var(--ink-soft);
		max-width: 36rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-ui);
		font-size: 0.95rem;
		font-weight: 600;
		padding: 0.75rem 1.35rem;
		border-radius: 999px;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.btn.primary {
		background: linear-gradient(145deg, var(--maroon) 0%, #8a3348 100%);
		color: #fffaf8;
		box-shadow: 0 10px 32px rgba(107, 34, 51, 0.3);
	}

	.btn.primary:hover {
		transform: translateY(-2px);
	}

	.suggested {
		margin-top: 1.75rem;
		padding: 1.15rem 1.25rem;
		border-radius: 14px;
		background: rgba(255, 252, 248, 0.95);
		border: 1px solid var(--line-gold);
		box-shadow: 0 8px 28px rgba(60, 24, 30, 0.06);
	}

	.suggested p {
		margin: 0 0 1rem;
		font-size: 0.98rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}

	.suggested-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
	}

	.btn.secondary {
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid var(--line-gold);
		color: var(--maroon);
		text-decoration: none;
	}

	.btn.secondary:hover {
		transform: translateY(-1px);
		background: #fffdf9;
	}

	.linkish {
		font-family: var(--font-ui);
		font-size: 0.88rem;
		font-weight: 500;
		color: var(--maroon);
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
		padding: 0;
	}

	.linkish:hover {
		color: var(--saffron);
	}

	.list-section {
		border-top: 1px solid var(--line-gold);
		padding-top: 2rem;
	}

	.empty {
		margin: 0;
		font-size: 1rem;
		color: var(--ink-soft);
		line-height: 1.6;
	}

	.draft-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.draft-list li {
		position: relative;
		display: flex;
		align-items: stretch;
		gap: 0.35rem;
	}

	.draft-card {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.15rem;
		border-radius: 14px;
		background: rgba(255, 252, 248, 0.85);
		border: 1px solid var(--line-gold);
		text-decoration: none;
		color: inherit;
		transition:
			background 0.2s ease,
			box-shadow 0.2s ease;
	}

	.draft-card:hover {
		background: #fffdf9;
		box-shadow: 0 8px 28px rgba(60, 24, 30, 0.08);
	}

	.draft-main {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}

	.draft-title {
		font-family: var(--font-display);
		font-weight: 650;
		font-size: 1.1rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.draft-meta {
		font-size: 0.82rem;
		color: var(--ink-soft);
		font-family: var(--font-ui);
	}

	.mono {
		font-family: ui-monospace, monospace;
		font-size: 0.78rem;
	}

	.pill {
		display: inline-block;
		padding: 0.12rem 0.45rem;
		border-radius: 999px;
		background: rgba(107, 34, 51, 0.08);
		color: var(--maroon);
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.pill.pub {
		background: rgba(47, 74, 60, 0.12);
		color: var(--foliage);
	}

	.chev {
		color: var(--gold);
		font-size: 1.25rem;
		opacity: 0.85;
		flex-shrink: 0;
	}

	.remove {
		width: 2.5rem;
		flex-shrink: 0;
		border: 1px solid var(--line-gold);
		border-radius: 12px;
		background: rgba(255, 252, 248, 0.6);
		font-size: 1.35rem;
		line-height: 1;
		color: var(--ink-soft);
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.remove:hover {
		background: rgba(224, 124, 62, 0.12);
		color: var(--maroon);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>

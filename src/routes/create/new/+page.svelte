<script lang="ts">
	import { INVITE_TEMPLATE_LIST, getCreateUrlForTemplate } from '$lib/invite-templates';
</script>

<svelte:head>
	<title>Choose a template · Vow & Scroll</title>
	<meta
		name="description"
		content="Pick a wedding invite layout, then fill in your story — classic scroll or mountain-style storytelling."
	/>
</svelte:head>

<main class="pick">
	<p class="back">
		<a href="/create">← Your invites</a>
	</p>

	<header class="pick-head">
		<p class="eyebrow">New invite</p>
		<h1>Choose a template</h1>
		<p class="lead">Each layout carries the same fields — pick the one that matches your celebration.</p>
	</header>

	<div class="grid">
		{#each INVITE_TEMPLATE_LIST as def (def.id)}
			<a class="card" href={getCreateUrlForTemplate(def.id)} data-sveltekit-preload-data>
				<span class="card-label">{def.shortLabel}</span>
				<h2>{def.label}</h2>
				<p>{def.description}</p>
				<span class="cta">Start with this →</span>
			</a>
		{/each}
	</div>
</main>

<style>
	.pick {
		max-width: 52rem;
		margin: 0 auto;
		padding: clamp(3rem, 8vw, 4.5rem) clamp(1.25rem, 4vw, 2rem) 4rem;
	}

	.back {
		margin: 0 0 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.9rem;
	}

	.back a {
		color: var(--maroon);
		text-decoration: none;
		font-weight: 500;
	}

	.back a:hover {
		text-decoration: underline;
	}

	.pick-head {
		margin-bottom: 2rem;
	}

	.eyebrow {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--maroon);
		margin: 0 0 0.65rem;
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		margin: 0 0 0.65rem;
		letter-spacing: -0.02em;
	}

	.lead {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.6;
		color: var(--ink-soft);
		max-width: 38rem;
	}

	.grid {
		display: grid;
		gap: 1.25rem;
	}

	@media (min-width: 720px) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 1.5rem 1.35rem;
		border-radius: 18px;
		background: rgba(255, 252, 248, 0.9);
		border: 1px solid var(--line-gold);
		text-decoration: none;
		color: inherit;
		box-shadow: 0 12px 40px rgba(50, 18, 28, 0.06);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
		min-height: 12rem;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 48px rgba(60, 24, 30, 0.1);
	}

	.card-label {
		font-family: var(--font-ui);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--saffron);
		margin-bottom: 0.5rem;
	}

	.card h2 {
		font-family: var(--font-display);
		font-size: 1.35rem;
		margin: 0 0 0.5rem;
		line-height: 1.2;
		color: var(--ink);
	}

	.card p {
		margin: 0 0 auto;
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--ink-soft);
		flex: 1;
		padding-bottom: 1rem;
	}

	.cta {
		font-family: var(--font-ui);
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--maroon);
	}
</style>

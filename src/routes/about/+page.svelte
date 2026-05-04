<script lang="ts">
	import { inView } from '$lib/actions/inView';
</script>

<svelte:head>
	<title>About · Vow & Scroll</title>
	<meta
		name="description"
		content="Why we built Vow & Scroll — a quiet corner of the internet for couples who want invitations as sincere as their vows."
	/>
</svelte:head>

<article class="about">
	<header class="about-hero reveal" use:inView>
		<p class="eyebrow">About us</p>
		<h1>For couples who believe the first hello<br />should feel like a blessing.</h1>
	</header>

	<div class="prose">
		<p class="drop reveal" use:inView>
			<span class="cap">W</span>e started Vow & Scroll with a simple frustration: beautiful weddings deserved
			better than blurry forwards and unreadable video frames. Your grandmother should not have to squint at
			a screen. Your friends abroad should open one link and <em>feel</em> the colours of home — marigold,
			saffron, the hush before the baraat drum.
		</p>

		<p class="reveal" use:inView>
			Our work borrows from the world’s best digital craft — clarity, breathing room, motion that serves the
			message — and folds it into forms that honour Indian celebrations: multiple functions, layered families,
			verses when you want them, and logistics without clutter.
		</p>

		<p class="reveal" use:inView>
			This is not a generic template factory. We ship fewer surfaces, but shape each one with intention — so
			when you press “publish,” you’re not launching a webpage alone; you’re opening your door to everyone you
			love, near or far, with the same care you’d choose for paper and ink.
		</p>

		<blockquote class="pull reveal" use:inView>
			<p>“The invitation is the first ritual of the wedding — we treat it that way.”</p>
		</blockquote>

		<p class="reveal" use:inView>
			Thank you for trusting us with this chapter. From our desk to your mandap — नमस्ते, and happy planning.
		</p>
	</div>

	<p class="sign-off reveal" use:inView>— The Vow & Scroll team</p>
</article>

<style>
	.about {
		max-width: 38rem;
		margin: 0 auto;
		padding: clamp(4rem, 12vw, 7rem) clamp(1.25rem, 4vw, 2rem) 5rem;
	}

	.about-hero {
		margin-bottom: 2.5rem;
	}

	.eyebrow {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--maroon);
		margin: 0 0 1rem;
	}

	.about-hero h1 {
		font-family: var(--font-display);
		font-weight: 650;
		font-size: clamp(2rem, 4.5vw, 2.85rem);
		line-height: 1.15;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.prose p {
		font-size: 1.12rem;
		line-height: 1.85;
		color: var(--ink-soft);
		margin: 0 0 1.5rem;
	}

	.drop {
		position: relative;
	}

	.cap {
		float: left;
		font-family: var(--font-display);
		font-size: 4rem;
		line-height: 0.85;
		padding-right: 0.65rem;
		padding-top: 0.15rem;
		color: var(--maroon);
		font-weight: 600;
	}

	.prose em {
		font-style: italic;
		color: var(--ink);
	}

	.pull {
		margin: 2.5rem 0;
		padding: 1.5rem 1.25rem;
		border-left: 3px solid var(--gold);
		background: linear-gradient(90deg, rgba(201, 162, 39, 0.12), transparent);
		border-radius: 0 12px 12px 0;
	}

	.pull p {
		font-family: var(--font-display);
		font-size: 1.35rem;
		line-height: 1.45;
		margin: 0;
		color: var(--maroon-deep);
		font-style: italic;
	}

	.sign-off {
		margin-top: 2.5rem;
		font-family: var(--font-display);
		font-style: italic;
		font-size: 1.1rem;
		color: var(--maroon);
	}
</style>

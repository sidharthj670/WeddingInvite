<script lang="ts">
	import { inView } from '$lib/actions/inView';

	let y = $state(0);
	let reduceMotion = $state(false);

	function onScroll() {
		if (typeof window === 'undefined' || reduceMotion) return;
		y = window.scrollY;
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});
</script>

<svelte:head>
	<title>Vow & Scroll · Wedding invite websites</title>
	<meta
		name="description"
		content="A sacred link for your wedding — beautiful, readable, and shaped for Indian celebrations. Create, preview, and share in one flow."
	/>
</svelte:head>

<svelte:window onscroll={onScroll} />

<main class="home">
	<section class="hero-full">
		<div
			class="hero-parallax"
			style:transform={reduceMotion ? undefined : `translate3d(0, ${y * 0.12}px, 0)`}
		>
			<div class="hero-orb" aria-hidden="true"></div>
			<div class="hero-orb2" aria-hidden="true"></div>
		</div>
		<div class="hero-content">
			<p class="eyebrow reveal" use:inView>निमंत्रण · Invitation</p>
			<h1 class="headline reveal reveal-delay-1" use:inView>
				Every ritual deserves<br />
				<span class="gold">a page that feels</span><br />
				as thoughtful as the day.
			</h1>
			<p class="lede reveal reveal-delay-2" use:inView>
				From haldi to reception — one link. Large type, calm ceremony, and the warmth of
				<b>lal</b> & <b>sona</b> on screen — not a tiny video your elders can’t read.
			</p>
			<div class="cta-row reveal reveal-delay-3" use:inView>
				<a class="btn btn-primary" href="/create">Begin your invite</a>
				<a class="btn btn-ghost" href="/create">Your invites</a>
			</div>
		</div>
		<div class="scroll-hint" aria-hidden="true">Scroll to explore</div>
	</section>

	<section class="stripe">
		<div class="stripe-inner">
			<p class="stripe-copy reveal" use:inView>
				Crafted with intention — the same care as folding a <em>lifāfā</em> by hand.
			</p>
		</div>
	</section>

	<section class="feature-stack">
		<div class="sticky-visual reveal" use:inView>
			<div class="glass-card">
				<span class="glass-tag">Why couples choose us</span>
				<ul class="pill-list">
					<li>Mobile-first typography — readable without pinch-zoom.</li>
					<li>Maps, RSVP links, and gallery — everything in one scroll.</li>
					<li>Optional verses & family lines — room for your traditions.</li>
				</ul>
			</div>
		</div>
		<div class="feature-rows">
			<article class="feature reveal" use:inView>
				<span class="fi">01</span>
				<h2>Designed like a product launch — for your shaadi</h2>
				<p>
					Clear hierarchy, generous whitespace, and motion that respects attention — inspired by the best
					keynotes, rooted in Indian hospitality.
				</p>
			</article>
			<article class="feature reveal" use:inView>
				<span class="fi">02</span>
				<h2>One URL for WhatsApp, Instagram & family groups</h2>
				<p>
					Share a single link with preview imagery — guests land on a calm, beautiful page, not a noisy
					forward chain.
				</p>
			</article>
			<article class="feature reveal" use:inView>
				<span class="fi">03</span>
				<h2>Instant edits after you publish</h2>
				<p>
					Venue shift? Time update? Change details anytime — the link stays the same so nobody misses the
					message.
				</p>
			</article>
		</div>
	</section>

	<section class="benefits" aria-labelledby="benefits-heading">
		<div class="benefits-bg" aria-hidden="true"></div>
		<div class="benefits-inner">
			<header class="benefits-intro">
				<p class="benefits-eyebrow reveal" use:inView>For you & your guests</p>
				<h2 id="benefits-heading" class="benefits-title reveal reveal-delay-1" use:inView>
					Why a Vow & Scroll invite earns its place on the family chat.
				</h2>
				<p class="benefits-lead reveal reveal-delay-2" use:inView>
					Scroll through what couples tell us matters most — each card lights up as you go, so nothing
					feels like fine print.
				</p>
			</header>

			<div class="benefits-grid">
				<article class="benefit-card reveal reveal-delay-1" use:inView>
					<div class="benefit-icon" aria-hidden="true">◇</div>
					<h3>One link, every function</h3>
					<p>Haldi to reception — dates, venues, and dress notes in a single scroll. No lost forwards or ten different images.</p>
				</article>
				<article class="benefit-card reveal reveal-delay-2" use:inView>
					<div class="benefit-icon" aria-hidden="true">◎</div>
					<h3>Built for small screens first</h3>
					<p>Large, calm type so parents and grandparents can read without pinching or squinting at a video frame.</p>
				</article>
				<article class="benefit-card reveal reveal-delay-3" use:inView>
					<div class="benefit-icon" aria-hidden="true">✦</div>
					<h3>Maps & RSVP, one tap away</h3>
					<p>Guests open directions and your RSVP form instantly — no hunting for the right message in the group.</p>
				</article>
				<article class="benefit-card reveal reveal-delay-4" use:inView>
					<div class="benefit-icon" aria-hidden="true">⟡</div>
					<h3>Change details after you share</h3>
					<p>Venue or time moved? Update once; the same link always shows the latest — no panic reprints.</p>
				</article>
				<article class="benefit-card reveal reveal-delay-5" use:inView>
					<div class="benefit-icon" aria-hidden="true">❋</div>
					<h3>Room for family & tradition</h3>
					<p>Names, optional verses, sides of the family, and your story — structured so it stays beautiful, not crowded.</p>
				</article>
				<article class="benefit-card reveal reveal-delay-6" use:inView>
					<div class="benefit-icon" aria-hidden="true">◈</div>
					<h3>Share with pride</h3>
					<p>WhatsApp, Instagram, email — one preview-friendly link that still feels as considered as paper.</p>
				</article>
			</div>
		</div>
	</section>

	<section class="closing reveal" use:inView>
		<h2 class="closing-head">Ready when you are.</h2>
		<p class="closing-sub">
			Start from our curated template, pour in your story, and send the link when it feels right — whether
			that’s months ahead or the week of your functions.
		</p>
		<a class="btn btn-primary big" href="/create">Create invite</a>
	</section>
</main>

<style>
	.home {
		overflow-x: clip;
		min-height: 100%;
	}

	.hero-full {
		position: relative;
		min-height: 100dvh;
		min-height: 100svh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(5rem, 12vw, 8rem) clamp(1.25rem, 5vw, 4rem) max(4rem, env(safe-area-inset-bottom, 0px));
		box-sizing: border-box;
	}

	.hero-parallax {
		position: absolute;
		inset: -10% -20%;
		pointer-events: none;
		z-index: 0;
	}

	.hero-orb {
		position: absolute;
		top: -15%;
		right: 5%;
		width: min(52vw, 420px);
		height: min(52vw, 420px);
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, rgba(255, 214, 170, 0.55), rgba(224, 124, 62, 0.18) 45%, transparent 70%);
		filter: blur(0px);
		animation: orb-float 18s ease-in-out infinite alternate;
	}

	.hero-orb2 {
		position: absolute;
		bottom: -10%;
		left: -5%;
		width: min(48vw, 380px);
		height: min(48vw, 380px);
		border-radius: 50%;
		background: radial-gradient(circle at 60% 50%, rgba(201, 162, 39, 0.35), rgba(107, 34, 51, 0.15) 55%, transparent 72%);
		animation: orb-float 22s ease-in-out infinite alternate-reverse;
	}

	@keyframes orb-float {
		from {
			transform: translate3d(0, 0, 0) scale(1);
		}
		to {
			transform: translate3d(2%, -3%, 0) scale(1.05);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-orb,
		.hero-orb2 {
			animation: none;
		}
	}

	.hero-content {
		position: relative;
		z-index: 1;
		max-width: 42rem;
		text-align: center;
	}

	.eyebrow {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		margin: 0 0 1.25rem;
		color: var(--maroon);
		opacity: 0.9;
	}

	.headline {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2.4rem, 7vw, 4rem);
		line-height: 1.08;
		letter-spacing: -0.035em;
		margin: 0 0 1.25rem;
		color: var(--ink);
	}

	.gold {
		background: linear-gradient(135deg, var(--maroon) 0%, var(--saffron) 55%, var(--gold) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		font-style: italic;
		font-weight: 650;
	}

	.lede {
		font-size: 1.18rem;
		line-height: 1.7;
		margin: 0 auto 2rem;
		max-width: 38ch;
		color: var(--ink-soft);
	}

	.lede b {
		color: var(--maroon);
		font-weight: 600;
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		align-items: center;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-ui);
		font-size: 0.92rem;
		font-weight: 600;
		padding: 0.75rem 1.35rem;
		border-radius: 999px;
		text-decoration: none;
		transition:
			transform 0.25s cubic-bezier(0.34, 1.3, 0.64, 1),
			box-shadow 0.25s ease;
	}

	.btn-primary {
		background: linear-gradient(145deg, var(--maroon) 0%, #8a3348 100%);
		color: #fffaf8;
		box-shadow: 0 12px 36px rgba(107, 34, 51, 0.35);
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 16px 44px rgba(107, 34, 51, 0.42);
	}

	.btn-ghost {
		background: rgba(255, 255, 255, 0.55);
		border: 1px solid var(--line-gold);
		color: var(--maroon);
	}

	.btn-ghost:hover {
		transform: translateY(-2px);
		background: rgba(255, 255, 255, 0.85);
	}

	.btn.big {
		padding: 0.9rem 2rem;
		font-size: 1rem;
	}

	.scroll-hint {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		opacity: 0.45;
	}

	.stripe {
		padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;
		background: linear-gradient(90deg, rgba(107, 34, 51, 0.08), rgba(224, 124, 62, 0.1), rgba(201, 162, 39, 0.08));
		border-block: 1px solid var(--line-gold);
	}

	.stripe-inner {
		max-width: 48rem;
		margin: 0 auto;
		text-align: center;
	}

	.stripe-copy {
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 3.5vw, 2rem);
		line-height: 1.35;
		margin: 0;
		color: var(--maroon-deep);
	}

	.stripe-copy em {
		font-style: italic;
		color: var(--saffron);
	}

	.feature-stack {
		display: grid;
		gap: clamp(2rem, 5vw, 4rem);
		padding: clamp(4rem, 10vw, 7rem) clamp(1.25rem, 4vw, 3rem);
		max-width: 72rem;
		margin: 0 auto;
	}

	@media (min-width: 900px) {
		.feature-stack {
			grid-template-columns: 1fr 1.15fr;
			align-items: start;
		}
	}

	.sticky-visual {
		position: sticky;
		top: 6rem;
	}

	.glass-card {
		padding: 1.75rem;
		border-radius: 20px;
		background: rgba(255, 252, 248, 0.72);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--line-gold);
		box-shadow: 0 24px 60px rgba(60, 24, 30, 0.08);
	}

	.glass-tag {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--maroon);
		display: block;
		margin-bottom: 1rem;
	}

	.pill-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.pill-list li {
		position: relative;
		padding-left: 1.25rem;
		font-size: 0.98rem;
		line-height: 1.5;
		color: var(--ink-soft);
	}

	.pill-list li::before {
		content: '✦';
		position: absolute;
		left: 0;
		color: var(--gold);
		font-size: 0.65rem;
		top: 0.35rem;
	}

	.feature-rows {
		display: flex;
		flex-direction: column;
		gap: clamp(2rem, 4vw, 3.5rem);
	}

	.feature {
		padding-bottom: clamp(2rem, 4vw, 3rem);
		border-bottom: 1px solid var(--line);
	}

	.feature:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.fi {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--saffron);
		display: block;
		margin-bottom: 0.5rem;
	}

	.feature h2 {
		font-family: var(--font-display);
		font-size: clamp(1.45rem, 3vw, 2rem);
		font-weight: 650;
		margin: 0 0 0.65rem;
		line-height: 1.2;
	}

	.feature p {
		margin: 0;
		font-size: 1.02rem;
		line-height: 1.65;
		color: var(--ink-soft);
		max-width: 46ch;
	}

	.benefits {
		position: relative;
		padding: clamp(4.5rem, 12vw, 9rem) clamp(1.25rem, 4vw, 2rem);
		overflow: clip;
	}

	.benefits-bg {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 80% 55% at 50% 0%, rgba(107, 34, 51, 0.09), transparent 55%),
			radial-gradient(ellipse 60% 45% at 100% 80%, rgba(201, 162, 39, 0.12), transparent 50%),
			radial-gradient(ellipse 50% 40% at 0% 60%, rgba(224, 124, 62, 0.08), transparent 45%),
			linear-gradient(180deg, rgba(253, 250, 246, 0.98), rgba(248, 238, 228, 0.99));
		pointer-events: none;
	}

	.benefits-bg::after {
		content: '';
		position: absolute;
		inset: -20%;
		background: repeating-conic-gradient(
			from 0deg at 50% 50%,
			transparent 0deg 2deg,
			rgba(201, 162, 39, 0.03) 2deg 4deg
		);
		opacity: 0.5;
		animation: benefits-rotate 120s linear infinite;
	}

	@keyframes benefits-rotate {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.benefits-bg::after {
			animation: none;
		}
	}

	.benefits-inner {
		position: relative;
		z-index: 1;
		max-width: 72rem;
		margin: 0 auto;
	}

	.benefits-intro {
		text-align: center;
		max-width: 40rem;
		margin: 0 auto clamp(3rem, 6vw, 4.5rem);
	}

	.benefits-eyebrow {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--maroon);
		margin: 0 0 1rem;
	}

	.benefits-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.75rem, 4vw, 2.65rem);
		line-height: 1.15;
		margin: 0 0 1rem;
		letter-spacing: -0.02em;
		color: var(--ink);
	}

	.benefits-lead {
		margin: 0;
		font-size: 1.08rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: clamp(1rem, 2.5vw, 1.35rem);
	}

	@media (min-width: 640px) {
		.benefits-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.benefits-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.benefit-card {
		position: relative;
		padding: 1.65rem 1.35rem 1.65rem;
		padding-top: 1.85rem;
		border-radius: 18px;
		background: rgba(255, 252, 248, 0.78);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--line-gold);
		box-shadow: 0 12px 40px rgba(50, 18, 28, 0.06);
		transition:
			transform 0.45s cubic-bezier(0.34, 1.3, 0.64, 1),
			box-shadow 0.45s ease;
	}

	.benefit-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 1.25rem;
		right: 1.25rem;
		height: 3px;
		border-radius: 0 0 3px 3px;
		background: linear-gradient(90deg, var(--gold), var(--saffron), var(--maroon));
		opacity: 0.95;
	}

	.benefit-card:hover {
		transform: translateY(-6px);
		box-shadow: 0 22px 56px rgba(60, 24, 30, 0.12);
	}

	@media (prefers-reduced-motion: reduce) {
		.benefit-card:hover {
			transform: none;
		}
	}

	.benefit-icon {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 12px;
		display: grid;
		place-items: center;
		font-size: 1.1rem;
		color: var(--maroon);
		background: linear-gradient(145deg, rgba(255, 236, 210, 0.9), rgba(201, 162, 39, 0.2));
		border: 1px solid rgba(201, 162, 39, 0.35);
		margin-bottom: 1rem;
	}

	.benefit-card h3 {
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 650;
		margin: 0 0 0.5rem;
		line-height: 1.25;
		color: var(--ink);
	}

	.benefit-card p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}

	.closing {
		text-align: center;
		padding: clamp(4rem, 12vw, 8rem) 1.5rem 6rem;
		max-width: 40rem;
		margin: 0 auto;
	}

	.closing-head {
		font-family: var(--font-display);
		font-size: clamp(1.85rem, 4vw, 2.75rem);
		margin: 0 0 1rem;
	}

	.closing-sub {
		margin: 0 0 2rem;
		font-size: 1.12rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}
</style>

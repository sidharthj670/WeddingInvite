<script lang="ts">
	import type { WeddingPayload } from '$lib/payload';
	import {
		getHeroImageSrc,
		getMusicPlaybackSrc,
		formatEventWhen,
		getDisplayCoupleLine
	} from '$lib/payload';
	import BackgroundMusic from '$lib/invite-templates/BackgroundMusic.svelte';
	import { inView } from '$lib/actions/inView';

	let { payload, preview = false }: { payload: WeddingPayload; preview?: boolean } = $props();

	function safeUrl(u: string): string | null {
		const t = u?.trim();
		if (!t) return null;
		if (t.startsWith('/')) return t;
		try {
			const x = new URL(t);
			return x.protocol === 'http:' || x.protocol === 'https:' ? x.href : null;
		} catch {
			return null;
		}
	}

	const musicBg = $derived(getMusicPlaybackSrc(payload));
	const gallery = $derived(
		(payload.galleryImageUrls ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 12)
	);

	const hasSplitNames = $derived(
		!!(payload.groomFirstName?.trim() || payload.brideFirstName?.trim())
	);
	const hasEventList = $derived((payload.events ?? []).some((e) => e.title?.trim()));
	const weddingWhen = $derived(payload.weddingDate?.trim() || '');

	let reduceMotion = $state(false);

	/** Apple-style “scroll scrubs a scene” — off in preview / reduced motion */
	const cinematicOn = $derived(!(preview || reduceMotion));

	const headlineStatement = $derived(
		(payload.tagline?.trim() || getDisplayCoupleLine(payload)).trim() || 'Celebration awaits.'
	);

	let now = $state(0);
	let scrollProgress = $state(0);
	let heroProgress = $state(0);
	let statementProgress = $state(0);
	let heroTrackEl = $state<HTMLElement | null>(null);
	let statementTrackEl = $state<HTMLElement | null>(null);

	function trackProgress(el: HTMLElement | null): number {
		if (typeof window === 'undefined' || !el) return 0;
		const vh = window.innerHeight;
		const range = el.offsetHeight - vh;
		if (range <= 0) return 0;
		const top = el.getBoundingClientRect().top;
		const scrolled = -top;
		return Math.max(0, Math.min(1, scrolled / range));
	}

	let scrollRaf = 0;
	function readScroll() {
		if (typeof window === 'undefined' || preview) return;
		const doc = document.documentElement;
		const max = Math.max(1, doc.scrollHeight - window.innerHeight);
		scrollProgress = window.scrollY / max;
		if (cinematicOn) {
			heroProgress = trackProgress(heroTrackEl);
			statementProgress = trackProgress(statementTrackEl);
		} else {
			heroProgress = 0;
			statementProgress = 0;
		}
	}

	function onScrollFrame() {
		if (scrollRaf) return;
		scrollRaf = requestAnimationFrame(() => {
			readScroll();
			scrollRaf = 0;
		});
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		now = Date.now();
	});

	$effect(() => {
		if (typeof window === 'undefined' || !payload.countdownTargetISO?.trim() || reduceMotion) return;
		const id = window.setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(id);
	});

	$effect(() => {
		if (typeof window === 'undefined' || preview) return;
		void heroTrackEl;
		void statementTrackEl;
		void cinematicOn;
		readScroll();
		window.addEventListener('scroll', onScrollFrame, { passive: true });
		window.addEventListener('resize', onScrollFrame, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScrollFrame);
			window.removeEventListener('resize', onScrollFrame);
			if (scrollRaf) cancelAnimationFrame(scrollRaf);
			scrollRaf = 0;
		};
	});

	const countdown = $derived.by(() => {
		const iso = payload.countdownTargetISO?.trim();
		if (!iso) return null;
		const end = Date.parse(iso);
		if (Number.isNaN(end)) return null;
		const ms = Math.max(0, end - now);
		const d = Math.floor(ms / 86400000);
		const h = Math.floor((ms % 86400000) / 3600000);
		const m = Math.floor((ms % 3600000) / 60000);
		const s = Math.floor((ms % 60000) / 1000);
		return { d, h, m, s };
	});

	const hasKnow = $derived(
		!!(
			payload.thingsToKnow?.hashtag?.trim() ||
			payload.hashtag?.trim() ||
			payload.thingsToKnow?.weather?.trim() ||
			payload.thingsToKnow?.staff?.trim() ||
			payload.thingsToKnow?.parking?.trim()
		) || !!payload.coordinatorNote?.trim()
	);
</script>

<div class="scroll" class:preview class:scene-cinematic={cinematicOn} data-template="wedding-scroll-v2">
	<BackgroundMusic src={musicBg} {preview} />
	{#if !preview && !reduceMotion}
		<div
			class="read-progress"
			style="transform: scaleX({scrollProgress})"
			aria-hidden="true"
		></div>
	{/if}

	<div
		class="scene-hero-track"
		class:scene-cinematic={cinematicOn}
		bind:this={heroTrackEl}
	>
		<div class="scene-hero-sticky">
			<div
				class="hero-parallax-inner"
				style={cinematicOn
					? `transform: translate3d(0, ${heroProgress * 28}px, 0) scale(${1.15 - heroProgress * 0.1})`
					: undefined}
			>
				<img class="hero-img" src={getHeroImageSrc(payload)} alt="" fetchpriority="high" />
			</div>
			<div class="hero-scrim"></div>
			<div
				class="hero-scrim-deep"
				style={cinematicOn ? `opacity: ${0.28 + heroProgress * 0.52}` : undefined}
			></div>
			<div class="hero-grain" aria-hidden="true"></div>
			<div
				class="hero-copy"
				class:cinematic-text={cinematicOn}
				style={cinematicOn
					? `opacity: ${Math.max(0.22, 1 - heroProgress * 0.68)}; transform: translate3d(0, ${heroProgress * 58}px, 0)`
					: undefined}
			>
				<p class="kicker">Wedding invitation</p>
				<h1 class="names" class:single={!hasSplitNames}>
					{#if hasSplitNames}
						<span class="groom reveal-t">{payload.groomFirstName?.trim() || '—'}</span>
						<span class="weds reveal-t d1">weds</span>
						<span class="bride reveal-t d2">{payload.brideFirstName?.trim() || '—'}</span>
					{:else}
						<span class="fallback-line reveal-t">{payload.coupleNames?.trim() || 'Names'}</span>
					{/if}
				</h1>
				{#if weddingWhen}
					<p class="hero-date reveal-t d3">{weddingWhen}</p>
				{/if}
				{#if payload.openingMantra?.trim()}
					<p class="mantra reveal-t d4">{payload.openingMantra}</p>
				{/if}
				{#if safeUrl(payload.rsvpUrl)}
					<a class="hero-cta reveal-t d5" href="#rsvp-scroll">Scroll to RSVP</a>
				{/if}
			</div>
			<div
				class="hero-chevron"
				aria-hidden="true"
				style={cinematicOn ? `opacity: ${Math.max(0, 1 - heroProgress * 1.4)}` : undefined}
			>
				<span></span>
			</div>
		</div>
	</div>

	{#if cinematicOn}
		<div class="scene-statement-track scene-cinematic" bind:this={statementTrackEl}>
			<div class="scene-statement-sticky">
				<p class="statement-eyebrow">Get the highlights</p>
				<h2
					class="statement-huge"
					style={`opacity: ${0.32 + 0.68 * Math.sin(statementProgress * Math.PI)}; transform: scale(${0.86 + statementProgress * 0.14})`}
				>
					{headlineStatement}
				</h2>
				{#if weddingWhen}
					<p class="statement-when" style={`opacity: ${0.15 + statementProgress * 0.85}`}>
						{weddingWhen}
					</p>
				{/if}
			</div>
		</div>
	{:else}
		<section class="statement-fallback" aria-label="Highlight">
			<div class="inner narrow center">
				<p class="statement-fallback-text">{headlineStatement}</p>
			</div>
		</section>
	{/if}

	<section class="band light reveal-section" use:inView>
		<div class="inner narrow">
			<p class="eyebrow-accent">Blessings</p>
			{#if payload.blessingIntro?.trim() || (payload.blessingLines?.length ?? 0) > 0}
				<p class="bless-intro">{payload.blessingIntro || 'With the blessings of'}</p>
				<ul class="bless-list">
					{#each payload.blessingLines ?? [] as line, i (i)}
						{#if line?.trim()}
							<li class="bless-li" style="--st: {i * 0.06}s">{line}</li>
						{/if}
					{/each}
				</ul>
			{:else}
				<p class="bless-intro">With the blessings of</p>
				<ul class="bless-list">
					<li class="bless-li" style="--st: 0s">{payload.groomParents || "Groom's parents"}</li>
					<li class="bless-li" style="--st: 0.08s">{payload.brideParents || "Bride's parents"}</li>
				</ul>
			{/if}
			<p class="invite-label">Invite</p>
			<p class="invite-lead">{payload.inviteLead || 'We joyfully invite you to celebrate with us.'}</p>
		</div>
	</section>

	<section class="band cream reveal-section" use:inView>
		<div class="inner narrow">
			<h2 class="h2">Together with our families</h2>
			{#if payload.groomLineage?.trim()}
				<p class="lineage"><strong>Groom</strong> — {payload.groomLineage}</p>
			{/if}
			{#if payload.brideLineage?.trim()}
				<p class="lineage"><strong>Bride</strong> — {payload.brideLineage}</p>
			{/if}
			{#if payload.personalLetter?.trim()}
				<div class="letter">
					{#each payload.personalLetter.split('\n\n') as para}
						{#if para.trim()}
							<p>{para.trim()}</p>
						{/if}
					{/each}
				</div>
			{:else if payload.tagline?.trim()}
				<p class="letter tagline-only">{payload.tagline}</p>
			{/if}
			<p class="sign">{payload.signOffLine || 'Looking forward to celebrating with you.'}</p>
		</div>
	</section>

	{#if hasEventList}
		<section class="band light reveal-section" use:inView>
			<div class="inner">
				<p class="eyebrow-accent">Schedule</p>
				<h2 class="h2">Celebrations</h2>
				<ul class="events">
					{#each payload.events as ev, i (i)}
						{#if ev.title?.trim()}
							<li class="event-card" style="--st: {i * 0.07}s">
								<h3>{ev.title}</h3>
								<p class="when">{formatEventWhen(ev)}</p>
								<p class="where">{ev.venueName}</p>
								{#if ev.venueAddress?.trim()}
									<p class="addr">{ev.venueAddress}</p>
								{/if}
								{#if safeUrl(ev.mapUrl)}
									<a class="map-chip" href={ev.mapUrl} target="_blank" rel="noopener noreferrer"
										>Directions</a
									>
								{/if}
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	<section id="rsvp-scroll" class="band maroon reveal-section rsvp-band" use:inView>
		<div class="inner narrow cta-block">
			<h2 class="h2 light">RSVP</h2>
			<p class="rsvp-lead">We’d love to know you’re celebrating with us.</p>
			{#if safeUrl(payload.rsvpUrl)}
				<a class="btn btn-glow" href={payload.rsvpUrl} target="_blank" rel="noopener noreferrer">
					<span>Open RSVP</span>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M7 17L17 7M17 7H9M17 7V15"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
			{:else}
				<p class="muted">RSVP link will appear here once added.</p>
			{/if}
		</div>
	</section>

	{#if hasKnow}
		<section class="band know-wrap reveal-section" use:inView>
			<div class="inner">
				<h2 class="h2 h2-center">Things to know</h2>
				<p class="know-sub">
					A few details so you can relax and enjoy every moment — tap a card to read more.
				</p>
				<div class="grid-know">
					{#if payload.thingsToKnow?.hashtag?.trim() || payload.hashtag?.trim()}
						<details class="know-card">
							<summary>Hashtag</summary>
							<div class="know-body">
								<p>{payload.thingsToKnow?.hashtag || payload.hashtag}</p>
							</div>
						</details>
					{/if}
					{#if payload.thingsToKnow?.weather?.trim()}
						<details class="know-card">
							<summary>Weather</summary>
							<div class="know-body">
								<p>{payload.thingsToKnow.weather}</p>
							</div>
						</details>
					{/if}
					{#if payload.thingsToKnow?.staff?.trim()}
						<details class="know-card">
							<summary>Staff &amp; helpers</summary>
							<div class="know-body">
								<p>{payload.thingsToKnow.staff}</p>
							</div>
						</details>
					{/if}
					{#if payload.thingsToKnow?.parking?.trim()}
						<details class="know-card">
							<summary>Parking</summary>
							<div class="know-body">
								<p>{payload.thingsToKnow.parking}</p>
							</div>
						</details>
					{/if}
				</div>
				{#if payload.coordinatorNote?.trim()}
					<p class="coord">{payload.coordinatorNote}</p>
				{/if}
			</div>
		</section>
	{/if}

	{#if safeUrl(payload.instagramUrl)}
		<section class="band cream reveal-section" use:inView>
			<div class="inner narrow center insta-block">
				<h2 class="h2">Follow the celebration</h2>
				<p class="insta-hint">Stories, reels, and behind-the-scenes from the week.</p>
				<a class="insta-btn" href={payload.instagramUrl} target="_blank" rel="noopener noreferrer">
					<span class="insta-icon" aria-hidden="true"></span>
					Open Instagram
				</a>
			</div>
		</section>
	{/if}

	{#if countdown}
		<section class="band countdown reveal-section" use:inView>
			<div class="inner narrow center">
				<h2 class="h2">The countdown</h2>
				{#if reduceMotion}
					<p class="count-static" aria-live="polite">
						{countdown.d} days, {countdown.h} hours, {countdown.m} minutes, {countdown.s} seconds
					</p>
				{:else}
					<div class="digits" aria-live="polite">
						<span class="digit-card"><strong>{countdown.d}</strong><small>days</small></span>
						<span class="digit-card"><strong>{countdown.h}</strong><small>hrs</small></span>
						<span class="digit-card"><strong>{countdown.m}</strong><small>min</small></span>
						<span class="digit-card"><strong>{countdown.s}</strong><small>sec</small></span>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	{#if gallery.length}
		<section class="band gal-section reveal-section" use:inView>
			<div class="inner full-bleed">
				<h2 class="h2 h2-pad">{payload.galleryTitle || 'Gallery'}</h2>
				<div class="gal-strip">
					{#each gallery as src, i (src + i)}
						<button
							type="button"
							class="gal-tile"
							onclick={() => window.open(src, '_blank', 'noopener,noreferrer')}
						>
							<img src={src} alt="" loading="lazy" />
							<span class="gal-zoom-hint" aria-hidden="true">View</span>
						</button>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<footer class="foot">
		<p>{payload.footerFamilyNote || payload.footerNote || 'With love.'}</p>
		{#if preview}
			<p class="pv">Preview</p>
		{/if}
	</footer>
</div>

<style>
	.scroll {
		--ink: #1a1218;
		--cream: #faf5ef;
		--paper: #fffdf9;
		--maroon: #5c2438;
		--gold: #c9a227;
		--gold-soft: rgba(201, 162, 39, 0.35);
		font-family: var(--font-body);
		color: var(--ink);
		background: var(--cream);
		scroll-behavior: smooth;
		position: relative;
	}

	.scroll.preview {
		outline: 2px dashed var(--gold);
	}

	.read-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		z-index: 50;
		background: linear-gradient(90deg, var(--gold), #e8d5a3, var(--maroon));
		transform-origin: left center;
		will-change: transform;
	}

	.scroll.scene-cinematic {
		scroll-snap-type: y proximity;
	}

	.scene-hero-track {
		position: relative;
	}

	.scene-hero-track.scene-cinematic {
		height: min(215vh, 2600px);
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.scene-hero-track:not(.scene-cinematic) {
		min-height: 88vh;
	}

	.scene-hero-sticky {
		position: relative;
		min-height: 88vh;
		display: grid;
		align-items: end;
		overflow: clip;
	}

	.scene-hero-track.scene-cinematic .scene-hero-sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100dvh;
		min-height: unset;
	}

	.hero-parallax-inner {
		position: absolute;
		inset: 0;
		will-change: transform;
	}

	.hero-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.08);
	}

	.scene-hero-track.scene-cinematic .hero-img {
		transform: none;
	}

	.hero-scrim {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 90% 70% at 50% 100%, rgba(26, 18, 24, 0.88) 0%, transparent 55%),
			linear-gradient(180deg, rgba(26, 18, 24, 0.15) 0%, rgba(26, 18, 24, 0.55) 100%);
		pointer-events: none;
	}

	.hero-scrim-deep {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 0%, rgba(6, 4, 8, 0.62) 100%);
		pointer-events: none;
	}

	.hero-copy {
		position: relative;
		z-index: 1;
		padding: clamp(2rem, 6vw, 4rem);
		padding-bottom: clamp(3rem, 10vw, 5rem);
		text-align: center;
		color: #fffaf7;
		will-change: opacity, transform;
	}

	.hero-copy.cinematic-text .reveal-t,
	.hero-copy.cinematic-text .kicker {
		opacity: 1 !important;
		animation: none !important;
	}

	.scene-statement-track.scene-cinematic {
		height: min(165vh, 2200px);
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.scene-statement-sticky {
		position: sticky;
		top: 0;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: clamp(2rem, 6vw, 4rem);
		text-align: center;
		background: radial-gradient(ellipse 85% 55% at 50% 35%, #2a1e24 0%, #0a0809 72%);
		color: #f5f0ea;
	}

	.statement-eyebrow {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.34em;
		text-transform: uppercase;
		opacity: 0.55;
		margin: 0 0 1rem;
	}

	.statement-huge {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.85rem, 6.5vw, 3.75rem);
		line-height: 1.1;
		margin: 0;
		max-width: 20ch;
		will-change: transform, opacity;
		text-wrap: balance;
	}

	.statement-when {
		margin: 1.25rem 0 0;
		font-size: 1.06rem;
		letter-spacing: 0.05em;
	}

	.statement-fallback {
		padding: clamp(2rem, 5vw, 3rem) 1.25rem;
		background: linear-gradient(180deg, #0f0c0e, #1a1418);
		color: #f2ebe4;
	}

	.statement-fallback-text {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 3.5vw, 1.85rem);
		line-height: 1.35;
	}

	.scroll.scene-cinematic .band,
	.scroll.scene-cinematic .gal-section,
	.scroll.scene-cinematic .foot {
		scroll-snap-align: start;
	}

	.hero-grain {
		position: absolute;
		inset: 0;
		opacity: 0.07;
		pointer-events: none;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		mix-blend-mode: overlay;
	}

	.kicker {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		opacity: 0;
		animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
	}

	.names {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2.2rem, 7vw, 3.75rem);
		line-height: 1.08;
		margin: 0.35rem 0 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		gap: 0.35rem 0.85rem;
	}

	.names.single {
		display: block;
	}

	.reveal-t {
		opacity: 0;
		animation: fadeUp 0.95s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.d1 {
		animation-delay: 0.12s;
	}
	.d2 {
		animation-delay: 0.22s;
	}
	.d3 {
		animation-delay: 0.32s;
	}
	.d4 {
		animation-delay: 0.42s;
	}
	.d5 {
		animation-delay: 0.52s;
	}

	.fallback-line {
		display: block;
	}

	.weds {
		font-weight: 500;
		font-style: italic;
		opacity: 0.92;
		font-size: 0.52em;
		letter-spacing: 0.02em;
	}

	.hero-date {
		margin: 1rem 0 0;
		font-size: clamp(1rem, 2.4vw, 1.2rem);
		letter-spacing: 0.04em;
		font-weight: 500;
		opacity: 0.94;
	}

	.mantra {
		margin: 1rem 0 0;
		font-size: clamp(1rem, 2.5vw, 1.2rem);
		letter-spacing: 0.14em;
		opacity: 0.95;
	}

	.hero-cta {
		display: inline-flex;
		margin-top: 1.5rem;
		padding: 0.55rem 1.2rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 250, 247, 0.45);
		color: #fffaf7;
		text-decoration: none;
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		backdrop-filter: blur(8px);
		background: rgba(26, 18, 24, 0.25);
		transition:
			transform 0.25s ease,
			background 0.25s ease,
			border-color 0.25s ease;
	}

	.hero-cta:hover {
		transform: translateY(-2px);
		background: rgba(255, 250, 247, 0.12);
		border-color: rgba(255, 250, 247, 0.75);
	}

	.hero-chevron {
		position: absolute;
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
		opacity: 0.85;
		animation: bounceY 2.2s ease-in-out infinite;
	}

	.hero-chevron span {
		display: block;
		width: 26px;
		height: 26px;
		border-right: 2px solid #fffaf7;
		border-bottom: 2px solid #fffaf7;
		transform: rotate(45deg);
		margin-top: -8px;
	}

	.band {
		padding: clamp(2.75rem, 7vw, 4.5rem) clamp(1.25rem, 4vw, 2rem);
	}

	.band.light {
		background: var(--paper);
	}

	.band.cream {
		background: linear-gradient(180deg, #fdf8f2 0%, #f3e4d6 55%, #efe6dc 100%);
	}

	.band.maroon {
		background: linear-gradient(165deg, #5c2438 0%, #3d1828 48%, #2a101c 100%);
		color: #fffaf7;
	}

	.band.countdown {
		background: radial-gradient(ellipse 120% 80% at 50% 0%, #2a1a22 0%, var(--ink) 55%);
		color: #fdf6ed;
	}

	.know-wrap {
		background:
			linear-gradient(180deg, rgba(255, 253, 249, 0.97), rgba(250, 245, 239, 0.98)),
			radial-gradient(ellipse 100% 60% at 50% 0%, rgba(201, 162, 39, 0.12), transparent 70%);
	}

	.reveal-section {
		opacity: 0.35;
		transform: translateY(36px);
		transition:
			opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.scroll :global(.reveal-section[data-in-view='true']) {
		opacity: 1;
		transform: none;
	}

	.inner {
		max-width: 52rem;
		margin: 0 auto;
	}

	.inner.narrow {
		max-width: 38rem;
	}

	.inner.center {
		text-align: center;
	}

	.inner.full-bleed {
		max-width: 72rem;
	}

	.h2 {
		font-family: var(--font-display);
		font-size: clamp(1.55rem, 3.2vw, 2.1rem);
		margin: 0 0 1.25rem;
		letter-spacing: -0.02em;
	}

	.h2-center {
		text-align: center;
	}

	.h2-pad {
		padding: 0 clamp(1rem, 3vw, 2rem);
		margin-bottom: 1rem;
	}

	.h2.light {
		color: #fffaf7;
	}

	.eyebrow-accent {
		font-family: var(--font-ui);
		font-size: 0.7rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--maroon);
		margin: 0 0 0.5rem;
		text-align: center;
		opacity: 0.85;
	}

	.bless-intro {
		text-align: center;
		font-style: italic;
		margin: 0 0 0.75rem;
		opacity: 0.88;
		font-size: 1.08rem;
	}

	.bless-list {
		list-style: none;
		margin: 0 0 1.75rem;
		padding: 0;
		text-align: center;
		font-size: clamp(1.02rem, 2.2vw, 1.15rem);
		line-height: 1.75;
	}

	.bless-li {
		opacity: 0;
		transform: translateY(12px);
		animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: var(--st, 0s);
	}

	.invite-label {
		text-align: center;
		font-family: var(--font-ui);
		font-size: 0.68rem;
		letter-spacing: 0.42em;
		text-transform: uppercase;
		color: var(--maroon);
		margin: 0 0 0.75rem;
	}

	.invite-lead {
		text-align: center;
		font-size: clamp(1.05rem, 2.3vw, 1.18rem);
		line-height: 1.75;
		margin: 0;
	}

	.lineage {
		font-size: 1.04rem;
		line-height: 1.65;
		margin: 0 0 0.85rem;
	}

	.letter p {
		margin: 0 0 1rem;
		line-height: 1.8;
		font-size: 1.04rem;
		opacity: 0.92;
	}

	.tagline-only {
		font-size: 1.12rem;
		line-height: 1.7;
		font-style: italic;
	}

	.sign {
		margin: 1.75rem 0 0;
		font-weight: 600;
		font-family: var(--font-display);
		font-size: 1.05rem;
	}

	.events {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 1.1rem;
	}

	.event-card {
		padding: 1.35rem 1.4rem;
		border-radius: 16px;
		border: 1px solid var(--gold-soft);
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(255, 252, 248, 0.75));
		box-shadow: 0 12px 40px rgba(50, 18, 28, 0.06);
		opacity: 0;
		transform: translateY(16px);
		animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: var(--st, 0s);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.event-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 18px 48px rgba(50, 18, 28, 0.1);
	}

	.events h3 {
		margin: 0 0 0.4rem;
		font-family: var(--font-display);
		font-size: 1.2rem;
	}

	.when {
		font-weight: 600;
		color: var(--maroon);
		margin: 0 0 0.3rem;
	}

	.where,
	.addr {
		margin: 0;
		font-size: 0.98rem;
	}

	.map-chip {
		display: inline-flex;
		margin-top: 0.65rem;
		padding: 0.35rem 0.85rem;
		border-radius: 999px;
		background: rgba(92, 36, 56, 0.08);
		color: var(--maroon);
		font-weight: 600;
		font-size: 0.88rem;
		text-decoration: none;
		border: 1px solid rgba(92, 36, 56, 0.2);
		transition: background 0.2s ease;
	}

	.map-chip:hover {
		background: rgba(92, 36, 56, 0.14);
	}

	.rsvp-band {
		position: relative;
		overflow: hidden;
	}

	.rsvp-band::before {
		content: '';
		position: absolute;
		inset: -40%;
		background: radial-gradient(circle at 30% 30%, rgba(201, 162, 39, 0.15), transparent 45%);
		pointer-events: none;
	}

	.cta-block {
		position: relative;
		z-index: 1;
		text-align: center;
	}

	.rsvp-lead {
		margin: 0 0 1.25rem;
		opacity: 0.88;
		font-size: 1.02rem;
		line-height: 1.55;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.85rem 1.65rem;
		border-radius: 999px;
		background: #fffaf7;
		color: var(--maroon);
		text-decoration: none;
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 1rem;
		border: none;
		cursor: pointer;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.btn-glow:hover {
		transform: translateY(-3px) scale(1.02);
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
	}

	.muted {
		opacity: 0.75;
		margin: 0;
	}

	.know-sub {
		text-align: center;
		max-width: 40ch;
		margin: -0.5rem auto 1.75rem;
		font-size: 0.98rem;
		line-height: 1.55;
		opacity: 0.82;
	}

	.grid-know {
		display: grid;
		gap: 0.85rem;
		grid-template-columns: 1fr;
	}

	@media (min-width: 640px) {
		.grid-know {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.know-card {
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.88);
		border: 1px solid rgba(92, 36, 56, 0.1);
		box-shadow: 0 8px 28px rgba(50, 18, 28, 0.05);
		overflow: hidden;
		transition:
			box-shadow 0.25s ease,
			border-color 0.25s ease;
	}

	.know-card:hover {
		border-color: rgba(201, 162, 39, 0.45);
	}

	.know-card[open] {
		box-shadow: 0 14px 40px rgba(50, 18, 28, 0.08);
		border-color: rgba(92, 36, 56, 0.18);
	}

	.know-card summary {
		list-style: none;
		cursor: pointer;
		padding: 1rem 1.15rem;
		font-family: var(--font-ui);
		font-size: 0.8rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--maroon);
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.know-card summary::-webkit-details-marker {
		display: none;
	}

	.know-card summary::after {
		content: '+';
		font-size: 1.25rem;
		font-weight: 400;
		opacity: 0.55;
		transition: transform 0.25s ease;
	}

	.know-card[open] summary::after {
		transform: rotate(45deg);
	}

	.know-body {
		padding: 0 1.15rem 1.1rem;
		border-top: 1px solid rgba(92, 36, 56, 0.08);
		animation: openIn 0.35s ease;
	}

	.know-body p {
		margin: 0.75rem 0 0;
		line-height: 1.55;
		font-size: 0.96rem;
	}

	.coord {
		margin: 1.75rem 0 0;
		text-align: center;
		font-size: 0.96rem;
		opacity: 0.85;
		line-height: 1.55;
	}

	.insta-block {
		padding: 0.5rem 0;
	}

	.insta-hint {
		margin: -0.35rem 0 1.25rem;
		opacity: 0.82;
		line-height: 1.55;
	}

	.insta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.75rem 1.5rem;
		border-radius: 999px;
		text-decoration: none;
		font-weight: 600;
		font-family: var(--font-ui);
		color: #fffaf7;
		background: linear-gradient(135deg, #6b3a4f, #4a2434);
		box-shadow: 0 12px 36px rgba(74, 36, 52, 0.35);
		border: 1px solid rgba(255, 250, 247, 0.12);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.insta-btn:hover {
		transform: translateY(-3px);
		box-shadow: 0 18px 44px rgba(74, 36, 52, 0.42);
	}

	.insta-icon {
		width: 22px;
		height: 22px;
		border-radius: 6px;
		background: linear-gradient(
			145deg,
			#fdf497 0%,
			#fdf497 8%,
			#fd5949 45%,
			#d6249f 60%,
			#285aeb 100%
		);
		opacity: 0.95;
	}

	.count-static {
		font-size: 1.1rem;
		margin: 0;
		opacity: 0.9;
	}

	.digits {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem 1.5rem;
		font-variant-numeric: tabular-nums;
	}

	.digit-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 4.25rem;
		padding: 0.65rem 0.5rem;
		border-radius: 12px;
		background: rgba(255, 250, 247, 0.06);
		border: 1px solid rgba(255, 250, 247, 0.1);
		transition: transform 0.35s ease;
	}

	.digit-card:hover {
		transform: translateY(-2px);
	}

	.digits strong {
		font-size: clamp(1.85rem, 4.5vw, 2.65rem);
		font-family: var(--font-display);
		line-height: 1;
	}

	.digits small {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		opacity: 0.72;
		margin-top: 0.35rem;
	}

	.gal-section {
		padding-bottom: clamp(3rem, 8vw, 5rem);
	}

	.gal-strip {
		display: flex;
		gap: 0.85rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		padding: 0.5rem clamp(1rem, 3vw, 2rem) 1rem;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
	}

	.gal-tile {
		position: relative;
		flex: 0 0 min(78vw, 340px);
		scroll-snap-align: center;
		border: none;
		padding: 0;
		border-radius: 14px;
		overflow: hidden;
		cursor: pointer;
		background: #1a1218;
		aspect-ratio: 4 / 5;
		transition:
			transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 0.35s ease;
	}

	.gal-tile:hover,
	.gal-tile:focus-visible {
		transform: scale(1.03);
		box-shadow: 0 20px 50px rgba(26, 18, 24, 0.35);
		outline: none;
	}

	.gal-tile img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.5s ease;
	}

	.gal-tile:hover img {
		transform: scale(1.06);
	}

	.gal-zoom-hint {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		padding: 0.3rem 0.65rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		background: rgba(26, 18, 24, 0.65);
		color: #fffaf7;
		backdrop-filter: blur(6px);
		opacity: 0;
		transition: opacity 0.25s ease;
	}

	.gal-tile:hover .gal-zoom-hint,
	.gal-tile:focus-visible .gal-zoom-hint {
		opacity: 1;
	}

	.foot {
		padding: 2.75rem 1.5rem;
		text-align: center;
		font-size: 0.96rem;
		background: var(--paper);
		border-top: 1px solid rgba(92, 36, 56, 0.1);
	}

	.pv {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: var(--maroon);
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(22px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes bounceY {
		0%,
		100% {
			transform: translateX(-50%) translateY(0);
		}
		50% {
			transform: translateX(-50%) translateY(8px);
		}
	}

	@keyframes openIn {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.read-progress,
		.hero-chevron {
			animation: none !important;
			display: none;
		}

		.hero-parallax-inner {
			transform: none !important;
		}

		.kicker,
		.reveal-t,
		.bless-li,
		.event-card {
			opacity: 1 !important;
			animation: none !important;
			transform: none !important;
		}

		.reveal-section {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
		}

		.event-card:hover,
		.gal-tile:hover,
		.btn-glow:hover,
		.insta-btn:hover,
		.digit-card:hover {
			transform: none;
		}

		.gal-tile img {
			transition: none;
		}
	}
</style>

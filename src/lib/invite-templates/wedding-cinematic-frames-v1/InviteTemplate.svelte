<script lang="ts">
	import type { WeddingPayload } from '$lib/payload';
	import {
		getMusicPlaybackSrc,
		formatEventWhen,
		getDisplayCoupleLine
	} from '$lib/payload';
	import BackgroundMusic from '$lib/invite-templates/BackgroundMusic.svelte';

	let { payload, preview = false }: { payload: WeddingPayload; preview?: boolean } = $props();

	const FRAME_START = 4;
	const FRAME_END = 300;
	const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;
	/** Full film scrub length — keeps ~9 viewport heights regardless of frame count. */
	const TARGET_SCROLL_VH = $derived(preview ? 780 : 900);
	const SCROLL_HEIGHT_PER_FRAME = $derived(TARGET_SCROLL_VH / TOTAL_FRAMES);

	const frameUrls = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
		const n = FRAME_START + i;
		return `/wedding-frames/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;
	});

	/** Map scroll progress to frame position with smoothstep for fluid scrubbing. */
	function framePosition(progress: number): number {
		const clamped = Math.max(0, Math.min(1, progress));
		const eased = clamped * clamped * (3 - 2 * clamped);
		return eased * (TOTAL_FRAMES - 1);
	}

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
	const hasSplitNames = $derived(
		!!(payload.groomFirstName?.trim() || payload.brideFirstName?.trim())
	);
	const weddingWhen = $derived(payload.weddingDate?.trim() || '');
	const coupleLine = $derived(getDisplayCoupleLine(payload));
	const events = $derived((payload.events ?? []).filter((e) => e.title?.trim()));
	const gallery = $derived(
		(payload.galleryImageUrls ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 6)
	);

	type TextBeat = {
		eyebrow: string;
		title: string;
		body: string;
		start: number;
		end: number;
		cta?: { label: string; href: string } | null;
	};

	const textBeats = $derived.by((): TextBeat[] => {
		const beats: TextBeat[] = [];
		const add = (start: number, end: number, eyebrow: string, title: string, body: string, cta?: { label: string; href: string } | null) => {
			beats.push({ start, end, eyebrow, title, body, cta: cta ?? null });
		};

		add(0.0, 0.10, 'Wedding invitation',
			hasSplitNames
				? `${payload.groomFirstName?.trim() || '—'} & ${payload.brideFirstName?.trim() || '—'}`
				: coupleLine,
			payload.tagline?.trim() || 'Two hearts, one celebration.'
		);

		add(0.10, 0.20, 'Save the date',
			weddingWhen || 'Our wedding day',
			payload.openingMantra?.trim() || payload.openingQuote?.trim() || 'With joy in our hearts, we invite you.'
		);

		add(0.20, 0.30,
			payload.openingAttribution?.trim() || 'Opening',
			payload.openingQuote?.trim() ? 'A note to begin' : 'Blessings upon us',
			payload.openingQuote?.trim() || payload.blessingIntro?.trim() || 'With the blessings of our families, we begin this journey together.'
		);

		const lines = (payload.blessingLines ?? []).filter((l) => l?.trim());
		add(0.30, 0.40, 'Blessings',
			payload.blessingIntro?.trim() || 'With the blessings of',
			lines.length > 0
				? lines.join(' · ')
				: [payload.groomParents, payload.brideParents].filter(Boolean).join(' · ') || 'Our beloved families'
		);

		add(0.40, 0.50, 'Our story',
			payload.inviteLead?.trim() ? 'You are invited' : 'Celebrate with us',
			payload.personalLetter?.trim() || payload.inviteLead?.trim() || 'We joyfully invite you to share in the happiness of our wedding day.'
		);

		const lineage = [payload.groomLineage, payload.brideLineage].filter((s) => s?.trim()).join('\n\n');
		add(0.50, 0.60, 'Together with our families',
			(payload.groomParents?.trim() || payload.brideParents?.trim()) ? 'With love from' : 'Our families',
			lineage || [payload.groomFamilyNote, payload.brideFamilyNote].filter((s) => s?.trim()).join('\n\n') || 'With the love and blessings of both our families.'
		);

		const ev = events[0];
		add(0.60, 0.70, 'Ceremony & celebration',
			ev?.title?.trim() || 'The wedding',
			ev ? [formatEventWhen(ev), ev.venueName?.trim(), ev.venueAddress?.trim()].filter(Boolean).join(' · ') : 'Details of our celebration will follow shortly.'
		);

		const bits = [
			payload.thingsToKnow?.hashtag?.trim() || payload.hashtag?.trim(),
			payload.thingsToKnow?.weather?.trim(),
			payload.thingsToKnow?.parking?.trim(),
			payload.coordinatorNote?.trim()
		].filter(Boolean);
		add(0.70, 0.80,
			payload.galleryTitle?.trim() || 'Before the day',
			gallery.length ? 'Moments we cherish' : 'Things to know',
			bits.length ? bits.join(' · ') : 'We cannot wait to celebrate with you.'
		);

		add(0.80, 0.90, 'Join us', 'RSVP',
			payload.signOffLine?.trim() || 'Kindly let us know if you can join us.',
			safeUrl(payload.rsvpUrl) ? { label: 'Confirm attendance', href: safeUrl(payload.rsvpUrl)! } : null
		);

		add(0.90, 1.0, 'With love',
			payload.footerFamilyNote?.trim() || coupleLine,
			payload.footerNote?.trim() || payload.contactPhone?.trim() || 'Thank you for being part of our story.',
			safeUrl(payload.instagramUrl) ? { label: payload.hashtag?.trim() || 'Follow our journey', href: safeUrl(payload.instagramUrl)! } : null
		);

		return beats;
	});

	let reduceMotion = $state(false);
	let globalProgress = $state(0);
	let trackEl = $state<HTMLElement | null>(null);
	let stickyEl = $state<HTMLElement | null>(null);
	let scrollRaf = 0;

	function readScroll() {
		if (typeof window === 'undefined' || !trackEl) return;

		if (preview) {
			let container: HTMLElement | null = trackEl.parentElement;
			while (container) {
				const st = getComputedStyle(container);
				if (/(auto|scroll|overlay)/.test(st.overflowY) && container.scrollHeight > container.clientHeight + 2) break;
				container = container.parentElement;
			}
			if (container) {
				const range = trackEl.offsetHeight - container.clientHeight;
				if (range > 0) {
					const top = trackEl.getBoundingClientRect().top - container.getBoundingClientRect().top;
					globalProgress = Math.max(0, Math.min(1, -top / range));
				}
			}
			return;
		}

		const vh = window.innerHeight;
		const range = trackEl.offsetHeight - vh;
		if (range <= 0) return;
		const top = trackEl.getBoundingClientRect().top;
		globalProgress = Math.max(0, Math.min(1, -top / range));
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
	});

	$effect(() => {
		if (typeof window === 'undefined' || !trackEl) return;
		readScroll();

		let target: HTMLElement | Window = window;
		if (preview) {
			let container: HTMLElement | null = trackEl.parentElement;
			while (container) {
				const st = getComputedStyle(container);
				if (/(auto|scroll|overlay)/.test(st.overflowY) && container.scrollHeight > container.clientHeight + 2) {
					target = container;
					break;
				}
				container = container.parentElement;
			}
		}

		target.addEventListener('scroll', onScrollFrame, { passive: true });
		window.addEventListener('resize', onScrollFrame, { passive: true });
		return () => {
			target.removeEventListener('scroll', onScrollFrame);
			window.removeEventListener('resize', onScrollFrame);
			if (scrollRaf) cancelAnimationFrame(scrollRaf);
			scrollRaf = 0;
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		const idle = window.requestIdleCallback?.bind(window) ?? ((cb: () => void) => setTimeout(cb, 80));
		idle(() => {
			for (const url of frameUrls) {
				const img = new Image();
				img.src = url;
			}
		});
	});

	const currentFrame = $derived.by(() => {
		const pos = framePosition(globalProgress);
		const idx = Math.floor(pos);
		const blend = pos - idx;
		return {
			index: Math.min(idx, TOTAL_FRAMES - 1),
			next: Math.min(idx + 1, TOTAL_FRAMES - 1),
			blend
		};
	});

	function beatOpacity(beat: TextBeat): number {
		if (reduceMotion) return globalProgress >= beat.start && globalProgress < beat.end ? 1 : 0;
		const fadeIn = 0.03;
		const fadeOut = 0.03;
		if (globalProgress < beat.start) return 0;
		if (globalProgress > beat.end) return 0;
		const inP = Math.min(1, (globalProgress - beat.start) / fadeIn);
		const outP = Math.min(1, (beat.end - globalProgress) / fadeOut);
		return Math.min(inP, outP);
	}
</script>

<div
	class="cinema"
	class:preview
	class:immersive={!reduceMotion && !preview}
	data-template="wedding-cinematic-frames-v1"
>
	<BackgroundMusic src={musicBg} {preview} />

	{#if !reduceMotion && !preview}
		<div
			class="read-progress"
			style="transform: scaleX({globalProgress})"
			aria-hidden="true"
		></div>
	{/if}

	<div
		class="scroll-track"
		style="height: {TOTAL_FRAMES * SCROLL_HEIGHT_PER_FRAME}vh"
		bind:this={trackEl}
	>
		<div class="viewport" bind:this={stickyEl}>
			<!-- Frame layer: continuous crossfade -->
			<div class="frame-stack" aria-hidden="true">
				<img
					class="frame-img"
					src={frameUrls[currentFrame.index]}
					alt=""
					style="opacity: {1 - currentFrame.blend}"
				/>
				{#if currentFrame.blend > 0.001 && currentFrame.index !== currentFrame.next}
					<img
						class="frame-img frame-blend"
						src={frameUrls[currentFrame.next]}
						alt=""
						style="opacity: {currentFrame.blend}"
					/>
				{/if}
			</div>

			<div class="frame-vignette"></div>
			<div class="frame-grain" aria-hidden="true"></div>

			<!-- Text beats overlay -->
			{#each textBeats as beat, bi (bi)}
				{@const opacity = beatOpacity(beat)}
				{#if opacity > 0.01}
					<div
						class="beat-overlay"
						style="
							opacity: {opacity};
							transform: translate3d(0, {(1 - opacity) * 30}px, 0);
							filter: blur({(1 - opacity) * 6}px);
						"
					>
						<p class="eyebrow">{beat.eyebrow}</p>
						<h2 class="beat-title">{beat.title}</h2>
						<p class="beat-body">{beat.body}</p>

						{#if bi === 6 && events.length > 1 && opacity > 0.5}
							<ul class="event-list">
								{#each events.slice(1, 4) as ev, ei (ei)}
									<li style="opacity: {Math.min(1, (opacity - 0.5) * 2.5)}">
										<strong>{ev.title}</strong>
										<span>{formatEventWhen(ev)}</span>
										{#if ev.venueName?.trim()}<span>{ev.venueName}</span>{/if}
									</li>
								{/each}
							</ul>
						{/if}

						{#if bi === 7 && gallery.length && opacity > 0.5}
							<div class="mini-gallery">
								{#each gallery as src, gi (gi)}
									<img src={src} alt="" loading="lazy" style="opacity: {Math.min(1, (opacity - 0.5) * 2.5)}" />
								{/each}
							</div>
						{/if}

						{#if beat.cta && opacity > 0.6}
							<a
								class="beat-cta"
								href={beat.cta.href}
								target="_blank"
								rel="noopener noreferrer"
								style="opacity: {Math.min(1, (opacity - 0.6) * 3)}"
							>{beat.cta.label}</a>
						{/if}
					</div>
				{/if}
			{/each}

			{#if globalProgress < 0.02}
				<div
					class="scroll-cue"
					style="opacity: {Math.max(0, 1 - globalProgress * 60)}"
					aria-hidden="true"
				>
					<span>{preview ? 'Scroll preview' : 'Scroll'}</span>
				</div>
			{/if}
		</div>
	</div>

	<footer class="foot">
		<p>{payload.signOffLine?.trim() || payload.footerNote?.trim() || 'With love and gratitude.'}</p>
		{#if preview}
			<p class="pv">Preview — scroll inside panel to scrub frames</p>
		{/if}
	</footer>
</div>

<style>
	.cinema {
		--ink: #f8f4ef;
		--ink-soft: rgba(248, 244, 239, 0.82);
		--gold: #d4b56a;
		--maroon: #6b2233;
		--bg: #080608;
		font-family: var(--font-body);
		color: var(--ink);
		background: var(--bg);
		position: relative;
		overflow-x: clip;
	}

	.cinema.immersive {
		width: 100%;
		min-height: 100dvh;
	}

	.cinema.preview {
		outline: 2px dashed var(--gold);
	}

	.read-progress {
		position: fixed;
		top: 0; left: 0; right: 0;
		height: 2px;
		z-index: 60;
		background: linear-gradient(90deg, var(--gold), #f0e6c8, var(--maroon));
		transform-origin: left center;
		will-change: transform;
	}

	/* Single continuous scroll track */
	.scroll-track {
		position: relative;
	}

	.viewport {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100dvh;
		overflow: clip;
		background: var(--bg);
	}

	.cinema.preview .viewport {
		height: min(62vh, 480px);
		min-height: 280px;
	}

	/* Frame rendering */
	.frame-stack {
		position: absolute;
		inset: 0;
	}

	.frame-img {
		position: absolute;
		inset: 0;
		width: 100%; height: 100%;
		object-fit: cover;
		will-change: opacity;
	}

	.frame-blend {
		z-index: 1;
	}

	.frame-vignette {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 85% 65% at 50% 100%, rgba(8,6,8,0.82) 0%, transparent 58%),
			linear-gradient(180deg, rgba(8,6,8,0.2) 0%, rgba(8,6,8,0.55) 100%);
		pointer-events: none;
		z-index: 2;
	}

	.frame-grain {
		position: absolute;
		inset: 0;
		opacity: 0.05;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		pointer-events: none;
		z-index: 3;
	}

	/* Text beats */
	.beat-overlay {
		position: absolute;
		inset: auto 0 0;
		z-index: 4;
		padding: clamp(2rem, 7vw, 4.5rem) clamp(1.25rem, 5vw, 3rem);
		text-align: center;
		will-change: opacity, transform, filter;
	}

	.scroll-cue {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 5;
		font-family: var(--font-ui);
		font-size: 0.68rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--ink-soft);
		animation: bob 2.4s ease-in-out infinite;
	}

	.scroll-cue span::after {
		content: '';
		display: block;
		width: 1px; height: 24px;
		margin: 0.5rem auto 0;
		background: linear-gradient(180deg, var(--gold), transparent);
	}

	@keyframes bob {
		0%, 100% { transform: translateX(-50%) translateY(0); }
		50% { transform: translateX(-50%) translateY(6px); }
	}

	.eyebrow {
		margin: 0 0 0.65rem;
		font-family: var(--font-ui);
		font-size: 0.68rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: var(--gold);
		text-shadow: 0 2px 16px rgba(0,0,0,0.45);
	}

	.beat-title {
		margin: 0 0 0.85rem;
		font-family: var(--font-display);
		font-size: clamp(1.65rem, 5vw, 3rem);
		font-weight: 600;
		line-height: 1.12;
		letter-spacing: -0.02em;
		text-shadow: 0 4px 28px rgba(0,0,0,0.55);
	}

	.beat-body {
		margin: 0 auto;
		max-width: 36rem;
		font-size: clamp(0.98rem, 2.2vw, 1.1rem);
		line-height: 1.7;
		color: var(--ink-soft);
		white-space: pre-line;
		text-shadow: 0 2px 18px rgba(0,0,0,0.5);
	}

	.event-list {
		list-style: none;
		margin: 1.25rem auto 0;
		padding: 0;
		max-width: 28rem;
		display: grid;
		gap: 0.75rem;
		text-align: left;
	}

	.event-list li {
		padding: 0.85rem 1rem;
		border: 1px solid rgba(212,181,106,0.28);
		border-radius: 10px;
		background: rgba(8,6,8,0.45);
		backdrop-filter: blur(8px);
		display: grid;
		gap: 0.2rem;
	}

	.event-list strong {
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--ink);
	}

	.event-list span {
		font-size: 0.88rem;
		color: var(--ink-soft);
	}

	.mini-gallery {
		margin: 1.25rem auto 0;
		max-width: 24rem;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.45rem;
	}

	.mini-gallery img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid rgba(212,181,106,0.25);
	}

	.beat-cta {
		display: inline-block;
		margin-top: 1.35rem;
		padding: 0.8rem 1.6rem;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--maroon), #8b3048);
		color: #fffaf7;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-decoration: none;
		text-transform: uppercase;
		box-shadow: 0 8px 28px rgba(0,0,0,0.35);
	}

	.beat-cta:hover { color: #fffaf7; }

	.foot {
		padding: 2rem 1.5rem 2.5rem;
		text-align: center;
		font-size: 0.88rem;
		color: rgba(248,244,239,0.5);
	}

	.pv {
		margin-top: 0.65rem;
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold);
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-cue { animation: none; }
		.beat-overlay { filter: none !important; }
	}
</style>

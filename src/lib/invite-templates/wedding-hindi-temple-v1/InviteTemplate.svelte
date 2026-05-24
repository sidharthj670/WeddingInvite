<script lang="ts">
	import type { WeddingPayload } from '$lib/payload';
	import {
		getMusicPlaybackSrc,
		formatEventWhen,
		getDisplayCoupleLine
	} from '$lib/payload';
	import BackgroundMusic from '$lib/invite-templates/BackgroundMusic.svelte';
	import { BACKGROUND_IMAGE_URL } from './assets.config';

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
		const add = (
			start: number,
			end: number,
			eyebrow: string,
			title: string,
			body: string,
			cta?: { label: string; href: string } | null
		) => {
			beats.push({ start, end, eyebrow, title, body, cta: cta ?? null });
		};

		add(
			0.0,
			0.1,
			'विवाह निमंत्रण',
			hasSplitNames
				? `${payload.groomFirstName?.trim() || '—'} & ${payload.brideFirstName?.trim() || '—'}`
				: coupleLine,
			payload.tagline?.trim() || 'Two hearts, one sacred celebration.'
		);

		add(
			0.1,
			0.2,
			'Save the date',
			weddingWhen || 'Our wedding day',
			payload.openingMantra?.trim() ||
				payload.openingQuote?.trim() ||
				'With joy in our hearts, we invite you.'
		);

		add(
			0.2,
			0.3,
			payload.openingAttribution?.trim() || 'Blessings',
			payload.openingQuote?.trim() ? 'A note to begin' : 'शुभ आरंभ',
			payload.openingQuote?.trim() ||
				payload.blessingIntro?.trim() ||
				'With the blessings of our families, we begin this journey together.'
		);

		const lines = (payload.blessingLines ?? []).filter((l) => l?.trim());
		add(
			0.3,
			0.4,
			'With blessings',
			payload.blessingIntro?.trim() || 'With the blessings of',
			lines.length > 0
				? lines.join(' · ')
				: [payload.groomParents, payload.brideParents].filter(Boolean).join(' · ') ||
					'Our beloved families'
		);

		add(
			0.4,
			0.5,
			'Our story',
			payload.inviteLead?.trim() ? 'You are invited' : 'Celebrate with us',
			payload.personalLetter?.trim() ||
				payload.inviteLead?.trim() ||
				'We joyfully invite you to share in the happiness of our wedding day.'
		);

		const lineage = [payload.groomLineage, payload.brideLineage]
			.filter((s) => s?.trim())
			.join('\n\n');
		add(
			0.5,
			0.6,
			'Together with our families',
			payload.groomParents?.trim() || payload.brideParents?.trim() ? 'With love from' : 'Our families',
			lineage ||
				[payload.groomFamilyNote, payload.brideFamilyNote]
					.filter((s) => s?.trim())
					.join('\n\n') ||
				'With the love and blessings of both our families.'
		);

		const ev = events[0];
		add(
			0.6,
			0.7,
			'Ceremony & celebration',
			ev?.title?.trim() || 'The wedding',
			ev
				? [formatEventWhen(ev), ev.venueName?.trim(), ev.venueAddress?.trim()]
						.filter(Boolean)
						.join(' · ')
				: 'Details of our celebration will follow shortly.'
		);

		const bits = [
			payload.thingsToKnow?.hashtag?.trim() || payload.hashtag?.trim(),
			payload.thingsToKnow?.weather?.trim(),
			payload.thingsToKnow?.parking?.trim(),
			payload.coordinatorNote?.trim()
		].filter(Boolean);
		add(
			0.7,
			0.8,
			payload.galleryTitle?.trim() || 'Before the day',
			gallery.length ? 'Moments we cherish' : 'Things to know',
			bits.length ? bits.join(' · ') : 'We cannot wait to celebrate with you.'
		);

		add(
			0.8,
			0.9,
			'Join us',
			'RSVP',
			payload.signOffLine?.trim() || 'Kindly let us know if you can join us.',
			safeUrl(payload.rsvpUrl) ? { label: 'Confirm attendance', href: safeUrl(payload.rsvpUrl)! } : null
		);

		add(
			0.9,
			1.0,
			'With love',
			payload.footerFamilyNote?.trim() || coupleLine,
			payload.footerNote?.trim() ||
				payload.contactPhone?.trim() ||
				'Thank you for being part of our story.',
			safeUrl(payload.instagramUrl)
				? {
						label: payload.hashtag?.trim() || 'Follow our journey',
						href: safeUrl(payload.instagramUrl)!
					}
				: null
		);

		return beats;
	});

	let reduceMotion = $state(false);
	let globalProgress = $state(0);
	let trackEl = $state<HTMLElement | null>(null);
	let scrollRaf = 0;

	function readScroll() {
		if (typeof window === 'undefined' || !trackEl) return;

		if (preview) {
			let container: HTMLElement | null = trackEl.parentElement;
			while (container) {
				const st = getComputedStyle(container);
				if (/(auto|scroll|overlay)/.test(st.overflowY) && container.scrollHeight > container.clientHeight + 2)
					break;
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

	function beatOpacity(beat: TextBeat): number {
		if (reduceMotion) return globalProgress >= beat.start && globalProgress < beat.end ? 1 : 0;
		const fadeIn = 0.035;
		const fadeOut = 0.035;
		if (globalProgress < beat.start) return 0;
		if (globalProgress > beat.end) return 0;
		const inP = Math.min(1, (globalProgress - beat.start) / fadeIn);
		const outP = Math.min(1, (beat.end - globalProgress) / fadeOut);
		return Math.min(inP, outP);
	}
</script>

<div
	class="temple"
	class:preview
	class:immersive={!reduceMotion && !preview}
	data-template="wedding-hindi-temple-v1"
>
	<BackgroundMusic src={musicBg} {preview} />

	{#if !reduceMotion && !preview}
		<div class="read-progress" style="transform: scaleX({globalProgress})" aria-hidden="true"></div>
	{/if}

	<div class="scroll-root" bind:this={trackEl}>
		<img
			class="scroll-image"
			src={BACKGROUND_IMAGE_URL}
			alt=""
			fetchpriority="high"
			decoding="async"
		/>

		<div class="overlay-pin">
			<div class="overlay-stage">
				<div class="toran" aria-hidden="true"></div>

				{#each textBeats as beat, bi (bi)}
					{@const opacity = beatOpacity(beat)}
					{#if opacity > 0.01}
						<div
							class="content-panel"
							style="
								opacity: {opacity};
								transform: translate3d(0, {(1 - opacity) * 36}px, 0);
							"
						>
							<div class="panel-card">
								<p class="eyebrow">{beat.eyebrow}</p>
								<h2 class="panel-title">{beat.title}</h2>
								<p class="panel-body">{beat.body}</p>

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
											<img
												src={src}
												alt=""
												loading="lazy"
												style="opacity: {Math.min(1, (opacity - 0.5) * 2.5)}"
											/>
										{/each}
									</div>
								{/if}

								{#if beat.cta && opacity > 0.6}
									<a
										class="panel-cta"
										href={beat.cta.href}
										target="_blank"
										rel="noopener noreferrer"
										style="opacity: {Math.min(1, (opacity - 0.6) * 3)}"
									>{beat.cta.label}</a>
								{/if}
							</div>
						</div>
					{/if}
				{/each}

				{#if globalProgress < 0.02}
					<div
						class="scroll-cue"
						style="opacity: {Math.max(0, 1 - globalProgress * 60)}"
						aria-hidden="true"
					>
						<span>{preview ? 'Scroll preview' : 'Scroll to explore'}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<footer class="foot">
		<p>{payload.signOffLine?.trim() || payload.footerNote?.trim() || 'With love and gratitude.'}</p>
		{#if preview}
			<p class="pv">Preview — scroll inside panel to read the invitation</p>
		{/if}
	</footer>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit:ital@0;1&display=swap');

	.temple {
		--ink: #fff8ef;
		--ink-soft: rgba(255, 248, 239, 0.88);
		--saffron: #ff9933;
		--gold: #e8c872;
		--maroon: #7a1f2b;
		--deep: #1a0808;
		font-family: var(--font-body);
		color: var(--ink);
		background: var(--deep);
		position: relative;
		overflow-x: clip;
	}

	.temple.immersive {
		width: 100%;
		min-height: 100dvh;
	}

	.temple.preview {
		outline: 2px dashed var(--gold);
	}

	.read-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		z-index: 60;
		background: linear-gradient(90deg, var(--saffron), var(--gold), var(--maroon));
		transform-origin: left center;
		will-change: transform;
	}

	.scroll-root {
		position: relative;
	}

	.scroll-image {
		display: block;
		width: 100%;
		height: auto;
	}

	.overlay-pin {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.overlay-stage {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100dvh;
		overflow: clip;
		pointer-events: none;
	}

	.temple.preview .overlay-stage {
		height: min(62vh, 480px);
		min-height: 280px;
	}

	.toran {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 6px;
		background: repeating-linear-gradient(
			90deg,
			var(--saffron) 0 12px,
			var(--gold) 12px 24px,
			var(--maroon) 24px 36px
		);
		opacity: 0.85;
		z-index: 2;
		pointer-events: none;
	}

	.content-panel {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: grid;
		place-items: center;
		padding: clamp(1rem, 4vw, 2rem);
		pointer-events: none;
	}

	.panel-card {
		pointer-events: auto;
		width: min(100%, 40rem);
		padding: clamp(1.35rem, 4vw, 2.25rem);
		border-radius: 18px;
		border: 1px solid rgba(232, 200, 114, 0.42);
		background: rgba(26, 8, 8, 0.58);
		backdrop-filter: blur(10px);
		box-shadow:
			0 24px 60px rgba(0, 0, 0, 0.42),
			inset 0 1px 0 rgba(255, 248, 239, 0.08);
		text-align: center;
	}

	.eyebrow {
		margin: 0 0 0.65rem;
		font-family: 'Tiro Devanagari Sanskrit', var(--font-display);
		font-size: clamp(0.82rem, 2vw, 1rem);
		letter-spacing: 0.12em;
		text-transform: none;
		color: var(--gold);
	}

	.panel-title {
		margin: 0 0 0.85rem;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 5vw, 3.1rem);
		font-weight: 600;
		line-height: 1.12;
		letter-spacing: -0.02em;
		text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
	}

	.panel-body {
		margin: 0 auto;
		max-width: 34rem;
		font-size: clamp(0.98rem, 2.2vw, 1.1rem);
		line-height: 1.72;
		color: var(--ink-soft);
		white-space: pre-line;
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
		border: 1px solid rgba(232, 200, 114, 0.28);
		border-radius: 10px;
		background: rgba(26, 8, 8, 0.45);
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
		border: 1px solid rgba(232, 200, 114, 0.25);
	}

	.panel-cta {
		display: inline-block;
		margin-top: 1.35rem;
		padding: 0.8rem 1.6rem;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--maroon), #9a2a3a);
		color: #fff8ef;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-decoration: none;
		text-transform: uppercase;
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
	}

	.panel-cta:hover {
		color: #fff8ef;
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
		width: 1px;
		height: 24px;
		margin: 0.5rem auto 0;
		background: linear-gradient(180deg, var(--gold), transparent);
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateX(-50%) translateY(0);
		}
		50% {
			transform: translateX(-50%) translateY(6px);
		}
	}

	.foot {
		padding: 2rem 1.5rem 2.5rem;
		text-align: center;
		font-size: 0.88rem;
		color: rgba(255, 248, 239, 0.5);
		background: var(--deep);
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
		.scroll-cue {
			animation: none;
		}
	}
</style>

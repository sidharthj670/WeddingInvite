<script lang="ts">
	import type { WeddingPayload } from '$lib/payload';
	import {
		getMusicPlaybackSrc,
		formatEventWhen,
		getDisplayCoupleLine
	} from '$lib/payload';
	import BackgroundMusic from '$lib/invite-templates/BackgroundMusic.svelte';

	let { payload, preview = false }: { payload: WeddingPayload; preview?: boolean } = $props();

	const FRAME_START = 5;
	const FRAME_END = 100;
	const FRAMES_PER_CHAPTER = 10;
	const FRAME_SCROLL_VH = 12;
	const PREVIEW_FRAME_SCROLL_VH = 11;
	const TEXT_EMERGE_START = 0.62;

	const frameUrls = Array.from({ length: FRAME_END - FRAME_START + 1 }, (_, i) => {
		const n = FRAME_START + i;
		return `/wedding-frames/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;
	});

	type Chapter = { frames: string[]; index: number };

	const chapters: Chapter[] = [];
	for (let i = 0; i < frameUrls.length; i += FRAMES_PER_CHAPTER) {
		chapters.push({
			frames: frameUrls.slice(i, i + FRAMES_PER_CHAPTER),
			index: chapters.length
		});
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
		cta?: { label: string; href: string } | null;
	};

	const textBeats = $derived.by((): TextBeat[] => {
		return chapters.map((_, chapterIndex) => {
			switch (chapterIndex) {
				case 0:
					return {
						eyebrow: 'Wedding invitation',
						title: hasSplitNames
							? `${payload.groomFirstName?.trim() || '—'} & ${payload.brideFirstName?.trim() || '—'}`
							: coupleLine,
						body: payload.tagline?.trim() || 'Two hearts, one celebration.'
					};
				case 1:
					return {
						eyebrow: 'Save the date',
						title: weddingWhen || 'Our wedding day',
						body:
							payload.openingMantra?.trim() ||
							payload.openingQuote?.trim() ||
							'With joy in our hearts, we invite you.'
					};
				case 2:
					return {
						eyebrow: payload.openingAttribution?.trim() || 'Opening',
						title: payload.openingQuote?.trim() ? 'A note to begin' : 'Blessings upon us',
						body:
							payload.openingQuote?.trim() ||
							payload.blessingIntro?.trim() ||
							'With the blessings of our families, we begin this journey together.'
					};
				case 3: {
					const lines = (payload.blessingLines ?? []).filter((l) => l?.trim());
					return {
						eyebrow: 'Blessings',
						title: payload.blessingIntro?.trim() || 'With the blessings of',
						body:
							lines.length > 0
								? lines.join(' · ')
								: [payload.groomParents, payload.brideParents].filter(Boolean).join(' · ') ||
									'Our beloved families'
					};
				}
				case 4:
					return {
						eyebrow: 'Our story',
						title: payload.inviteLead?.trim() ? 'You are invited' : 'Celebrate with us',
						body:
							payload.personalLetter?.trim() ||
							payload.inviteLead?.trim() ||
							'We joyfully invite you to share in the happiness of our wedding day.'
					};
				case 5: {
					const lineage = [payload.groomLineage, payload.brideLineage]
						.filter((s) => s?.trim())
						.join('\n\n');
					return {
						eyebrow: 'Together with our families',
						title:
							payload.groomParents?.trim() || payload.brideParents?.trim()
								? 'With love from'
								: 'Our families',
						body:
							lineage ||
							[payload.groomFamilyNote, payload.brideFamilyNote]
								.filter((s) => s?.trim())
								.join('\n\n') ||
							'With the love and blessings of both our families.'
					};
				}
				case 6: {
					const ev = events[0];
					return {
						eyebrow: 'Ceremony & celebration',
						title: ev?.title?.trim() || 'The wedding',
						body: ev
							? [formatEventWhen(ev), ev.venueName?.trim(), ev.venueAddress?.trim()]
									.filter(Boolean)
									.join(' · ')
							: 'Details of our celebration will follow shortly.'
					};
				}
				case 7: {
					const bits = [
						payload.thingsToKnow?.hashtag?.trim() || payload.hashtag?.trim(),
						payload.thingsToKnow?.weather?.trim(),
						payload.thingsToKnow?.parking?.trim(),
						payload.coordinatorNote?.trim()
					].filter(Boolean);
					return {
						eyebrow: payload.galleryTitle?.trim() || 'Before the day',
						title: gallery.length ? 'Moments we cherish' : 'Things to know',
						body: bits.length ? bits.join(' · ') : 'We cannot wait to celebrate with you.'
					};
				}
				case 8:
					return {
						eyebrow: 'Join us',
						title: 'RSVP',
						body: payload.signOffLine?.trim() || 'Kindly let us know if you can join us.',
						cta: safeUrl(payload.rsvpUrl)
							? { label: 'Confirm attendance', href: safeUrl(payload.rsvpUrl)! }
							: null
					};
				default:
					return {
						eyebrow: 'With love',
						title: payload.footerFamilyNote?.trim() || coupleLine,
						body:
							payload.footerNote?.trim() ||
							payload.contactPhone?.trim() ||
							'Thank you for being part of our story.',
						cta: safeUrl(payload.instagramUrl)
							? {
									label: payload.hashtag?.trim() ? payload.hashtag.trim() : 'Follow our journey',
									href: safeUrl(payload.instagramUrl)!
								}
							: null
					};
			}
		});
	});

	let reduceMotion = $state(false);
	const immersive = $derived(!reduceMotion);

	let scrollProgress = $state(0);
	let chapterProgress = $state<number[]>(chapters.map(() => 0));
	let rootEl = $state<HTMLElement | null>(null);
	let scrollTarget = $state<HTMLElement | Window | null>(null);
	let scrollRaf = 0;

	function findScrollContainer(): HTMLElement | Window {
		if (!rootEl || !preview) return window;
		let el: HTMLElement | null = rootEl.parentElement;
		while (el) {
			const style = getComputedStyle(el);
			const scrollable =
				/(auto|scroll|overlay)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 2;
			if (scrollable) return el;
			el = el.parentElement;
		}
		return window;
	}

	function trackChapterProgress(el: HTMLElement | null): number {
		if (typeof window === 'undefined' || !el) return 0;
		const vh = window.innerHeight;
		const range = el.offsetHeight - vh;
		if (range <= 0) return 0;
		const top = el.getBoundingClientRect().top;
		return Math.max(0, Math.min(1, -top / range));
	}

	function trackChapterProgressInContainer(el: HTMLElement | null, container: HTMLElement): number {
		if (!el) return 0;
		const range = el.offsetHeight - container.clientHeight;
		if (range <= 0) return 0;
		const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
		return Math.max(0, Math.min(1, -top / range));
	}

	function frameState(progress: number, count: number) {
		if (count <= 1) return { index: 0, blend: 0 };
		const pos = progress * count;
		const index = Math.min(count - 1, Math.floor(pos));
		const blend = pos - index;
		return { index, blend };
	}

	function textEmergence(progress: number, chapterIndex: number): number {
		if (reduceMotion) return 1;
		const core = Math.max(0, Math.min(1, (progress - TEXT_EMERGE_START) / (1 - TEXT_EMERGE_START)));
		if (chapterIndex === 0) return Math.max(0.9, core);
		return core;
	}

	function readScroll() {
		if (typeof window === 'undefined' || !rootEl) return;

		const target = scrollTarget ?? findScrollContainer();
		const isWindow = target === window;
		const scrollTop = isWindow
			? window.scrollY
			: (target as HTMLElement).scrollTop;
		const scrollHeight = isWindow
			? document.documentElement.scrollHeight
			: (target as HTMLElement).scrollHeight;
		const clientHeight = isWindow ? window.innerHeight : (target as HTMLElement).clientHeight;
		const max = Math.max(1, scrollHeight - clientHeight);
		scrollProgress = scrollTop / max;

		const nodes = rootEl.querySelectorAll<HTMLElement>('.chapter');
		if (isWindow) {
			chapterProgress = Array.from(nodes).map((el) => trackChapterProgress(el));
		} else {
			const container = target as HTMLElement;
			chapterProgress = Array.from(nodes).map((el) =>
				trackChapterProgressInContainer(el, container)
			);
		}
	}

	function onScrollFrame() {
		if (scrollRaf) return;
		scrollRaf = requestAnimationFrame(() => {
			readScroll();
			scrollRaf = 0;
		});
	}

	function bindScrollTarget(node: HTMLElement | Window) {
		node.addEventListener('scroll', onScrollFrame, { passive: true });
		return () => node.removeEventListener('scroll', onScrollFrame);
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	$effect(() => {
		if (typeof window === 'undefined' || !rootEl) return;
		void preview;
		scrollTarget = findScrollContainer();
		readScroll();
		const unbindScroll = bindScrollTarget(scrollTarget);
		window.addEventListener('resize', onScrollFrame, { passive: true });
		return () => {
			unbindScroll();
			window.removeEventListener('resize', onScrollFrame);
			if (scrollRaf) cancelAnimationFrame(scrollRaf);
			scrollRaf = 0;
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		const idle =
			window.requestIdleCallback?.bind(window) ?? ((cb: () => void) => setTimeout(cb, 120));
		idle(() => {
			for (const url of frameUrls) {
				const img = new Image();
				img.src = url;
			}
		});
	});
</script>

<div
	class="cinema"
	class:preview
	class:immersive={immersive && !preview}
	data-template="wedding-cinematic-frames-v1"
	bind:this={rootEl}
>
	<BackgroundMusic src={musicBg} {preview} />

	{#if immersive && !preview}
		<div
			class="read-progress"
			style="transform: scaleX({scrollProgress})"
			aria-hidden="true"
		></div>
	{/if}

	{#each chapters as chapter, ci (ci)}
		{@const beat = textBeats[ci]}
		{@const progress = chapterProgress[ci] ?? 0}
		{@const { index: frameIdx, blend } = frameState(progress, chapter.frames.length)}
		{@const nextIdx = Math.min(frameIdx + 1, chapter.frames.length - 1)}
		{@const textIn = textEmergence(progress, ci)}

		<section
			class="chapter"
			style="--chapter-h: {chapter.frames.length * (preview ? PREVIEW_FRAME_SCROLL_VH : FRAME_SCROLL_VH)}vh"
		>
			<div class="chapter-sticky">
				<div class="frame-stack" aria-hidden="true">
					<img
						class="frame-img"
						src={chapter.frames[frameIdx]}
						alt=""
						style="opacity: {1 - blend}"
					/>
					{#if blend > 0.01 && frameIdx !== nextIdx}
						<img
							class="frame-img frame-img--blend"
							src={chapter.frames[nextIdx]}
							alt=""
							style="opacity: {blend}"
						/>
					{/if}
				</div>

				<div class="frame-vignette"></div>
				<div class="frame-grain" aria-hidden="true"></div>

				<div
					class="chapter-copy"
					class:chapter-copy--visible={textIn > 0.02}
					style="
						opacity: {textIn};
						transform: translate3d(0, {(1 - textIn) * 36}px, 0) scale({0.96 + textIn * 0.04});
						filter: blur({(1 - textIn) * 8}px);
					"
					aria-hidden={textIn < 0.05}
				>
					<p class="eyebrow">{beat.eyebrow}</p>
					<h2 class="beat-title">{beat.title}</h2>
					<p class="beat-body">{beat.body}</p>

					{#if ci === 6 && events.length > 1 && textIn > 0.5}
						<ul class="event-list">
							{#each events.slice(1, 4) as ev, ei (ei)}
								<li style="opacity: {Math.min(1, (textIn - 0.5) * 2)}">
									<strong>{ev.title}</strong>
									<span>{formatEventWhen(ev)}</span>
									{#if ev.venueName?.trim()}
										<span>{ev.venueName}</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}

					{#if ci === 7 && gallery.length && textIn > 0.5}
						<div class="mini-gallery">
							{#each gallery as src, gi (gi)}
								<img
									src={src}
									alt=""
									loading="lazy"
									style="opacity: {Math.min(1, (textIn - 0.5) * 2)}"
								/>
							{/each}
						</div>
					{/if}

					{#if beat.cta && textIn > 0.65}
						<a
							class="beat-cta"
							href={beat.cta.href}
							target="_blank"
							rel="noopener noreferrer"
							style="opacity: {Math.min(1, (textIn - 0.65) * 3)}"
						>
							{beat.cta.label}
						</a>
					{/if}
				</div>

				{#if ci === 0 && textIn < 0.15}
					<div
						class="scroll-cue"
						style="opacity: {Math.max(0, 1 - progress * 5)}"
						aria-hidden="true"
					>
						<span>{preview ? 'Scroll preview' : 'Scroll'}</span>
					</div>
				{/if}
			</div>
		</section>
	{/each}

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
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		z-index: 60;
		background: linear-gradient(90deg, var(--gold), #f0e6c8, var(--maroon));
		transform-origin: left center;
		will-change: transform;
	}

	.chapter {
		position: relative;
		height: var(--chapter-h, 120vh);
	}

	.chapter-sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100dvh;
		overflow: clip;
		background: var(--bg);
	}

	.cinema.preview .chapter-sticky {
		position: sticky;
		top: 0;
		height: min(62vh, 480px);
		min-height: 280px;
	}

	.frame-stack {
		position: absolute;
		inset: 0;
	}

	.frame-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		will-change: opacity;
	}

	.frame-img--blend {
		z-index: 1;
	}

	.frame-vignette {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 85% 65% at 50% 100%, rgba(8, 6, 8, 0.82) 0%, transparent 58%),
			linear-gradient(180deg, rgba(8, 6, 8, 0.2) 0%, rgba(8, 6, 8, 0.55) 100%);
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

	.chapter-copy {
		position: absolute;
		inset: auto 0 0;
		z-index: 4;
		padding: clamp(2rem, 7vw, 4.5rem) clamp(1.25rem, 5vw, 3rem);
		text-align: center;
		pointer-events: none;
		will-change: opacity, transform, filter;
	}

	.chapter-copy--visible {
		pointer-events: auto;
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

	.eyebrow {
		margin: 0 0 0.65rem;
		font-family: var(--font-ui);
		font-size: 0.68rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: var(--gold);
		text-shadow: 0 2px 16px rgba(0, 0, 0, 0.45);
	}

	.beat-title {
		margin: 0 0 0.85rem;
		font-family: var(--font-display);
		font-size: clamp(1.65rem, 5vw, 3rem);
		font-weight: 600;
		line-height: 1.12;
		letter-spacing: -0.02em;
		text-shadow: 0 4px 28px rgba(0, 0, 0, 0.55);
	}

	.beat-body {
		margin: 0 auto;
		max-width: 36rem;
		font-size: clamp(0.98rem, 2.2vw, 1.1rem);
		line-height: 1.7;
		color: var(--ink-soft);
		white-space: pre-line;
		text-shadow: 0 2px 18px rgba(0, 0, 0, 0.5);
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
		border: 1px solid rgba(212, 181, 106, 0.28);
		border-radius: 10px;
		background: rgba(8, 6, 8, 0.45);
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
		border: 1px solid rgba(212, 181, 106, 0.25);
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
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
	}

	.beat-cta:hover {
		color: #fffaf7;
	}

	.foot {
		padding: 2rem 1.5rem 2.5rem;
		text-align: center;
		font-size: 0.88rem;
		color: rgba(248, 244, 239, 0.5);
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

		.chapter-copy {
			filter: none !important;
		}
	}
</style>

<script lang="ts">
	import {
		type WeddingPayload,
		getHeroImageSrc,
		getDisplayCoupleLine,
		getMusicPlaybackSrc,
		formatEventWhen
	} from '$lib/payload';
	import BackgroundMusic from '$lib/invite-templates/BackgroundMusic.svelte';

	let { payload, preview = false }: { payload: WeddingPayload; preview?: boolean } = $props();

	function safeUrl(u: string): string | null {
		const t = u?.trim();
		if (!t) return null;
		try {
			const x = new URL(t);
			return x.protocol === 'http:' || x.protocol === 'https:' ? x.href : null;
		} catch {
			return null;
		}
	}

	const heroSrc = $derived(getHeroImageSrc(payload));
	const namesLine = $derived(getDisplayCoupleLine(payload));
	const musicBg = $derived(getMusicPlaybackSrc(payload));

	const gallery = $derived(
		(payload.galleryImageUrls ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 12)
	);
</script>

<div class="invite" class:preview data-template="wedding-classic-v1">
	<BackgroundMusic src={musicBg} {preview} />
	<section class="hero">
		<div class="hero-bg">
			<img
				src={heroSrc}
				alt=""
				class="hero-img"
				width="1200"
				height="900"
				decoding="async"
				fetchpriority="high"
			/>
			<div class="hero-scrim"></div>
		</div>
		<div class="hero-inner">
			<p class="eyebrow">You’re invited</p>
			<h1 class="names">{namesLine}</h1>
			<p class="date">{payload.weddingDate?.trim() || 'Date'}</p>
			{#if payload.tagline?.trim()}
				<p class="tagline">{payload.tagline}</p>
			{/if}
		</div>
	</section>

	{#if payload.openingQuote?.trim()}
		<section class="band quote-band">
			<div class="band-inner">
				<blockquote class="quote">
					<p>{payload.openingQuote}</p>
					{#if payload.openingAttribution?.trim()}
						<cite>— {payload.openingAttribution}</cite>
					{/if}
				</blockquote>
			</div>
		</section>
	{/if}

	<section class="band families-band">
		<div class="band-inner grid-2">
			<div>
				<span class="sec-num">01</span>
				<h2 class="sec-title">Bride’s side</h2>
				<p class="parents">{payload.brideParents || 'Parents’ names'}</p>
				{#if payload.brideFamilyNote?.trim()}
					<p class="note">{payload.brideFamilyNote}</p>
				{/if}
			</div>
			<div>
				<span class="sec-num">02</span>
				<h2 class="sec-title">Groom’s side</h2>
				<p class="parents">{payload.groomParents || 'Parents’ names'}</p>
				{#if payload.groomFamilyNote?.trim()}
					<p class="note">{payload.groomFamilyNote}</p>
				{/if}
			</div>
		</div>
	</section>

	<section class="band events-band">
		<div class="band-inner">
			<h2 class="events-head">
				<span class="sec-num">03</span>
				Celebrations
			</h2>
			<ul class="events">
				{#each payload.events as ev, i (i)}
					<li class="event-card">
						<h3 class="event-title">{ev.title || `Event ${i + 1}`}</h3>
						<p class="event-when">{formatEventWhen(ev)}</p>
						<p class="event-where">{ev.venueName || 'Venue'}</p>
						{#if ev.venueAddress?.trim()}
							<p class="event-address">{ev.venueAddress}</p>
						{/if}
						{#if ev.dressCode?.trim()}
							<p class="dress"><strong>Dress</strong> · {ev.dressCode}</p>
						{/if}
						{#if ev.notes?.trim()}
							<p class="notes">{ev.notes}</p>
						{/if}
						{#if safeUrl(ev.mapUrl)}
							<a class="btn map-link" href={ev.mapUrl} target="_blank" rel="noopener noreferrer"
								>Directions & map</a
							>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>

	{#if gallery.length > 0}
		<section class="band gallery-band">
			<div class="band-inner">
				<h2 class="gallery-head">
					<span class="sec-num">04</span>
					{payload.galleryTitle?.trim() || 'Gallery'}
				</h2>
				<div class="gallery-grid">
					{#each gallery as src, i (src + i)}
						<figure class="g-fig">
							<img src={src} alt="" loading="lazy" decoding="async" />
						</figure>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<section class="band cta-band">
		<div class="band-inner cta-grid">
			<div>
				<h2 class="cta-head">
					<span class="sec-num">05</span>
					Join us
				</h2>
				{#if payload.hashtag?.trim()}
					<p class="hash">{payload.hashtag.startsWith('#') ? payload.hashtag : '#' + payload.hashtag}</p>
				{/if}
				{#if payload.coordinatorNote?.trim()}
					<p class="coord">{payload.coordinatorNote}</p>
				{/if}
				{#if payload.contactPhone?.trim()}
					<p class="phone">Reach us · {payload.contactPhone}</p>
				{/if}
			</div>
			<div class="cta-links">
				{#if safeUrl(payload.rsvpUrl)}
					<a class="btn primary" href={payload.rsvpUrl} target="_blank" rel="noopener noreferrer"
						>RSVP</a
					>
				{/if}
				{#if safeUrl(payload.instagramUrl)}
					<a class="btn ghost" href={payload.instagramUrl} target="_blank" rel="noopener noreferrer"
						>Instagram</a
					>
				{/if}
			</div>
		</div>
	</section>

	<footer class="foot">
		<p>{payload.footerNote?.trim() || 'With love'}</p>
		{#if preview}
			<p class="preview-badge">Preview — not published</p>
		{/if}
	</footer>
</div>

<style>
	.invite {
		--pad: clamp(1.25rem, 4vw, 3rem);
		color: var(--ink);
		background: var(--paper);
		font-family: var(--font-body);
	}

	.invite.preview {
		outline: 2px dashed var(--accent);
		outline-offset: -2px;
	}

	.hero {
		position: relative;
		min-height: min(92vh, 900px);
		display: grid;
		align-items: end;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.hero-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.02);
	}

	.hero-scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			rgba(26, 24, 20, 0.15) 0%,
			rgba(26, 24, 20, 0.55) 55%,
			rgba(26, 24, 20, 0.82) 100%
		);
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		padding: var(--pad);
		padding-bottom: clamp(2.5rem, 8vw, 5rem);
		max-width: 52rem;
		color: #faf7f2;
	}

	.eyebrow {
		font-family: var(--font-display);
		font-size: 0.85rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		opacity: 0.92;
		margin: 0 0 1rem;
	}

	.names {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2.5rem, 8vw, 4.25rem);
		line-height: 1.05;
		margin: 0 0 0.75rem;
		letter-spacing: -0.03em;
	}

	.date {
		font-size: 1.15rem;
		margin: 0;
		opacity: 0.95;
	}

	.tagline {
		font-style: italic;
		opacity: 0.9;
		margin: 1rem 0 0;
		max-width: 36ch;
	}

	.band {
		padding: clamp(2.5rem, 6vw, 4.5rem) var(--pad);
		border-top: 1px solid var(--line);
	}

	.band-inner {
		max-width: 72rem;
		margin: 0 auto;
	}

	.quote-band {
		background: linear-gradient(135deg, rgba(45, 59, 46, 0.08), transparent 45%);
	}

	.quote {
		margin: 0;
		font-size: clamp(1.25rem, 3vw, 1.65rem);
		line-height: 1.45;
		max-width: 40rem;
	}

	.quote cite {
		display: block;
		margin-top: 1rem;
		font-size: 0.95rem;
		font-style: normal;
		opacity: 0.85;
	}

	.grid-2 {
		display: grid;
		gap: clamp(2rem, 5vw, 4rem);
	}

	@media (min-width: 720px) {
		.grid-2 {
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}
	}

	.sec-num {
		font-family: var(--font-display);
		font-size: 0.75rem;
		letter-spacing: 0.2em;
		color: var(--accent);
		display: block;
		margin-bottom: 0.5rem;
	}

	.sec-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.35rem;
		margin: 0 0 0.75rem;
	}

	.parents {
		margin: 0;
		font-size: 1.1rem;
	}

	.note {
		margin: 0.75rem 0 0;
		opacity: 0.88;
		font-size: 0.98rem;
	}

	.events-head,
	.gallery-head,
	.cta-head {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: clamp(1.5rem, 3vw, 2rem);
		margin: 0 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.events {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.event-card {
		border-left: 3px solid var(--foliage);
		padding-left: 1.25rem;
	}

	.event-title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 0 0 0.35rem;
	}

	.event-when {
		font-weight: 600;
		margin: 0 0 0.25rem;
		color: var(--foliage);
	}

	.event-where {
		margin: 0;
		font-size: 1.05rem;
	}

	.event-address {
		margin: 0.35rem 0 0;
		opacity: 0.88;
		font-size: 0.95rem;
	}

	.dress,
	.notes {
		margin: 0.5rem 0 0;
		font-size: 0.95rem;
	}

	.btn {
		display: inline-block;
		margin-top: 0.85rem;
		padding: 0.55rem 1.1rem;
		font-family: var(--font-display);
		font-size: 0.9rem;
		letter-spacing: 0.04em;
		text-decoration: none;
		border-radius: 4px;
		border: 1px solid var(--ink);
		color: var(--ink);
		transition:
			background 0.2s,
			color 0.2s;
	}

	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fffaf7;
	}

	.btn.primary:hover {
		filter: brightness(1.05);
	}

	.btn.ghost:hover,
	.map-link:hover {
		background: rgba(26, 24, 20, 0.06);
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.65rem;
	}

	@media (min-width: 640px) {
		.gallery-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.g-fig {
		margin: 0;
		overflow: hidden;
		border-radius: 4px;
		aspect-ratio: 1;
	}

	.g-fig img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cta-grid {
		display: grid;
		gap: 2rem;
	}

	@media (min-width: 640px) {
		.cta-grid {
			grid-template-columns: 1fr auto;
			align-items: end;
		}
	}

	.hash {
		font-family: var(--font-display);
		font-size: 1.2rem;
		margin: 0.5rem 0;
		color: var(--foliage);
	}

	.coord,
	.phone {
		margin: 0.5rem 0 0;
		font-size: 0.98rem;
	}

	.cta-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		justify-content: flex-start;
	}

	.foot {
		padding: 2.5rem var(--pad) 3rem;
		text-align: center;
		border-top: 1px solid var(--line);
		font-size: 0.95rem;
	}

	.preview-badge {
		margin-top: 1rem;
		font-size: 0.8rem;
		color: var(--accent);
		font-family: var(--font-display);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>

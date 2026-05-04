<script lang="ts">
	import type { WeddingEvent, WeddingPayload } from '$lib/payload';
	import {
		formatEventWhen,
		getDisplayCoupleLine,
		getHeroImageSrc,
		getMusicPlaybackSrc
	} from '$lib/payload';
	import BackgroundMusic from '$lib/invite-templates/BackgroundMusic.svelte';
	import { inView } from '$lib/actions/inView';

	let { payload, preview = false }: { payload: WeddingPayload; preview?: boolean } = $props();

	let coverDismissed = $state(false);
	let activeEvent = $state(0);
	let activeMap = $state(-1);
	let galleryIndex = $state(0);
	let now = $state(Date.now());
	let reduceMotion = $state(false);
	let scrollProgress = $state(0);

	const backdrops = {
		cover:
			'https://images.unsplash.com/photo-1771992230505-97e0c3d38213?auto=format&fit=crop&q=80&w=1800',
		mandap:
			'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&q=80&w=1900',
		ceremony:
			'https://images.unsplash.com/photo-1744805624954-a6686543c3ff?auto=format&fit=crop&q=80&w=1500',
		goldHall:
			'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&q=80&w=1900',
		haldi:
			'https://images.pexels.com/photos/32516211/pexels-photo-32516211.jpeg?auto=compress&cs=tinysrgb&w=1800'
	};

	function safeUrl(u: string | undefined): string | null {
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

	function fallbackEvent(): WeddingEvent {
		return {
			title: 'Wedding celebration',
			dateTime: payload.weddingDate || 'Date and time',
			eventDateISO: payload.weddingDateISO,
			eventDateTimeLocal: '',
			venueName: 'Venue',
			venueAddress: '',
			mapUrl: '',
			dressCode: '',
			notes: ''
		};
	}

	function phoneToWhatsApp(phone: string): string | null {
		const digits = phone.replace(/[^\d]/g, '');
		if (!digits) return null;
		return `https://wa.me/${digits}`;
	}

	function clampIndex(i: number, len: number): number {
		if (len <= 0) return 0;
		return ((i % len) + len) % len;
	}

	function selectEvent(i: number) {
		activeEvent = clampIndex(i, visibleEvents.length);
		activeMap = -1;
	}

	function moveEvent(delta: number) {
		selectEvent(activeIndex + delta);
	}

	function moveGallery(delta: number) {
		galleryIndex = clampIndex(galleryIndex + delta, gallery.length || 1);
	}

	const heroSrc = $derived(getHeroImageSrc(payload));
	const inviteOpen = $derived(preview || coverDismissed);
	const musicBg = $derived(getMusicPlaybackSrc(payload));
	const coupleLine = $derived(getDisplayCoupleLine(payload));
	const groomName = $derived(
		payload.groomFirstName?.trim() || coupleLine.split('&')[0]?.trim() || 'Groom'
	);
	const brideName = $derived(
		payload.brideFirstName?.trim() || coupleLine.split('&')[1]?.trim() || 'Bride'
	);
	const visibleEvents = $derived.by(() => {
		const list = (payload.events ?? [])
			.filter((e) => e.title?.trim() || e.venueName?.trim() || e.dateTime?.trim())
			.slice(0, 8);
		return list.length ? list : [fallbackEvent()];
	});
	const activeIndex = $derived(Math.min(activeEvent, Math.max(0, visibleEvents.length - 1)));
	const currentEvent = $derived(visibleEvents[activeIndex] ?? fallbackEvent());
	const eventMapUrl = $derived(safeUrl(currentEvent.mapUrl));
	const rsvpUrl = $derived(safeUrl(payload.rsvpUrl));
	const instagramUrl = $derived(safeUrl(payload.instagramUrl));
	const whatsappUrl = $derived(phoneToWhatsApp(payload.contactPhone || ''));
	const gallery = $derived.by(() => {
		const images = (payload.galleryImageUrls ?? [])
			.map((s) => s.trim())
			.filter(Boolean)
			.slice(0, 12);
		return images.length ? images : [heroSrc];
	});
	const currentGallery = $derived(gallery[clampIndex(galleryIndex, gallery.length)] ?? heroSrc);
	const hasKnow = $derived(
		!!(
			payload.thingsToKnow?.hashtag?.trim() ||
			payload.hashtag?.trim() ||
			payload.thingsToKnow?.weather?.trim() ||
			payload.thingsToKnow?.staff?.trim() ||
			payload.thingsToKnow?.parking?.trim() ||
			payload.coordinatorNote?.trim()
		)
	);
	const countdownTarget = $derived.by(() => {
		const raw =
			payload.countdownTargetISO?.trim() ||
			visibleEvents[0]?.eventDateTimeLocal?.trim() ||
			(payload.weddingDateISO ? `${payload.weddingDateISO}T00:00` : '');
		if (!raw) return null;
		const time = Date.parse(raw);
		return Number.isNaN(time) ? null : time;
	});
	const countdown = $derived.by(() => {
		if (!countdownTarget) return null;
		const ms = Math.max(0, countdownTarget - now);
		const d = Math.floor(ms / 86400000);
		const h = Math.floor((ms % 86400000) / 3600000);
		const m = Math.floor((ms % 3600000) / 60000);
		const s = Math.floor((ms % 60000) / 1000);
		return { d, h, m, s };
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	$effect(() => {
		if (typeof window === 'undefined' || !countdownTarget) return;
		now = Date.now();
		const id = window.setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(id);
	});

	$effect(() => {
		if (typeof window === 'undefined' || preview) return;
		let raf = 0;
		const read = () => {
			const doc = document.documentElement;
			const max = Math.max(1, doc.scrollHeight - window.innerHeight);
			scrollProgress = window.scrollY / max;
		};
		const onScroll = () => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				read();
				raf = 0;
			});
		};
		read();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	});
</script>

<div
	class="city"
	class:preview
	class:opened={inviteOpen}
	class:reduce={reduceMotion}
	data-template="wedding-city-luxe-v1"
	style={`--cover-photo: url("${backdrops.cover}"); --mandap-photo: url("${backdrops.mandap}"); --ceremony-photo: url("${backdrops.ceremony}"); --gold-hall-photo: url("${backdrops.goldHall}"); --haldi-photo: url("${backdrops.haldi}")`}
>
	<BackgroundMusic src={musicBg} {preview} />
	<div class="ornate-page-frame" aria-hidden="true">
		<span class="corner top-left"></span>
		<span class="corner top-right"></span>
		<span class="corner bottom-left"></span>
		<span class="corner bottom-right"></span>
	</div>

	{#if !preview}
		<div class="read-meter" style="transform: scaleX({scrollProgress})" aria-hidden="true"></div>
	{/if}

	{#if !inviteOpen}
		<section class="cover" aria-label="Open invitation">
			<div class="cover-skyline" aria-hidden="true">
				<span class="tower t1"></span>
				<span class="tower t2"></span>
				<span class="tower t3"></span>
				<span class="tower t4"></span>
			</div>
			<div class="cover-card invitation-card">
				<p class="micro">Wedding invitation</p>
				<h1>{groomName}<span>weds</span>{brideName}</h1>
				<p class="cover-date">{payload.weddingDate || 'Save the date'}</p>
				<button type="button" class="open-btn" onclick={() => (coverDismissed = true)}>
					Open invitation
				</button>
			</div>
		</section>
	{/if}

	<nav class="quick-nav" aria-label="Invite sections">
		<a href="#city-events">Events</a>
		<a href="#city-rsvp">RSVP</a>
		<a href="#city-details">Details</a>
	</nav>

	<section class="hero">
		<div class="hero-media">
			<img src={heroSrc} alt="" fetchpriority="high" decoding="async" />
			<div class="hero-wash"></div>
			<div class="city-lines" aria-hidden="true">
				<span style="--h: 44%; --x: 4%; --w: 10%"></span>
				<span style="--h: 62%; --x: 15%; --w: 7%"></span>
				<span style="--h: 38%; --x: 25%; --w: 12%"></span>
				<span style="--h: 70%; --x: 41%; --w: 9%"></span>
				<span style="--h: 50%; --x: 54%; --w: 14%"></span>
				<span style="--h: 74%; --x: 72%; --w: 8%"></span>
				<span style="--h: 42%; --x: 83%; --w: 12%"></span>
			</div>
		</div>

			<div class="hero-copy invitation-card">
				<p class="micro">Shree Ganeshaya Namah</p>
				<h2>
				<span>{groomName}</span>
				<em>weds</em>
				<span>{brideName}</span>
			</h2>
			<p class="hero-date">{payload.weddingDate || 'Date to be announced'}</p>
			{#if payload.tagline?.trim()}
				<p class="tagline">{payload.tagline}</p>
			{/if}
			<div class="hero-actions">
				<a href="#city-events">Explore events</a>
				{#if rsvpUrl}
					<a href="#city-rsvp">RSVP</a>
				{/if}
			</div>
		</div>
	</section>

	<section class="blessing reveal-section" use:inView>
		<div class="section-inner blessing-grid invitation-card paper-card">
			<div>
				<p class="micro">With blessings</p>
				<h2>Our families invite you to celebrate this new beginning.</h2>
			</div>
			<div class="family-stack">
				<p>{payload.groomParents || "Groom's family"}</p>
				<span></span>
				<p>{payload.brideParents || "Bride's family"}</p>
			</div>
		</div>
	</section>

	<section id="city-events" class="events-section reveal-section" use:inView>
		<div class="section-inner invitation-card paper-card">
			<div class="section-head">
				<p class="micro">On the following events</p>
				<h2>Celebration route</h2>
			</div>

			<div class="event-tabs" role="tablist" aria-label="Wedding events">
				{#each visibleEvents as ev, i (i)}
					<button
						type="button"
						role="tab"
						class:active={i === activeIndex}
						aria-selected={i === activeIndex}
						onclick={() => selectEvent(i)}
					>
						<span>{String(i + 1).padStart(2, '0')}</span>
						{ev.title || `Event ${i + 1}`}
					</button>
				{/each}
			</div>

			<div class="event-stage">
				<button type="button" class="event-arrow left" aria-label="Previous event" onclick={() => moveEvent(-1)}>
					Back
				</button>
				<article class="event-card">
					<div class="event-scene" aria-hidden="true">
						<img src={backdrops.ceremony} alt="" loading="lazy" decoding="async" />
						<span class="sun"></span>
						<span class="road"></span>
						<span class="pin"></span>
					</div>
					<div class="event-copy">
						<p class="event-count">Event {activeIndex + 1} of {visibleEvents.length}</p>
						<h3>{currentEvent.title || `Event ${activeIndex + 1}`}</h3>
						<p class="when">{formatEventWhen(currentEvent)}</p>
						<p class="where">{currentEvent.venueName || 'Venue'}</p>
						{#if currentEvent.venueAddress?.trim()}
							<p class="address">{currentEvent.venueAddress}</p>
						{/if}
						{#if currentEvent.dressCode?.trim()}
							<p class="detail-line"><strong>Dress</strong> {currentEvent.dressCode}</p>
						{/if}
						{#if currentEvent.notes?.trim()}
							<p class="detail-line">{currentEvent.notes}</p>
						{/if}
						<div class="event-actions">
							<button type="button" onclick={() => (activeMap = activeMap === activeIndex ? -1 : activeIndex)}>
								{activeMap === activeIndex ? 'Hide route' : 'See route'}
							</button>
							{#if eventMapUrl}
								<a href={eventMapUrl} target="_blank" rel="noopener noreferrer">Open map</a>
							{/if}
						</div>
					</div>
				</article>
				<button type="button" class="event-arrow right" aria-label="Next event" onclick={() => moveEvent(1)}>
					Next
				</button>
			</div>

			{#if activeMap === activeIndex}
				<div class="route-panel">
					<p class="micro">Route preview</p>
					<p>
						{currentEvent.venueAddress?.trim() ||
							currentEvent.venueName ||
							'Add a map link or venue address in the editor.'}
					</p>
					{#if eventMapUrl}
						<a href={eventMapUrl} target="_blank" rel="noopener noreferrer">Click to open directions</a>
					{/if}
				</div>
			{/if}
		</div>
	</section>

	<section class="couple-story reveal-section" use:inView>
		<div class="story-photo invitation-card">
			<img src={currentGallery} alt="" loading="lazy" decoding="async" />
		</div>
		<div class="story-copy invitation-card paper-card">
			<p class="micro">Meet the bride and groom</p>
			<h2>{coupleLine}</h2>
			<p>
				{payload.personalLetter ||
					payload.openingQuote ||
					payload.tagline ||
					'We are delighted that you are able to join us in celebrating one of the happiest days of our lives.'}
			</p>
			{#if payload.signOffLine?.trim()}
				<p class="sign">{payload.signOffLine}</p>
			{/if}
		</div>
	</section>

	<section class="gallery-section reveal-section" use:inView>
		<div class="section-inner invitation-card dark-card">
			<div class="gallery-top">
				<div>
					<p class="micro">Follow the action</p>
					<h2>{payload.galleryTitle || 'A few moments before the day'}</h2>
				</div>
				<div class="gallery-controls">
					<button type="button" aria-label="Previous image" onclick={() => moveGallery(-1)}>Back</button>
					<button type="button" aria-label="Next image" onclick={() => moveGallery(1)}>Next</button>
				</div>
			</div>
			<div class="gallery-main">
				<img src={currentGallery} alt="" loading="lazy" decoding="async" />
				<div class="gallery-dots" aria-label="Gallery position">
					{#each gallery as _, i (i)}
						<button
							type="button"
							class:active={i === clampIndex(galleryIndex, gallery.length)}
							aria-label={`Show image ${i + 1}`}
							onclick={() => (galleryIndex = i)}
						></button>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section id="city-rsvp" class="rsvp-section reveal-section" use:inView>
		<div class="section-inner rsvp-grid invitation-card dark-card">
			<div>
				<p class="micro">Please RSVP</p>
				<h2>Tell us you are coming.</h2>
				<p>
					Your presence is the gift we are waiting for. Confirm your plans and keep this invite
					handy for every event.
				</p>
			</div>
			<div class="rsvp-actions">
				{#if rsvpUrl}
					<a class="primary-action" href={rsvpUrl} target="_blank" rel="noopener noreferrer">Open RSVP</a>
				{:else}
					<p class="empty-action">RSVP link will appear here once added.</p>
				{/if}
				{#if whatsappUrl}
					<a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
				{/if}
			</div>
		</div>
	</section>

	{#if hasKnow}
		<section id="city-details" class="know-section reveal-section" use:inView>
			<div class="section-inner invitation-card paper-card">
				<div class="section-head center">
					<p class="micro">Things to know</p>
					<h2>Feel at ease before the celebrations.</h2>
				</div>
				<div class="know-grid">
					{#if payload.thingsToKnow?.hashtag?.trim() || payload.hashtag?.trim()}
						<details open>
							<summary>Hashtag</summary>
							<p>{payload.thingsToKnow?.hashtag || payload.hashtag}</p>
						</details>
					{/if}
					{#if payload.thingsToKnow?.weather?.trim()}
						<details>
							<summary>Weather</summary>
							<p>{payload.thingsToKnow.weather}</p>
						</details>
					{/if}
					{#if payload.thingsToKnow?.staff?.trim()}
						<details>
							<summary>Staff</summary>
							<p>{payload.thingsToKnow.staff}</p>
						</details>
					{/if}
					{#if payload.thingsToKnow?.parking?.trim()}
						<details>
							<summary>Parking</summary>
							<p>{payload.thingsToKnow.parking}</p>
						</details>
					{/if}
					{#if payload.coordinatorNote?.trim()}
						<details>
							<summary>Coordinator note</summary>
							<p>{payload.coordinatorNote}</p>
						</details>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<section class="countdown-section reveal-section" use:inView>
		<div class="section-inner countdown-inner invitation-card dark-card">
			<div>
				<p class="micro">The countdown begins</p>
				<h2>{payload.footerFamilyNote || 'Our families are excited to celebrate with you.'}</h2>
			</div>
			{#if countdown}
				<div class="countdown" aria-live="polite">
					<span><strong>{countdown.d}</strong><small>days</small></span>
					<span><strong>{countdown.h}</strong><small>hrs</small></span>
					<span><strong>{countdown.m}</strong><small>min</small></span>
					<span><strong>{countdown.s}</strong><small>sec</small></span>
				</div>
			{:else}
				<p class="countdown-fallback">{payload.weddingDate || 'Countdown appears after adding a date.'}</p>
			{/if}
		</div>
	</section>

	<footer class="city-foot">
		<p>{payload.footerNote || `With love, ${coupleLine}`}</p>
		{#if instagramUrl}
			<a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
		{/if}
		{#if preview}
			<span>Preview</span>
		{/if}
	</footer>
</div>

<style>
	.city {
		--city-ink: #171315;
		--city-night: #251823;
		--city-plum: #5c2639;
		--city-coral: #d85e46;
		--city-gold: #d6ae4f;
		--city-ivory: #fff9ef;
		--city-paper: #f6ecdf;
		--city-sage: #285045;
		position: relative;
		overflow-x: clip;
		color: var(--city-ink);
		background:
			linear-gradient(180deg, rgba(255, 249, 239, 0.98), rgba(246, 236, 223, 0.98)),
			repeating-linear-gradient(90deg, rgba(92, 38, 57, 0.04) 0 1px, transparent 1px 34px);
		font-family: var(--font-body);
	}

	.city.preview {
		outline: 2px dashed var(--city-coral);
		outline-offset: -2px;
	}

	.ornate-page-frame {
		position: fixed;
		inset: clamp(0.45rem, 1.2vw, 0.8rem);
		z-index: 70;
		pointer-events: none;
		border: 1px solid rgba(214, 174, 79, 0.58);
		box-shadow:
			inset 0 0 0 5px rgba(255, 249, 239, 0.16),
			inset 0 0 0 6px rgba(92, 38, 57, 0.24);
		mix-blend-mode: normal;
	}

	.corner {
		position: absolute;
		width: clamp(42px, 8vw, 76px);
		height: clamp(42px, 8vw, 76px);
		border-color: rgba(214, 174, 79, 0.88);
	}

	.corner::before,
	.corner::after {
		content: '';
		position: absolute;
		background: rgba(214, 174, 79, 0.72);
	}

	.corner::before {
		width: 62%;
		height: 1px;
	}

	.corner::after {
		width: 1px;
		height: 62%;
	}

	.top-left {
		top: 0;
		left: 0;
		border-top: 2px solid;
		border-left: 2px solid;
	}
	.top-right {
		top: 0;
		right: 0;
		border-top: 2px solid;
		border-right: 2px solid;
	}
	.bottom-left {
		bottom: 0;
		left: 0;
		border-bottom: 2px solid;
		border-left: 2px solid;
	}
	.bottom-right {
		right: 0;
		bottom: 0;
		border-right: 2px solid;
		border-bottom: 2px solid;
	}

	.top-left::before,
	.bottom-left::before {
		left: 12px;
	}
	.top-right::before,
	.bottom-right::before {
		right: 12px;
	}
	.top-left::after,
	.top-right::after {
		top: 12px;
	}
	.bottom-left::after,
	.bottom-right::after {
		bottom: 12px;
	}
	.top-left::before,
	.top-right::before {
		top: 12px;
	}
	.bottom-left::before,
	.bottom-right::before {
		bottom: 12px;
	}
	.top-left::after,
	.bottom-left::after {
		left: 12px;
	}
	.top-right::after,
	.bottom-right::after {
		right: 12px;
	}

	.invitation-card {
		position: relative;
		border: 1px solid rgba(214, 174, 79, 0.52);
		box-shadow:
			0 26px 80px rgba(23, 19, 21, 0.12),
			inset 0 0 0 5px rgba(255, 249, 239, 0.28),
			inset 0 0 0 6px rgba(214, 174, 79, 0.18);
	}

	.invitation-card::before,
	.invitation-card::after {
		content: '';
		position: absolute;
		pointer-events: none;
		border: 1px solid rgba(214, 174, 79, 0.45);
	}

	.invitation-card::before {
		inset: 0.55rem;
	}

	.invitation-card::after {
		inset: 1rem;
		border-color: rgba(92, 38, 57, 0.14);
	}

	.paper-card {
		padding: clamp(1.25rem, 4vw, 2.3rem);
		background:
			linear-gradient(180deg, rgba(255, 253, 248, 0.94), rgba(255, 249, 239, 0.9)),
			radial-gradient(ellipse at 10% 0%, rgba(214, 174, 79, 0.12), transparent 42%);
	}

	.dark-card {
		padding: clamp(1.25rem, 4vw, 2.3rem);
		border-color: rgba(214, 174, 79, 0.58);
		background:
			linear-gradient(160deg, rgba(23, 19, 21, 0.84), rgba(92, 38, 57, 0.72)),
			var(--gold-hall-photo);
		background-size: cover;
		background-position: center;
	}

	.read-meter {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 80;
		height: 4px;
		transform-origin: left center;
		background: linear-gradient(90deg, var(--city-gold), var(--city-coral), var(--city-sage));
	}

	.cover {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: grid;
		place-items: center;
		padding: 1.25rem;
		background:
			linear-gradient(180deg, rgba(23, 19, 21, 0.2), rgba(23, 19, 21, 0.74)),
			linear-gradient(90deg, rgba(92, 38, 57, 0.45), rgba(40, 80, 69, 0.18)),
			var(--cover-photo),
			linear-gradient(145deg, #421e30, #151316 62%, #293f3a);
		background-size: cover;
		background-position: center;
		color: var(--city-ivory);
		overflow: hidden;
	}

	.cover::before,
	.cover::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 50%;
		background:
			linear-gradient(90deg, rgba(255, 249, 239, 0.08), transparent 32%),
			linear-gradient(180deg, #6f2c42, #321722);
		transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.cover::before {
		left: 0;
		border-right: 1px solid rgba(214, 174, 79, 0.35);
	}

	.cover::after {
		right: 0;
		border-left: 1px solid rgba(214, 174, 79, 0.35);
	}

	.opened .cover::before {
		transform: translateX(-100%);
	}

	.opened .cover::after {
		transform: translateX(100%);
	}

	.cover-skyline {
		position: absolute;
		inset: auto 0 0;
		height: 34vh;
		z-index: 1;
		opacity: 0.8;
	}

	.tower {
		position: absolute;
		bottom: 0;
		width: 15vw;
		background:
			repeating-linear-gradient(180deg, rgba(255, 249, 239, 0.18) 0 8px, transparent 8px 22px),
			linear-gradient(180deg, #53334a, #171315);
		border: 1px solid rgba(214, 174, 79, 0.16);
	}

	.t1 {
		left: 6%;
		height: 48%;
	}
	.t2 {
		left: 27%;
		height: 72%;
	}
	.t3 {
		right: 26%;
		height: 58%;
	}
	.t4 {
		right: 6%;
		height: 84%;
	}

	.cover-card {
		position: relative;
		z-index: 2;
		width: min(100%, 460px);
		padding: clamp(1.5rem, 5vw, 2.4rem);
		text-align: center;
		border: 1px solid rgba(214, 174, 79, 0.55);
		background:
			linear-gradient(180deg, rgba(23, 19, 21, 0.7), rgba(23, 19, 21, 0.48)),
			radial-gradient(ellipse at 50% 0%, rgba(214, 174, 79, 0.22), transparent 58%);
		backdrop-filter: blur(18px);
		box-shadow: 0 28px 90px rgba(0, 0, 0, 0.34);
	}

	.cover-card h1 {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin: 0.65rem 0 0.85rem;
		font-family: var(--font-display);
		font-size: clamp(2rem, 9vw, 3.6rem);
		line-height: 1.02;
		color: var(--city-ivory);
	}

	.cover-card h1 span {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--city-gold);
	}

	.cover-date {
		margin: 0 0 1.25rem;
		opacity: 0.9;
	}

	.open-btn,
	.hero-actions a,
	.event-actions a,
	.event-actions button,
	.route-panel a,
	.rsvp-actions a,
	.gallery-controls button,
	.event-arrow {
		border: 1px solid rgba(214, 174, 79, 0.65);
		background: var(--city-ivory);
		color: var(--city-plum);
		font-family: var(--font-ui);
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		border-radius: 6px;
		transition:
			transform 0.2s ease,
			background 0.2s ease,
			border-color 0.2s ease;
	}

	.open-btn {
		padding: 0.85rem 1.15rem;
		min-width: 12rem;
	}

	.open-btn:hover,
	.hero-actions a:hover,
	.event-actions a:hover,
	.event-actions button:hover,
	.route-panel a:hover,
	.rsvp-actions a:hover,
	.gallery-controls button:hover,
	.event-arrow:hover {
		transform: translateY(-2px);
		background: #fffdf8;
		border-color: var(--city-gold);
	}

	.quick-nav {
		position: sticky;
		top: 0.75rem;
		z-index: 40;
		display: flex;
		justify-content: center;
		gap: 0.35rem;
		width: fit-content;
		margin: 0 auto -3rem;
		padding: 0.35rem;
		border: 1px solid rgba(214, 174, 79, 0.38);
		background: rgba(255, 249, 239, 0.8);
		backdrop-filter: blur(14px);
		box-shadow: 0 12px 38px rgba(23, 19, 21, 0.1);
	}

	.quick-nav a {
		padding: 0.42rem 0.65rem;
		border-radius: 4px;
		color: var(--city-plum);
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 700;
		text-decoration: none;
	}

	.quick-nav a:hover {
		background: rgba(214, 174, 79, 0.16);
	}

	.hero {
		position: relative;
		min-height: 100vh;
		min-height: 100svh;
		display: grid;
		align-items: end;
		overflow: hidden;
		background: var(--city-night);
	}

	.hero-media {
		position: absolute;
		inset: 0;
	}

	.hero-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.04);
		filter: saturate(1.08) contrast(1.02);
	}

	.hero-wash {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(12, 10, 12, 0.2), rgba(12, 10, 12, 0.82)),
			linear-gradient(90deg, rgba(92, 38, 57, 0.58), rgba(40, 80, 69, 0.34));
	}

	.city-lines {
		position: absolute;
		inset: auto 0 0;
		height: 30vh;
		pointer-events: none;
	}

	.city-lines span {
		position: absolute;
		left: var(--x);
		bottom: 0;
		width: var(--w);
		height: var(--h);
		background:
			repeating-linear-gradient(180deg, rgba(255, 249, 239, 0.18) 0 6px, transparent 6px 18px),
			linear-gradient(180deg, rgba(255, 249, 239, 0.16), rgba(23, 19, 21, 0.9));
		border: 1px solid rgba(214, 174, 79, 0.2);
		animation: buildingGlow 4s ease-in-out infinite alternate;
	}

	.hero-copy {
		position: relative;
		z-index: 1;
		width: min(100%, 900px);
		margin: 0 auto;
		padding: clamp(4.25rem, 12vw, 7rem) clamp(1.15rem, 5vw, 3rem);
		text-align: center;
		color: var(--city-ivory);
		background:
			linear-gradient(180deg, rgba(23, 19, 21, 0.28), rgba(23, 19, 21, 0.12)),
			radial-gradient(ellipse at 50% 0%, rgba(214, 174, 79, 0.18), transparent 58%);
		backdrop-filter: blur(2px);
	}

	.micro {
		margin: 0 0 0.7rem;
		color: var(--city-gold);
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}

	.hero-copy h2 {
		display: grid;
		gap: 0.2rem;
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 12vw, 6.2rem);
		line-height: 0.95;
	}

	.hero-copy h2 em {
		font-family: var(--font-ui);
		font-size: clamp(0.78rem, 2vw, 1rem);
		font-style: normal;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--city-gold);
	}

	.hero-date,
	.tagline {
		margin: 1rem auto 0;
		max-width: 42rem;
		font-size: clamp(1rem, 2.4vw, 1.2rem);
		line-height: 1.6;
	}

	.tagline {
		opacity: 0.88;
		font-style: italic;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.hero-actions a {
		padding: 0.7rem 1rem;
		background: rgba(255, 249, 239, 0.12);
		color: var(--city-ivory);
		backdrop-filter: blur(10px);
	}

	.section-inner {
		width: min(100% - 2.4rem, 1060px);
		margin: 0 auto;
	}

	.blessing,
	.events-section,
	.gallery-section,
	.know-section {
		padding: clamp(3.5rem, 8vw, 6rem) 0;
	}

	.reveal-section {
		opacity: 0.28;
		transform: translateY(34px);
		transition:
			opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.city :global(.reveal-section[data-in-view='true']) {
		opacity: 1;
		transform: none;
	}

	.blessing {
		background:
			linear-gradient(180deg, rgba(255, 249, 239, 0.95), rgba(246, 236, 223, 0.96)),
			linear-gradient(90deg, rgba(255, 249, 239, 0.92), rgba(255, 249, 239, 0.68)),
			var(--mandap-photo),
			repeating-linear-gradient(135deg, rgba(214, 174, 79, 0.08) 0 1px, transparent 1px 18px);
		background-size: cover;
		background-position: center;
	}

	.blessing-grid {
		display: grid;
		gap: 2rem;
		align-items: center;
	}

	@media (min-width: 800px) {
		.blessing-grid {
			grid-template-columns: 1fr 0.9fr;
		}
	}

	.blessing h2,
	.section-head h2,
	.story-copy h2,
	.gallery-top h2,
	.rsvp-section h2,
	.countdown-section h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 4vw, 3rem);
		line-height: 1.1;
	}

	.family-stack {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid rgba(92, 38, 57, 0.14);
		background: rgba(255, 253, 248, 0.78);
		box-shadow: 0 18px 50px rgba(23, 19, 21, 0.06);
	}

	.family-stack p {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.55;
	}

	.family-stack span {
		width: 100%;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--city-gold), transparent);
	}

	.events-section {
		background:
			linear-gradient(180deg, rgba(255, 250, 242, 0.94), rgba(255, 250, 242, 0.92)),
			var(--gold-hall-photo);
		background-size: cover;
		background-position: center;
	}

	.section-head {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1.4rem;
	}

	.section-head.center {
		text-align: center;
		max-width: 46rem;
		margin-inline: auto;
	}

	.event-tabs {
		display: flex;
		gap: 0.6rem;
		overflow-x: auto;
		padding: 0.25rem 0 1rem;
		scrollbar-width: thin;
	}

	.event-tabs button {
		flex: 0 0 auto;
		min-width: 8rem;
		padding: 0.65rem 0.8rem;
		border: 1px solid rgba(92, 38, 57, 0.18);
		background: var(--city-paper);
		color: var(--city-ink);
		border-radius: 6px;
		font-family: var(--font-ui);
		font-weight: 700;
		text-align: left;
		cursor: pointer;
	}

	.event-tabs button span {
		display: block;
		margin-bottom: 0.2rem;
		color: var(--city-coral);
		font-size: 0.72rem;
	}

	.event-tabs button.active {
		background: var(--city-plum);
		color: var(--city-ivory);
		border-color: var(--city-plum);
	}

	.event-tabs button.active span {
		color: var(--city-gold);
	}

	.event-stage {
		position: relative;
		display: grid;
		gap: 0.75rem;
		align-items: center;
	}

	@media (min-width: 860px) {
		.event-stage {
			grid-template-columns: auto 1fr auto;
		}
	}

	.event-card {
		display: grid;
		overflow: hidden;
		border: 1px solid rgba(214, 174, 79, 0.35);
		background: var(--city-night);
		color: var(--city-ivory);
		box-shadow: 0 26px 70px rgba(23, 19, 21, 0.16);
	}

	@media (min-width: 760px) {
		.event-card {
			grid-template-columns: 0.88fr 1fr;
		}
	}

	.event-scene {
		position: relative;
		min-height: 280px;
		background:
			linear-gradient(180deg, #462137 0%, #161316 72%),
			repeating-linear-gradient(90deg, rgba(255, 249, 239, 0.06) 0 1px, transparent 1px 38px);
		overflow: hidden;
	}

	.event-scene img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.45;
		filter: saturate(1.08) contrast(1.04);
	}

	.event-scene > span,
	.event-scene::before,
	.event-scene::after {
		z-index: 1;
	}

	.event-scene::before,
	.event-scene::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 38%;
		background:
			repeating-linear-gradient(90deg, transparent 0 32px, rgba(214, 174, 79, 0.16) 32px 34px),
			linear-gradient(180deg, rgba(255, 249, 239, 0.08), #1d171b);
		clip-path: polygon(0 42%, 12% 22%, 26% 35%, 38% 12%, 53% 32%, 68% 14%, 80% 38%, 100% 24%, 100% 100%, 0 100%);
	}

	.event-scene::after {
		height: 55%;
		opacity: 0.52;
		transform: translateY(10%);
	}

	.sun {
		position: absolute;
		top: 17%;
		left: 14%;
		width: 74px;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #fff4c6, var(--city-gold) 64%, #ba713a);
		box-shadow: 0 0 70px rgba(214, 174, 79, 0.34);
	}

	.road {
		position: absolute;
		left: 18%;
		right: 18%;
		bottom: -5%;
		height: 38%;
		background: linear-gradient(180deg, rgba(214, 174, 79, 0.12), rgba(214, 174, 79, 0));
		clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%);
	}

	.pin {
		position: absolute;
		left: 58%;
		bottom: 34%;
		width: 20px;
		aspect-ratio: 1;
		border-radius: 50% 50% 50% 0;
		background: var(--city-coral);
		transform: rotate(-45deg);
		box-shadow: 0 0 0 8px rgba(216, 94, 70, 0.18);
		animation: pinPulse 1.8s ease-in-out infinite;
	}

	.event-copy {
		padding: clamp(1.25rem, 4vw, 2.5rem);
	}

	.event-count {
		margin: 0 0 0.6rem;
		color: var(--city-gold);
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.event-copy h3 {
		margin: 0 0 0.65rem;
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 5vw, 3rem);
		line-height: 1.05;
	}

	.when,
	.where,
	.address,
	.detail-line {
		margin: 0.4rem 0 0;
		line-height: 1.55;
	}

	.when {
		color: #ffe8b6;
		font-weight: 700;
	}

	.address,
	.detail-line {
		opacity: 0.82;
	}

	.event-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin-top: 1rem;
	}

	.event-actions a,
	.event-actions button,
	.route-panel a {
		padding: 0.56rem 0.8rem;
	}

	.event-arrow {
		padding: 0.55rem 0.8rem;
		background: var(--city-paper);
	}

	.route-panel {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px solid rgba(92, 38, 57, 0.14);
		background:
			linear-gradient(135deg, rgba(214, 174, 79, 0.12), transparent 45%),
			#fffdf8;
		box-shadow: 0 14px 42px rgba(23, 19, 21, 0.07);
	}

	.route-panel p:not(.micro) {
		margin: 0 0 0.8rem;
		line-height: 1.55;
	}

	.couple-story {
		display: grid;
		background: var(--city-paper);
	}

	@media (min-width: 820px) {
		.couple-story {
			grid-template-columns: 1fr 1fr;
			min-height: 680px;
		}
	}

	.story-photo {
		min-height: 420px;
		background: var(--city-night);
		overflow: hidden;
	}

	.story-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.03);
	}

	.story-copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: clamp(2rem, 7vw, 5rem);
	}

	.story-copy p:not(.micro):not(.sign) {
		margin: 1rem 0 0;
		font-size: 1.05rem;
		line-height: 1.8;
		color: rgba(23, 19, 21, 0.78);
	}

	.sign {
		margin: 1.25rem 0 0;
		color: var(--city-plum);
		font-family: var(--font-display);
		font-weight: 700;
	}

	.gallery-section {
		background:
			linear-gradient(180deg, rgba(23, 19, 21, 0.92), rgba(23, 19, 21, 0.88)),
			var(--haldi-photo);
		background-size: cover;
		background-position: center;
		color: var(--city-ivory);
	}

	.gallery-top {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: end;
		justify-content: space-between;
		margin-bottom: 1.2rem;
	}

	.gallery-controls {
		display: flex;
		gap: 0.5rem;
	}

	.gallery-controls button {
		padding: 0.55rem 0.8rem;
		background: rgba(255, 249, 239, 0.1);
		color: var(--city-ivory);
	}

	.gallery-main {
		position: relative;
		overflow: hidden;
		border: 1px solid rgba(214, 174, 79, 0.32);
		background: #0f0c0e;
		aspect-ratio: 16 / 10;
		min-height: 320px;
	}

	.gallery-main img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		animation: imageSettle 0.42s ease;
	}

	.gallery-dots {
		position: absolute;
		left: 50%;
		bottom: 1rem;
		display: flex;
		gap: 0.35rem;
		padding: 0.4rem;
		background: rgba(23, 19, 21, 0.55);
		transform: translateX(-50%);
		backdrop-filter: blur(8px);
	}

	.gallery-dots button {
		width: 10px;
		height: 10px;
		padding: 0;
		border: 1px solid rgba(255, 249, 239, 0.7);
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
	}

	.gallery-dots button.active {
		background: var(--city-gold);
		border-color: var(--city-gold);
	}

	.rsvp-section {
		padding: clamp(3.5rem, 8vw, 6rem) 0;
		background:
			linear-gradient(150deg, rgba(92, 38, 57, 0.92), rgba(37, 24, 35, 0.9)),
			var(--ceremony-photo),
			repeating-linear-gradient(90deg, rgba(214, 174, 79, 0.1) 0 1px, transparent 1px 42px);
		background-size: cover;
		background-position: center;
		color: var(--city-ivory);
	}

	.rsvp-grid {
		display: grid;
		gap: 1.5rem;
		align-items: center;
	}

	@media (min-width: 760px) {
		.rsvp-grid {
			grid-template-columns: 1fr auto;
		}
	}

	.rsvp-grid p:not(.micro) {
		max-width: 42rem;
		margin: 1rem 0 0;
		line-height: 1.65;
		opacity: 0.86;
	}

	.rsvp-actions {
		display: grid;
		gap: 0.7rem;
		min-width: min(100%, 260px);
	}

	.rsvp-actions a {
		display: flex;
		justify-content: center;
		padding: 0.85rem 1rem;
		background: rgba(255, 249, 239, 0.1);
		color: var(--city-ivory);
	}

	.rsvp-actions .primary-action {
		background: var(--city-gold);
		color: #231619;
		border-color: var(--city-gold);
	}

	.empty-action {
		margin: 0;
		padding: 1rem;
		border: 1px dashed rgba(255, 249, 239, 0.35);
	}

	.know-section {
		background:
			linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(255, 250, 242, 0.9)),
			var(--cover-photo);
		background-size: cover;
		background-position: center;
	}

	.know-grid {
		display: grid;
		gap: 0.85rem;
		margin-top: 1.4rem;
	}

	@media (min-width: 760px) {
		.know-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	details {
		border: 1px solid rgba(92, 38, 57, 0.14);
		background: var(--city-ivory);
	}

	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		list-style: none;
		cursor: pointer;
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--city-plum);
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary::after {
		content: '+';
		font-size: 1.25rem;
		line-height: 1;
		color: var(--city-coral);
	}

	details[open] summary::after {
		content: '-';
	}

	details p {
		margin: 0;
		padding: 0 1rem 1rem;
		line-height: 1.6;
		color: rgba(23, 19, 21, 0.78);
	}

	.countdown-section {
		padding: clamp(3.5rem, 8vw, 6rem) 0;
		background:
			linear-gradient(180deg, rgba(23, 19, 21, 0.86), rgba(23, 19, 21, 0.92)),
			var(--gold-hall-photo);
		background-size: cover;
		background-position: center;
		color: var(--city-ivory);
	}

	.countdown-inner {
		display: grid;
		gap: 1.5rem;
		align-items: center;
	}

	@media (min-width: 840px) {
		.countdown-inner {
			grid-template-columns: 1fr auto;
		}
	}

	.countdown {
		display: grid;
		grid-template-columns: repeat(4, minmax(4rem, 1fr));
		gap: 0.5rem;
		font-variant-numeric: tabular-nums;
	}

	.countdown span {
		display: grid;
		place-items: center;
		min-width: 4.4rem;
		padding: 0.8rem 0.5rem;
		border: 1px solid rgba(214, 174, 79, 0.35);
		background: rgba(255, 249, 239, 0.06);
	}

	.countdown strong {
		font-family: var(--font-display);
		font-size: clamp(1.65rem, 5vw, 2.4rem);
		line-height: 1;
	}

	.countdown small {
		margin-top: 0.3rem;
		font-family: var(--font-ui);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--city-gold);
	}

	.countdown-fallback {
		margin: 0;
		color: var(--city-gold);
	}

	.city-foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.8rem 1rem;
		padding: 1.5rem;
		background: #fffaf2;
		border-top: 1px solid rgba(92, 38, 57, 0.1);
		text-align: center;
	}

	.city-foot p {
		margin: 0;
	}

	.city-foot a,
	.city-foot span {
		color: var(--city-plum);
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 700;
	}

	@keyframes buildingGlow {
		from {
			opacity: 0.72;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes pinPulse {
		0%,
		100% {
			box-shadow: 0 0 0 8px rgba(216, 94, 70, 0.16);
		}
		50% {
			box-shadow: 0 0 0 18px rgba(216, 94, 70, 0.02);
		}
	}

	@keyframes imageSettle {
		from {
			opacity: 0.5;
			transform: scale(1.03);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (max-width: 640px) {
		.quick-nav {
			width: calc(100% - 1rem);
			top: 0.5rem;
		}

		.quick-nav a {
			flex: 1;
			text-align: center;
		}

		.event-arrow {
			width: 100%;
		}

		.gallery-main {
			aspect-ratio: 4 / 5;
		}

		.countdown {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.city-lines span,
		.pin,
		.gallery-main img {
			animation: none !important;
		}

		.reveal-section {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
		}

		.open-btn:hover,
		.hero-actions a:hover,
		.event-actions a:hover,
		.event-actions button:hover,
		.route-panel a:hover,
		.rsvp-actions a:hover,
		.gallery-controls button:hover,
		.event-arrow:hover {
			transform: none;
		}
	}
</style>

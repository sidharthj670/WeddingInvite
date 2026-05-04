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
	let galleryIndex = $state(0);
	let now = $state(Date.now());
	let reduceMotion = $state(false);
	let y = $state(0);

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

	function clampIdx(i: number, len: number): number {
		if (len <= 0) return 0;
		return ((i % len) + len) % len;
	}

	function selectEvent(i: number) {
		activeEvent = clampIdx(i, visibleEvents.length);
	}

	function moveGallery(delta: number) {
		galleryIndex = clampIdx(galleryIndex + delta, gallery.length || 1);
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
	const activeIdx = $derived(Math.min(activeEvent, Math.max(0, visibleEvents.length - 1)));
	const currentEvent = $derived(visibleEvents[activeIdx] ?? fallbackEvent());
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
	const currentGallery = $derived(gallery[clampIdx(galleryIndex, gallery.length)] ?? heroSrc);
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

	function pad2(n: number): string {
		return String(n).padStart(2, '0');
	}

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

	function onScroll() {
		if (typeof window === 'undefined' || reduceMotion) return;
		y = window.scrollY;
	}
</script>

<svelte:window onscroll={onScroll} />

<div
	class="oceanic"
	class:preview
	class:opened={inviteOpen}
	class:reduce={reduceMotion}
	data-template="wedding-oceanic-v1"
>
	<BackgroundMusic src={musicBg} {preview} />

	<!-- ══════ COVER ══════ -->
	{#if !inviteOpen}
		<section class="cover" aria-label="Open invitation">
			<div class="lanterns" aria-hidden="true">
				<span class="lantern l1"></span>
				<span class="lantern l2"></span>
				<span class="lantern l3"></span>
				<span class="lantern l4"></span>
				<span class="lantern l5"></span>
				<span class="lantern l6"></span>
				<span class="lantern l7"></span>
				<span class="lantern l8"></span>
			</div>
			<div class="cover-card">
				<p class="cover-label">Wedding Invitation</p>
				<h1 class="cover-names">
					<span class="script-name">{groomName}</span>
					<span class="amp">&</span>
					<span class="script-name">{brideName}</span>
				</h1>
				<p class="cover-date">{payload.weddingDate || 'Save the date'}</p>
				<button type="button" class="open-btn" onclick={() => (coverDismissed = true)}>
					Open Invitation
				</button>
			</div>
		</section>
	{/if}

	<!-- ══════ HERO ══════ -->
	<section class="hero">
		<div
			class="hero-img-wrap"
			style:transform={reduceMotion ? undefined : `translate3d(0, ${y * 0.15}px, 0)`}
		>
			<img src={heroSrc} alt="" fetchpriority="high" decoding="async" />
			<div class="hero-overlay"></div>
		</div>
		<div class="hero-content reveal-section" use:inView>
			<p class="hero-eyebrow">Together with their families</p>
			<h2 class="hero-names">
				<span class="script-name">{groomName}</span>
				<span class="amp">&</span>
				<span class="script-name">{brideName}</span>
			</h2>
			<p class="hero-date">{payload.weddingDate || 'Date to be announced'}</p>
			{#if payload.tagline?.trim()}
				<p class="hero-tagline">{payload.tagline}</p>
			{/if}
			<div class="hero-actions">
				<a class="btn btn-gold" href="#oce-events">Explore Events</a>
				{#if rsvpUrl}
					<a class="btn btn-outline" href="#oce-rsvp">RSVP</a>
				{/if}
			</div>
			<div class="scroll-hint" aria-hidden="true">↓</div>
		</div>
	</section>

	<!-- ══════ BLESSING / FAMILY ══════ -->
	<section class="blessing reveal-section" use:inView>
		<div class="blessing-card">
			<p class="section-eyebrow">With Blessings</p>
			{#if payload.openingQuote?.trim()}
				<blockquote class="blessing-quote">
					"{payload.openingQuote}"
					{#if payload.openingAttribution?.trim()}
						<cite>— {payload.openingAttribution}</cite>
					{/if}
				</blockquote>
			{/if}
			{#if payload.openingMantra?.trim()}
				<p class="mantra">{payload.openingMantra}</p>
			{/if}
			<div class="families-row">
				<div class="family-side">
					<p class="family-label">Groom's Family</p>
					<p class="family-names">{payload.groomParents || "Groom's parents"}</p>
					{#if payload.groomFamilyNote?.trim()}
						<p class="family-note">{payload.groomFamilyNote}</p>
					{/if}
				</div>
				<div class="family-divider" aria-hidden="true">
					<span class="divider-diamond">◇</span>
				</div>
				<div class="family-side">
					<p class="family-label">Bride's Family</p>
					<p class="family-names">{payload.brideParents || "Bride's parents"}</p>
					{#if payload.brideFamilyNote?.trim()}
						<p class="family-note">{payload.brideFamilyNote}</p>
					{/if}
				</div>
			</div>
			{#if payload.inviteLead?.trim()}
				<p class="invite-lead">{payload.inviteLead}</p>
			{/if}
		</div>
	</section>

	<!-- ══════ EVENTS ══════ -->
	<section id="oce-events" class="events-section reveal-section" use:inView>
		<p class="section-eyebrow light">On the following events</p>
		<h2 class="section-title light">Celebration Schedule</h2>

		<div class="event-tabs" role="tablist" aria-label="Wedding events">
			{#each visibleEvents as ev, i (i)}
				<button
					type="button"
					role="tab"
					class:active={i === activeIdx}
					aria-selected={i === activeIdx}
					onclick={() => selectEvent(i)}
				>
					{ev.title || `Event ${i + 1}`}
				</button>
			{/each}
		</div>

		<div class="event-stage">
			<button type="button" class="ev-arrow left" aria-label="Previous event" onclick={() => selectEvent(activeIdx - 1)}>‹</button>
			<article class="event-card">
				<div class="event-number" aria-hidden="true">{pad2(activeIdx + 1)}</div>
				<h3 class="event-title">{currentEvent.title || `Event ${activeIdx + 1}`}</h3>
				<div class="event-detail-row">
					<span class="event-icon">📅</span>
					<p>{formatEventWhen(currentEvent)}</p>
				</div>
				<div class="event-detail-row">
					<span class="event-icon">📍</span>
					<div>
						<p class="event-venue">{currentEvent.venueName || 'Venue'}</p>
						{#if currentEvent.venueAddress?.trim()}
							<p class="event-address">{currentEvent.venueAddress}</p>
						{/if}
					</div>
				</div>
				{#if currentEvent.dressCode?.trim()}
					<div class="event-detail-row">
						<span class="event-icon">👔</span>
						<p>{currentEvent.dressCode}</p>
					</div>
				{/if}
				{#if currentEvent.notes?.trim()}
					<p class="event-notes">{currentEvent.notes}</p>
				{/if}
				{#if eventMapUrl}
					<a class="btn btn-outline small" href={eventMapUrl} target="_blank" rel="noopener noreferrer">See the Route →</a>
				{/if}
			</article>
			<button type="button" class="ev-arrow right" aria-label="Next event" onclick={() => selectEvent(activeIdx + 1)}>›</button>
		</div>
		<div class="event-dots" aria-hidden="true">
			{#each visibleEvents as _, i (i)}
				<span class:active={i === activeIdx}></span>
			{/each}
		</div>
	</section>

	<!-- ══════ MEET THE COUPLE ══════ -->
	<section class="couple-section reveal-section" use:inView>
		<div class="couple-bg-shapes" aria-hidden="true">
			<span class="shape s1"></span>
			<span class="shape s2"></span>
		</div>
		<p class="section-eyebrow">Meet the</p>
		<h2 class="couple-heading">Bride <span class="amp-sm">&</span> Groom</h2>
		<div class="couple-photo-wrap">
			<img src={currentGallery} alt="{coupleLine}" loading="lazy" decoding="async" class="couple-photo" />
		</div>
		<p class="couple-letter">
			{payload.personalLetter ||
				payload.openingQuote ||
				'We are overjoyed that you will be joining us as we celebrate our union. Your love and support means more to us than words can say.'}
		</p>
		{#if payload.signOffLine?.trim()}
			<p class="couple-signoff">{payload.signOffLine}</p>
		{/if}
	</section>

	<!-- ══════ GALLERY ══════ -->
	{#if gallery.length > 1}
		<section class="gallery-section reveal-section" use:inView>
			<p class="section-eyebrow light">Follow the action</p>
			<h2 class="section-title light">{payload.galleryTitle || 'Our Moments'}</h2>
			<div class="gallery-stage">
				<button type="button" class="gal-arrow" aria-label="Previous image" onclick={() => moveGallery(-1)}>‹</button>
				<div class="gallery-frame">
					<img src={currentGallery} alt="" loading="lazy" decoding="async" />
				</div>
				<button type="button" class="gal-arrow" aria-label="Next image" onclick={() => moveGallery(1)}>›</button>
			</div>
			<div class="gallery-dots">
				{#each gallery as _, i (i)}
					<button
						type="button"
						class:active={i === clampIdx(galleryIndex, gallery.length)}
						aria-label={`Show image ${i + 1}`}
						onclick={() => (galleryIndex = i)}
					></button>
				{/each}
			</div>
			{#if instagramUrl}
				<a class="btn btn-outline small insta-link" href={instagramUrl} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
			{/if}
		</section>
	{/if}

	<!-- ══════ RSVP ══════ -->
	<section id="oce-rsvp" class="rsvp-section reveal-section" use:inView>
		<div class="rsvp-card">
			<p class="section-eyebrow">Looking forward to see you</p>
			<h2 class="rsvp-title">RSVP</h2>
			<p class="rsvp-sub">Click the link to confirm your attendance and let us know you'll be there for the celebration.</p>
			<div class="rsvp-actions">
				{#if rsvpUrl}
					<a class="btn btn-gold big" href={rsvpUrl} target="_blank" rel="noopener noreferrer">Click to RSVP</a>
				{:else}
					<p class="empty-note">RSVP link will appear once added.</p>
				{/if}
				{#if whatsappUrl}
					<a class="btn btn-outline" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
				{/if}
			</div>
		</div>
	</section>

	<!-- ══════ THINGS TO KNOW ══════ -->
	{#if hasKnow}
		<section class="know-section reveal-section" use:inView>
			<p class="section-eyebrow light">Things to know</p>
			<h2 class="section-title light">A few thoughtful details</h2>
			<p class="know-lead">To help you feel at ease and enjoy every moment of the celebrations.</p>
			<div class="know-grid">
				{#if payload.thingsToKnow?.hashtag?.trim() || payload.hashtag?.trim()}
					<div class="know-card">
						<div class="know-icon">📸</div>
						<h3>Instagram</h3>
						<p>{payload.thingsToKnow?.hashtag || payload.hashtag}</p>
					</div>
				{/if}
				{#if payload.thingsToKnow?.weather?.trim()}
					<div class="know-card">
						<div class="know-icon">🌤</div>
						<h3>Weather</h3>
						<p>{payload.thingsToKnow.weather}</p>
					</div>
				{/if}
				{#if payload.thingsToKnow?.staff?.trim()}
					<div class="know-card">
						<div class="know-icon">👗</div>
						<h3>Attire</h3>
						<p>{payload.thingsToKnow.staff}</p>
					</div>
				{/if}
				{#if payload.thingsToKnow?.parking?.trim()}
					<div class="know-card">
						<div class="know-icon">🅿️</div>
						<h3>Parking</h3>
						<p>{payload.thingsToKnow.parking}</p>
					</div>
				{/if}
				{#if payload.coordinatorNote?.trim()}
					<div class="know-card">
						<div class="know-icon">📋</div>
						<h3>Coordinator</h3>
						<p>{payload.coordinatorNote}</p>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- ══════ COUNTDOWN ══════ -->
	<section class="countdown-section reveal-section" use:inView>
		<div class="countdown-inner">
			<p class="section-eyebrow light">The countdown begins</p>
			{#if countdown}
				<div class="countdown-grid" aria-live="polite">
					<div class="cd-cell"><span class="cd-num">{pad2(countdown.d)}</span><span class="cd-lbl">Days</span></div>
					<div class="cd-sep">:</div>
					<div class="cd-cell"><span class="cd-num">{pad2(countdown.h)}</span><span class="cd-lbl">Hours</span></div>
					<div class="cd-sep">:</div>
					<div class="cd-cell"><span class="cd-num">{pad2(countdown.m)}</span><span class="cd-lbl">Minutes</span></div>
					<div class="cd-sep">:</div>
					<div class="cd-cell"><span class="cd-num">{pad2(countdown.s)}</span><span class="cd-lbl">Seconds</span></div>
				</div>
			{:else}
				<p class="cd-fallback">{payload.weddingDate || 'Countdown appears after adding a date.'}</p>
			{/if}
			<p class="cd-note">{payload.footerFamilyNote || 'Our families are excited that you are able to join us in celebrating what we hope will be one of the happiest days of our lives.'}</p>
		</div>
	</section>

	<!-- ══════ FOOTER ══════ -->
	<footer class="oce-footer">
		<h2 class="footer-names">
			<span class="script-name">{groomName}</span>
			<span class="amp-sm">&</span>
			<span class="script-name">{brideName}</span>
		</h2>
		<p class="footer-note">{payload.footerNote || `With love, ${coupleLine}`}</p>
		{#if instagramUrl}
			<a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
		{/if}
	</footer>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&display=swap');
	.oceanic{--oc-deep:#1a0e2e;--oc-teal:#0d4f4f;--oc-teal-l:#1a6b6b;--oc-coral:#e07c5a;--oc-gold:#d4a843;--oc-gold-s:rgba(212,168,67,.35);--oc-ivory:#fef8f0;--oc-pink:#e8a0b4;--oc-ink:#1c1418;--oc-ink-s:rgba(28,20,24,.7);--oc-line:rgba(212,168,67,.3);--font-serif:'Playfair Display',Georgia,serif;--font-script:'Dancing Script',cursive;position:relative;overflow-x:clip;color:var(--oc-ink);background:var(--oc-ivory);font-family:var(--font-body)}
	.oceanic.preview{outline:2px dashed var(--oc-coral);outline-offset:-2px}
	.script-name{font-family:var(--font-script);font-weight:700}
	.amp,.amp-sm{font-family:var(--font-serif);font-style:italic;color:var(--oc-gold)}
	.section-eyebrow{font-family:var(--font-ui);font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--oc-gold);margin:0 0 .75rem}
	.section-eyebrow.light{color:var(--oc-gold)}
	.section-title{font-family:var(--font-serif);font-size:clamp(1.6rem,4vw,2.4rem);font-weight:700;margin:0 0 1.5rem;color:var(--oc-ivory)}
	.section-title.light{color:var(--oc-ivory)}
	.reveal-section{opacity:0;transform:translateY(40px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
	.reveal-section[data-in-view='true']{opacity:1;transform:translateY(0)}
	.reduce .reveal-section{opacity:1;transform:none;transition:none}
	.btn{display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-ui);font-size:.9rem;font-weight:600;padding:.7rem 1.4rem;border-radius:4px;text-decoration:none;transition:transform .25s,box-shadow .25s,background .25s;border:none;cursor:pointer}
	.btn-gold{background:linear-gradient(135deg,var(--oc-gold),var(--oc-coral));color:#fff;box-shadow:0 8px 28px rgba(212,168,67,.35)}
	.btn-gold:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(212,168,67,.45)}
	.btn-outline{background:transparent;border:1.5px solid var(--oc-gold);color:var(--oc-gold)}
	.btn-outline:hover{background:rgba(212,168,67,.12);transform:translateY(-2px)}
	.btn.big{padding:.85rem 2.2rem;font-size:1rem}
	.btn.small{padding:.5rem 1rem;font-size:.82rem}

	/* ══ COVER ══ */
	.cover{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:1.5rem;background:linear-gradient(180deg,#0c0618 0%,#1a0e2e 40%,#0d4f4f 100%);color:var(--oc-ivory);overflow:hidden}
	.lanterns{position:absolute;inset:0;pointer-events:none}
	.lantern{position:absolute;width:8px;height:12px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 40%,#ffe4a0,var(--oc-gold) 60%,rgba(212,168,67,.3));box-shadow:0 0 12px 4px rgba(255,214,100,.4),0 0 24px 8px rgba(212,168,67,.2);animation:lantern-float 8s ease-in-out infinite}
	.l1{left:8%;top:15%;animation-delay:0s;animation-duration:9s}.l2{left:22%;top:8%;animation-delay:1.2s;animation-duration:7s}.l3{left:40%;top:20%;animation-delay:.6s;animation-duration:10s}.l4{left:58%;top:12%;animation-delay:2s;animation-duration:8s}.l5{left:72%;top:18%;animation-delay:.8s;animation-duration:9.5s}.l6{left:88%;top:10%;animation-delay:1.8s;animation-duration:7.5s}.l7{left:35%;top:5%;animation-delay:2.5s;animation-duration:11s}.l8{left:65%;top:25%;animation-delay:3s;animation-duration:8.5s}
	@keyframes lantern-float{0%,100%{transform:translate3d(0,0,0) scale(1);opacity:.7}25%{transform:translate3d(6px,-18px,0) scale(1.1);opacity:1}50%{transform:translate3d(-4px,-30px,0) scale(.95);opacity:.85}75%{transform:translate3d(8px,-14px,0) scale(1.05);opacity:.95}}
	.reduce .lantern{animation:none;opacity:.7}
	.cover-card{position:relative;z-index:2;width:min(100%,420px);padding:clamp(2rem,6vw,3rem);text-align:center;border:1px solid var(--oc-line);background:rgba(26,14,46,.6);backdrop-filter:blur(16px);box-shadow:0 24px 80px rgba(0,0,0,.4)}
	.cover-card::before{content:'';position:absolute;inset:.6rem;border:1px solid rgba(212,168,67,.25);pointer-events:none}
	.cover-label{font-family:var(--font-ui);font-size:.7rem;letter-spacing:.35em;text-transform:uppercase;color:var(--oc-gold);margin:0 0 1rem}
	.cover-names{display:flex;flex-direction:column;align-items:center;gap:.15rem;margin:0 0 1rem;font-size:clamp(2.2rem,10vw,3.8rem);line-height:1.05;color:var(--oc-ivory)}
	.cover-names .amp{font-size:.5em;margin:.15rem 0}
	.cover-date{margin:0 0 1.5rem;font-family:var(--font-serif);font-size:1rem;opacity:.85}
	.open-btn{font-family:var(--font-ui);font-size:.85rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;padding:.75rem 2rem;border:1.5px solid var(--oc-gold);background:transparent;color:var(--oc-gold);cursor:pointer;transition:all .3s;border-radius:2px}
	.open-btn:hover{background:var(--oc-gold);color:var(--oc-deep)}

	/* ══ HERO ══ */
	.hero{position:relative;min-height:100dvh;display:flex;align-items:center;justify-content:center;overflow:hidden}
	.hero-img-wrap{position:absolute;inset:-15% 0 0;z-index:0}
	.hero-img-wrap img{width:100%;height:100%;object-fit:cover}
	.hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(26,14,46,.3),rgba(13,79,79,.5) 60%,rgba(26,14,46,.7))}
	.hero-content{position:relative;z-index:1;text-align:center;padding:clamp(2rem,8vw,4rem) 1.25rem;max-width:40rem;color:var(--oc-ivory)}
	.hero-eyebrow{font-family:var(--font-ui);font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:var(--oc-gold);margin:0 0 1rem}
	.hero-names{display:flex;flex-direction:column;align-items:center;gap:.1rem;font-size:clamp(2.8rem,10vw,4.5rem);line-height:1.05;margin:0 0 1rem;text-shadow:0 4px 20px rgba(0,0,0,.4)}
	.hero-names .amp{font-size:.45em;margin:.2rem 0}
	.hero-date{font-family:var(--font-serif);font-size:clamp(1rem,2.5vw,1.3rem);margin:0 0 .5rem;opacity:.9}
	.hero-tagline{font-family:var(--font-body);font-size:1rem;margin:0 0 1.5rem;opacity:.8;font-style:italic}
	.hero-actions{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;margin-bottom:2rem}
	.scroll-hint{font-size:1.5rem;opacity:.5;animation:bounce-hint 2s ease-in-out infinite}
	@keyframes bounce-hint{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
	.reduce .scroll-hint{animation:none}

	/* ══ BLESSING ══ */
	.blessing{padding:clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem);background:linear-gradient(180deg,var(--oc-ivory),#f5ede0)}
	.blessing-card{max-width:48rem;margin:0 auto;padding:clamp(2rem,5vw,3rem);text-align:center;border:1px solid var(--oc-line);background:rgba(255,253,248,.9);box-shadow:0 16px 60px rgba(26,14,46,.08);position:relative}
	.blessing-card::before{content:'';position:absolute;inset:.5rem;border:1px solid rgba(212,168,67,.2);pointer-events:none}
	.blessing-quote{font-family:var(--font-serif);font-style:italic;font-size:clamp(1.1rem,2.5vw,1.4rem);line-height:1.6;margin:0 0 1rem;color:var(--oc-ink-s)}
	.blessing-quote cite{display:block;font-size:.85rem;margin-top:.5rem;font-style:normal;color:var(--oc-gold)}
	.mantra{font-family:var(--font-script);font-size:1.3rem;color:var(--oc-coral);margin:0 0 1.5rem}
	.families-row{display:flex;flex-direction:column;gap:1.5rem;margin:1.5rem 0}
	@media(min-width:640px){.families-row{flex-direction:row;align-items:flex-start}}
	.family-side{flex:1;text-align:center}
	.family-label{font-family:var(--font-ui);font-size:.7rem;letter-spacing:.25em;text-transform:uppercase;color:var(--oc-gold);margin:0 0 .5rem}
	.family-names{font-family:var(--font-serif);font-size:1.1rem;font-weight:600;margin:0 0 .3rem}
	.family-note{font-size:.92rem;color:var(--oc-ink-s);margin:0}
	.family-divider{display:flex;align-items:center;justify-content:center;padding:.5rem 0}
	.divider-diamond{color:var(--oc-gold);font-size:1.2rem}
	.invite-lead{font-size:1rem;color:var(--oc-ink-s);margin:1.5rem 0 0;max-width:36ch;margin-left:auto;margin-right:auto}

	/* ══ EVENTS ══ */
	.events-section{padding:clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem);background:linear-gradient(180deg,var(--oc-deep),#0a3a3a);text-align:center}
	.event-tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin-bottom:2rem}
	.event-tabs button{font-family:var(--font-ui);font-size:.78rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:.5rem 1rem;border:1px solid rgba(212,168,67,.3);background:transparent;color:rgba(254,248,240,.6);cursor:pointer;transition:all .3s;border-radius:2px}
	.event-tabs button.active{background:var(--oc-gold);color:var(--oc-deep);border-color:var(--oc-gold)}
	.event-tabs button:hover:not(.active){border-color:var(--oc-gold);color:var(--oc-ivory)}
	.event-stage{display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:1.5rem}
	.ev-arrow{width:40px;height:40px;border-radius:50%;border:1px solid var(--oc-line);background:rgba(255,255,255,.06);color:var(--oc-gold);font-size:1.4rem;cursor:pointer;transition:all .25s;display:grid;place-items:center;flex-shrink:0}
	.ev-arrow:hover{background:var(--oc-gold);color:var(--oc-deep)}
	.event-card{width:min(100%,420px);padding:clamp(1.5rem,4vw,2.5rem);border:1px solid var(--oc-line);background:rgba(26,14,46,.5);backdrop-filter:blur(12px);color:var(--oc-ivory);text-align:left;position:relative}
	.event-card::before{content:'';position:absolute;inset:.4rem;border:1px solid rgba(212,168,67,.15);pointer-events:none}
	.event-number{font-family:var(--font-serif);font-size:3rem;font-weight:700;color:rgba(212,168,67,.15);position:absolute;top:.5rem;right:1rem;line-height:1}
	.event-title{font-family:var(--font-serif);font-size:clamp(1.3rem,3vw,1.8rem);font-weight:700;margin:0 0 1rem}
	.event-detail-row{display:flex;gap:.65rem;align-items:flex-start;margin-bottom:.75rem}
	.event-icon{font-size:1.1rem;flex-shrink:0;margin-top:.1rem}
	.event-detail-row p{margin:0;font-size:.95rem;line-height:1.5}
	.event-venue{font-weight:600}
	.event-address{font-size:.88rem;opacity:.75;margin-top:.15rem}
	.event-notes{font-size:.9rem;opacity:.8;margin:0 0 1rem;font-style:italic}
	.event-dots{display:flex;justify-content:center;gap:.5rem}
	.event-dots span{width:8px;height:8px;border-radius:50%;background:rgba(212,168,67,.25);transition:all .3s}
	.event-dots span.active{background:var(--oc-gold);transform:scale(1.3)}

	/* ══ COUPLE ══ */
	.couple-section{position:relative;padding:clamp(3.5rem,10vw,7rem) clamp(1rem,4vw,2rem);text-align:center;background:linear-gradient(180deg,#0a3a3a,var(--oc-teal),#0a3a3a);color:var(--oc-ivory);overflow:hidden}
	.couple-bg-shapes{position:absolute;inset:0;pointer-events:none}
	.shape{position:absolute;border-radius:50%;opacity:.08;background:var(--oc-gold)}
	.s1{width:clamp(200px,50vw,500px);height:clamp(200px,50vw,500px);top:-15%;left:-10%}
	.s2{width:clamp(150px,40vw,400px);height:clamp(150px,40vw,400px);bottom:-10%;right:-8%}
	.couple-heading{font-family:var(--font-serif);font-size:clamp(2rem,6vw,3.2rem);font-weight:700;margin:0 0 2rem}
	.couple-photo-wrap{max-width:min(90%,400px);margin:0 auto 2rem;border-radius:50%;overflow:hidden;border:3px solid var(--oc-gold-s);box-shadow:0 16px 50px rgba(0,0,0,.3);aspect-ratio:1}
	.couple-photo{width:100%;height:100%;object-fit:cover}
	.couple-letter{max-width:38ch;margin:0 auto 1rem;font-size:1.05rem;line-height:1.7;opacity:.9}
	.couple-signoff{font-family:var(--font-script);font-size:1.3rem;color:var(--oc-gold);margin:0}

	/* ══ GALLERY ══ */
	.gallery-section{padding:clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem);background:linear-gradient(180deg,#0a3a3a,var(--oc-deep));text-align:center}
	.gallery-stage{display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:1.5rem}
	.gal-arrow{width:40px;height:40px;border-radius:50%;border:1px solid var(--oc-line);background:rgba(255,255,255,.06);color:var(--oc-gold);font-size:1.4rem;cursor:pointer;transition:all .25s;display:grid;place-items:center;flex-shrink:0}
	.gal-arrow:hover{background:var(--oc-gold);color:var(--oc-deep)}
	.gallery-frame{width:min(100%,500px);aspect-ratio:4/3;border-radius:8px;overflow:hidden;border:2px solid var(--oc-line);box-shadow:0 12px 40px rgba(0,0,0,.3)}
	.gallery-frame img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
	.gallery-dots{display:flex;justify-content:center;gap:.5rem;margin-bottom:1.5rem}
	.gallery-dots button{width:8px;height:8px;border-radius:50%;border:none;background:rgba(212,168,67,.25);cursor:pointer;padding:0;transition:all .3s}
	.gallery-dots button.active{background:var(--oc-gold);transform:scale(1.3)}
	.insta-link{margin-top:.5rem}

	/* ══ RSVP ══ */
	.rsvp-section{padding:clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem);background:linear-gradient(180deg,var(--oc-ivory),#f5ede0)}
	.rsvp-card{max-width:42rem;margin:0 auto;padding:clamp(2rem,5vw,3.5rem);text-align:center;border:1px solid var(--oc-line);background:rgba(255,253,248,.95);box-shadow:0 16px 60px rgba(26,14,46,.08);position:relative}
	.rsvp-card::before{content:'';position:absolute;inset:.5rem;border:1px solid rgba(212,168,67,.2);pointer-events:none}
	.rsvp-title{font-family:var(--font-serif);font-size:clamp(2rem,5vw,3rem);font-weight:700;margin:0 0 1rem;color:var(--oc-deep)}
	.rsvp-sub{font-size:1rem;color:var(--oc-ink-s);margin:0 0 1.5rem;max-width:34ch;margin-left:auto;margin-right:auto;line-height:1.6}
	.rsvp-actions{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
	.rsvp-actions .btn-outline{border-color:var(--oc-teal);color:var(--oc-teal)}
	.rsvp-actions .btn-outline:hover{background:rgba(13,79,79,.1)}
	.empty-note{color:var(--oc-ink-s);font-size:.9rem;font-style:italic}

	/* ══ KNOW ══ */
	.know-section{padding:clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem);background:linear-gradient(180deg,var(--oc-deep),#120a22);text-align:center}
	.know-lead{color:rgba(254,248,240,.7);font-size:1rem;margin:0 auto 2rem;max-width:36ch;line-height:1.6}
	.know-grid{display:grid;grid-template-columns:1fr;gap:1rem;max-width:48rem;margin:0 auto}
	@media(min-width:640px){.know-grid{grid-template-columns:repeat(2,1fr)}}
	.know-card{padding:1.5rem;border:1px solid rgba(212,168,67,.2);background:rgba(26,14,46,.5);backdrop-filter:blur(8px);text-align:left;color:var(--oc-ivory);transition:transform .4s,box-shadow .4s;position:relative}
	.know-card::before{content:'';position:absolute;top:0;left:1rem;right:1rem;height:2px;background:linear-gradient(90deg,var(--oc-gold),var(--oc-coral));opacity:.7}
	.know-card:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(0,0,0,.2)}
	.know-icon{font-size:1.5rem;margin-bottom:.5rem}
	.know-card h3{font-family:var(--font-serif);font-size:1.05rem;font-weight:700;margin:0 0 .4rem}
	.know-card p{font-size:.9rem;margin:0;opacity:.8;line-height:1.5}

	/* ══ COUNTDOWN ══ */
	.countdown-section{padding:clamp(3.5rem,10vw,7rem) clamp(1rem,4vw,2rem);background:linear-gradient(180deg,#120a22,var(--oc-deep),#0c0618);text-align:center;color:var(--oc-ivory)}
	.countdown-inner{max-width:48rem;margin:0 auto}
	.countdown-grid{display:flex;justify-content:center;align-items:center;gap:clamp(.5rem,2vw,1.5rem);margin:1.5rem 0 2rem}
	.cd-cell{display:flex;flex-direction:column;align-items:center;min-width:clamp(52px,12vw,80px)}
	.cd-num{font-family:var(--font-serif);font-size:clamp(2rem,7vw,3.5rem);font-weight:700;color:var(--oc-gold);line-height:1;text-shadow:0 2px 12px rgba(212,168,67,.3)}
	.cd-lbl{font-family:var(--font-ui);font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;opacity:.7;margin-top:.4rem}
	.cd-sep{font-family:var(--font-serif);font-size:clamp(1.5rem,5vw,2.5rem);color:rgba(212,168,67,.4);line-height:1}
	.cd-fallback{font-family:var(--font-serif);font-size:1.2rem;opacity:.7;margin:1.5rem 0}
	.cd-note{font-size:1rem;line-height:1.65;opacity:.8;max-width:36ch;margin:0 auto}

	/* ══ FOOTER ══ */
	.oce-footer{padding:clamp(3rem,8vw,5rem) 1.5rem 3rem;background:var(--oc-deep);text-align:center;color:var(--oc-ivory)}
	.footer-names{font-size:clamp(1.8rem,5vw,2.5rem);margin:0 0 .75rem;line-height:1.1}
	.footer-names .amp-sm{font-size:.5em;margin:0 .3rem}
	.footer-note{font-size:.95rem;opacity:.7;margin:0 0 1rem}
	.oce-footer a{color:var(--oc-gold);font-family:var(--font-ui);font-size:.82rem;letter-spacing:.15em;text-transform:uppercase;text-decoration:none}
	.oce-footer a:hover{text-decoration:underline}
</style>

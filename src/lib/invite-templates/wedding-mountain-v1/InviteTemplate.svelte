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
	let now = $state(0);
	let scrollY = $state(0);
	let scrollRaf = 0;

	function onScrollFrame() {
		if (scrollRaf) return;
		scrollRaf = requestAnimationFrame(() => {
			scrollY = window.scrollY;
			scrollRaf = 0;
		});
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		now = Date.now();
	});

	$effect(() => {
		if (typeof window === 'undefined' || preview || reduceMotion) return;
		window.addEventListener('scroll', onScrollFrame, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScrollFrame);
			if (scrollRaf) cancelAnimationFrame(scrollRaf);
			scrollRaf = 0;
		};
	});

	$effect(() => {
		if (typeof window === 'undefined' || !payload.countdownTargetISO?.trim() || reduceMotion) return;
		const id = window.setInterval(() => { now = Date.now(); }, 1000);
		return () => clearInterval(id);
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

	const heroParallax = $derived(preview || reduceMotion ? 0 : scrollY * 0.35);
	const cloudDrift1 = $derived(preview || reduceMotion ? 0 : scrollY * 0.08);
	const cloudDrift2 = $derived(preview || reduceMotion ? 0 : scrollY * -0.05);
</script>

<div class="mt" class:preview class:reduce={reduceMotion} data-template="wedding-mountain-v1">
	<BackgroundMusic src={musicBg} {preview} />

	<!-- ───── HERO ───── -->
	<section class="hero">
		<!-- Animated star field -->
		<div class="stars" aria-hidden="true">
			{#each Array(30) as _, i}
				<span
					class="star"
					style="top:{3 + Math.random()*40}%;left:{Math.random()*100}%;width:{1.5 + Math.random()*3}px;height:{1.5 + Math.random()*3}px;animation-delay:{Math.random()*4}s;animation-duration:{2 + Math.random()*3}s"
				></span>
			{/each}
		</div>

		<!-- Shooting star -->
		<div class="shooting-star" aria-hidden="true"></div>

		<!-- Floating golden particles -->
		<div class="particles" aria-hidden="true">
			{#each Array(15) as _, i}
				<span
					class="particle"
					style="left:{5+Math.random()*90}%;animation-delay:{Math.random()*8}s;animation-duration:{6+Math.random()*6}s;--drift:{-20+Math.random()*40}px"
				></span>
			{/each}
		</div>

		<!-- Crescent moon with glow -->
		<div class="moon" aria-hidden="true" style={`transform:translateY(${heroParallax * 0.3}px)`}>
			<div class="moon-glow"></div>
			<div class="moon-body"></div>
		</div>

		<!-- Drifting clouds -->
		<div class="cloud cloud-1" aria-hidden="true" style={`transform:translateX(${cloudDrift1}px)`}></div>
		<div class="cloud cloud-2" aria-hidden="true" style={`transform:translateX(${cloudDrift2}px)`}></div>
		<div class="cloud cloud-3" aria-hidden="true" style={`transform:translateX(${cloudDrift1 * 0.6}px)`}></div>

		<!-- Animated ornamental border top -->
		<div class="ornament-border ob-top" aria-hidden="true">
			<svg viewBox="0 0 400 60" xmlns="http://www.w3.org/2000/svg" fill="none">
				<defs>
					<linearGradient id="shimmer-t" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stop-color="#d4af37" stop-opacity="0.3">
							<animate attributeName="stop-opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite"/>
						</stop>
						<stop offset="30%" stop-color="#f5e6a3" stop-opacity="0.9">
							<animate attributeName="offset" values="0.1;0.5;0.9;0.5;0.1" dur="4s" repeatCount="indefinite"/>
						</stop>
						<stop offset="60%" stop-color="#d4af37" stop-opacity="0.5">
							<animate attributeName="stop-opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
						</stop>
						<stop offset="100%" stop-color="#c9982a" stop-opacity="0.3">
							<animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3.5s" repeatCount="indefinite"/>
						</stop>
					</linearGradient>
				</defs>
				<path d="M0,30 C40,10 80,50 120,30 C160,10 200,50 240,30 C280,10 320,50 360,30 L400,30" stroke="url(#shimmer-t)" stroke-width="1.5" fill="none"/>
				<path d="M0,30 C50,20 100,40 150,30 C200,20 250,40 300,30 C350,20 400,40 400,30" stroke="url(#shimmer-t)" stroke-width="0.8" fill="none" transform="translate(0, -8)"/>
				<path d="M0,30 C50,40 100,20 150,30 C200,40 250,20 300,30 C350,40 400,20 400,30" stroke="url(#shimmer-t)" stroke-width="0.8" fill="none" transform="translate(0, 8)"/>
				<!-- Center medallion -->
				<circle cx="200" cy="30" r="12" stroke="url(#shimmer-t)" stroke-width="1.5" fill="none">
					<animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite"/>
				</circle>
				<circle cx="200" cy="30" r="6" fill="#d4af37" opacity="0.4">
					<animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite"/>
				</circle>
				<!-- Side diamonds -->
				<polygon points="80,30 86,24 92,30 86,36" fill="#d4af37" opacity="0.5">
					<animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite"/>
				</polygon>
				<polygon points="308,30 314,24 320,30 314,36" fill="#d4af37" opacity="0.5">
					<animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
				</polygon>
			</svg>
		</div>

		<!-- Hero text -->
		<div class="hero-content" style={`transform:translateY(${heroParallax * 0.15}px)`}>
			<p class="kicker anim-t">Wedding celebration</p>
			<h1 class="couple-names gold-glow" class:single={!hasSplitNames}>
				{#if hasSplitNames}
					<span class="groom anim-t">{payload.groomFirstName?.trim() || '—'}</span>
					<span class="amp anim-t d1">weds</span>
					<span class="bride anim-t d2">{payload.brideFirstName?.trim() || '—'}</span>
				{:else}
					<span class="combined anim-t">{payload.coupleNames?.trim() || 'Names'}</span>
				{/if}
			</h1>
			{#if weddingWhen}
				<p class="hero-date anim-t d3">{weddingWhen}</p>
			{/if}
			{#if payload.openingMantra?.trim()}
				<p class="mantra shimmer-text-subtle anim-t d4">{payload.openingMantra}</p>
			{/if}
			{#if safeUrl(payload.rsvpUrl)}
				<a class="hero-cta anim-t d4" href="#rsvp-mountain">Scroll to RSVP</a>
			{/if}
		</div>

		<!-- Animated ornamental border bottom -->
		<div class="ornament-border ob-bottom" aria-hidden="true">
			<svg viewBox="0 0 400 60" xmlns="http://www.w3.org/2000/svg" fill="none">
				<defs>
					<linearGradient id="shimmer-b" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stop-color="#d4af37" stop-opacity="0.4"/>
						<stop offset="50%" stop-color="#f5e6a3" stop-opacity="0.9">
							<animate attributeName="offset" values="0.0;0.5;1.0;0.5;0.0" dur="5s" repeatCount="indefinite"/>
						</stop>
						<stop offset="100%" stop-color="#d4af37" stop-opacity="0.4"/>
					</linearGradient>
				</defs>
				<path d="M0,30 C50,45 100,15 150,30 C200,45 250,15 300,30 C350,45 400,15 400,30" stroke="url(#shimmer-b)" stroke-width="1.5" fill="none"/>
				<circle cx="200" cy="30" r="8" stroke="url(#shimmer-b)" stroke-width="1.5" fill="none">
					<animate attributeName="r" values="8;10;8" dur="2.5s" repeatCount="indefinite"/>
				</circle>
			</svg>
		</div>

		<!-- Mountain silhouettes with parallax -->
		<div class="mountains-wrap" aria-hidden="true">
			<svg class="mountains mtn-far" viewBox="0 0 1440 320" preserveAspectRatio="none" style={`transform:translateY(${heroParallax * -0.1}px)`}>
				<path d="M0,320 L0,200 C80,160 160,190 240,150 C320,110 380,70 480,100 C580,130 620,80 720,60 C820,40 860,90 960,80 C1060,70 1100,30 1200,60 C1300,90 1380,140 1440,120 L1440,320 Z" fill="#1a4d5c" opacity="0.35"/>
			</svg>
			<svg class="mountains mtn-mid" viewBox="0 0 1440 320" preserveAspectRatio="none" style={`transform:translateY(${heroParallax * -0.05}px)`}>
				<path d="M0,320 L0,230 C100,200 180,225 280,195 C380,165 420,135 520,155 C620,175 700,125 800,115 C900,105 940,145 1040,135 C1140,125 1220,165 1320,145 C1380,135 1420,175 1440,165 L1440,320 Z" fill="#163845" opacity="0.6"/>
			</svg>
			<svg class="mountains mtn-near" viewBox="0 0 1440 320" preserveAspectRatio="none">
				<path d="M0,320 L0,255 C120,235 200,265 320,245 C440,225 500,195 600,215 C700,235 780,205 880,195 C980,185 1060,225 1160,215 C1260,205 1340,245 1440,235 L1440,320 Z" fill="#122e3a" opacity="0.85"/>
			</svg>
		</div>
	</section>

	<!-- ───── HERO IMAGE ───── -->
	<section class="hero-image-band reveal-section" use:inView>
		<div class="hero-img-frame glow-ring">
			<img class="hero-img" src={getHeroImageSrc(payload)} alt="Couple" loading="eager" />
		</div>
		<p class="couple-line shimmer-text">{getDisplayCoupleLine(payload)}</p>
	</section>

	<!-- ───── BLESSINGS ───── -->
	<section class="band teal-band reveal-section" use:inView>
		<div class="damask-bg" aria-hidden="true"></div>
		<div class="inner narrow rel">
			<div class="om-symbol pulse-glow" aria-hidden="true">ॐ</div>
			<p class="section-label shimmer-text-subtle">Blessings</p>
			{#if payload.blessingIntro?.trim() || (payload.blessingLines?.length ?? 0) > 0}
				<p class="bless-intro">{payload.blessingIntro || 'With the heavenly blessings of'}</p>
				<ul class="bless-list">
					{#each payload.blessingLines ?? [] as line, i (i)}
						{#if line?.trim()}
							<li class="bless-li" style="--st: {i * 0.08}s">{line}</li>
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
			<!-- Animated divider -->
			<div class="animated-divider" aria-hidden="true">
				<span class="div-line"></span>
				<span class="div-diamond"></span>
				<span class="div-line"></span>
			</div>
		</div>
	</section>

	<!-- ───── INVITE TEXT ───── -->
	<section class="band mint-band reveal-section" use:inView>
		<div class="inner narrow invite-section">
			<p class="invite-label-big shimmer-text">Invite</p>
			<p class="invite-lead">
				{payload.inviteLead || 'You to join us in the wedding celebrations of'}
			</p>
			<h2 class="invite-couple">{getDisplayCoupleLine(payload)}</h2>
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
			{/if}
			<p class="sign">{payload.signOffLine || 'With love and blessings.'}</p>
		</div>
	</section>

	<!-- ───── EVENTS ───── -->
	{#if hasEventList}
		<section class="band teal-band events-band reveal-section" use:inView>
			<div class="damask-bg" aria-hidden="true"></div>
			<div class="inner rel">
				<p class="section-label shimmer-text-subtle">Celebrations</p>
				<h2 class="h2-gold">Our Events</h2>
				<div class="events-grid">
					{#each payload.events as ev, i (i)}
						{#if ev.title?.trim()}
							<div class="event-circle" style="--st: {i * 0.1}s">
								<div class="circle-frame glow-ring-sm">
									<div class="circle-inner">
										<h3>{ev.title}</h3>
										<p class="ev-when">{formatEventWhen(ev)}</p>
										<p class="ev-where">{ev.venueName || 'Venue'}</p>
										{#if ev.dressCode?.trim()}
											<p class="ev-dress">{ev.dressCode}</p>
										{/if}
									</div>
								</div>
								{#if ev.venueAddress?.trim()}
									<p class="ev-addr">{ev.venueAddress}</p>
								{/if}
								{#if safeUrl(ev.mapUrl)}
									<a class="route-btn" href={ev.mapUrl} target="_blank" rel="noopener noreferrer">
										See the route →
									</a>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- ───── RSVP ───── -->
	<section id="rsvp-mountain" class="band rsvp-band reveal-section" use:inView>
		<!-- Floating particles in RSVP -->
		<div class="particles particles-rsvp" aria-hidden="true">
			{#each Array(8) as _, i}
				<span
					class="particle particle-light"
					style="left:{10+Math.random()*80}%;animation-delay:{Math.random()*6}s;animation-duration:{5+Math.random()*5}s;--drift:{-15+Math.random()*30}px"
				></span>
			{/each}
		</div>
		<div class="inner narrow center rel">
			<h2 class="h2-light">Looking forward to see you</h2>
			<p class="rsvp-lead">Kindly let us know if you can make it.</p>
			{#if safeUrl(payload.rsvpUrl)}
				<a class="rsvp-circle-btn glow-ring" href={payload.rsvpUrl} target="_blank" rel="noopener noreferrer">
					<span class="rsvp-text shimmer-text">RSVP</span>
				</a>
			{:else}
				<p class="muted">RSVP link will appear here once added.</p>
			{/if}
		</div>
	</section>

	<!-- ───── THINGS TO KNOW ───── -->
	{#if hasKnow}
		<section class="band know-band reveal-section" use:inView>
			<div class="inner">
				<h2 class="h2-gold h2-center">Things to know</h2>
				<p class="know-sub">To help you feel at ease and enjoy every moment of the celebrations.</p>
				<div class="know-grid">
					{#if payload.thingsToKnow?.hashtag?.trim() || payload.hashtag?.trim()}
						<div class="know-card glow-card">
							<div class="know-icon">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
									<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
									<line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
								</svg>
							</div>
							<h3>Hashtag</h3>
							<p>{payload.thingsToKnow?.hashtag || payload.hashtag}</p>
						</div>
					{/if}
					{#if payload.thingsToKnow?.weather?.trim()}
						<div class="know-card glow-card">
							<div class="know-icon">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
									<circle cx="12" cy="12" r="4"/>
								</svg>
							</div>
							<h3>Weather</h3>
							<p>{payload.thingsToKnow.weather}</p>
						</div>
					{/if}
					{#if payload.thingsToKnow?.staff?.trim()}
						<div class="know-card glow-card">
							<div class="know-icon">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
									<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
								</svg>
							</div>
							<h3>Staff &amp; helpers</h3>
							<p>{payload.thingsToKnow.staff}</p>
						</div>
					{/if}
					{#if payload.thingsToKnow?.parking?.trim()}
						<div class="know-card glow-card">
							<div class="know-icon">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<rect x="3" y="3" width="18" height="18" rx="2"/>
									<path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
								</svg>
							</div>
							<h3>Parking</h3>
							<p>{payload.thingsToKnow.parking}</p>
						</div>
					{/if}
				</div>
				{#if payload.coordinatorNote?.trim()}
					<p class="coord">{payload.coordinatorNote}</p>
				{/if}
			</div>
		</section>
	{/if}

	<!-- ───── INSTAGRAM ───── -->
	{#if safeUrl(payload.instagramUrl)}
		<section class="band cream-band reveal-section" use:inView>
			<div class="inner narrow center insta-block">
				<h2 class="h2-teal">Follow the action</h2>
				<p class="insta-hint">Stay updated with stories, reels, and behind-the-scenes moments.</p>
				<a class="insta-circle glow-ring-sm" href={payload.instagramUrl} target="_blank" rel="noopener noreferrer">
					<span class="insta-icon" aria-hidden="true"></span>
					<span>Instagram</span>
				</a>
			</div>
		</section>
	{/if}

	<!-- ───── COUNTDOWN ───── -->
	{#if countdown}
		<section class="band countdown-band reveal-section" use:inView>
			<div class="damask-bg damask-light" aria-hidden="true"></div>
			<div class="inner narrow center rel">
				<h2 class="h2-teal">The countdown begins</h2>
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

	<!-- ───── GALLERY ───── -->
	{#if gallery.length}
		<section class="band gal-band reveal-section" use:inView>
			<div class="inner wide">
				<h2 class="h2-gold h2-center">{payload.galleryTitle || 'Our moments'}</h2>
				<div class="gal-grid">
					{#each gallery as src, i (src + i)}
						<button type="button" class="gal-tile" onclick={() => window.open(src, '_blank', 'noopener,noreferrer')}>
							<img src={src} alt="" loading="lazy" />
							<span class="gal-hint" aria-hidden="true">View</span>
						</button>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- ───── FOOTER ───── -->
	<footer class="foot">
		<div class="foot-mountains" aria-hidden="true">
			<svg viewBox="0 0 1440 100" preserveAspectRatio="none">
				<path d="M0,100 L0,55 C200,20 400,75 600,35 C800,-5 1000,55 1200,25 C1350,5 1420,45 1440,35 L1440,100 Z" fill="#1a4d5c" opacity="0.12"/>
			</svg>
		</div>
		<p class="foot-family">{payload.footerFamilyNote || payload.footerNote || 'With love and blessings.'}</p>
		{#if preview}
			<p class="pv">Preview</p>
		{/if}
	</footer>
</div>

<style>
	/* ══════════════════════════════════════ BASE ══════════════════════════════════════ */
	.mt {
		--teal: #1a4d5c;
		--teal-deep: #122e3a;
		--teal-dark: #0d2530;
		--gold-mt: #d4af37;
		--gold-light: #f5e6a3;
		--gold-dim: rgba(212, 175, 55, 0.35);
		--mint: #c8e6d0;
		--mint-deep: #a8d5ba;
		--cream-mt: #f4e8c1;
		--cream-soft: #faf3e4;
		--plum: #3d1848;
		font-family: var(--font-body);
		color: #f5f0ea;
		background: var(--teal-deep);
		position: relative;
		overflow-x: hidden;
	}

	.mt.preview { outline: 2px dashed var(--gold-mt); }
	.rel { position: relative; z-index: 1; }

	/* ══════════════════════════════════════ ANIMATIONS ══════════════════════════════════════ */
	.anim-t {
		opacity: 0;
		animation: fadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.d1 { animation-delay: 0.15s; }
	.d2 { animation-delay: 0.3s; }
	.d3 { animation-delay: 0.45s; }
	.d4 { animation-delay: 0.6s; }

	.reveal-section {
		opacity: 0;
		transform: translateY(50px);
		transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.mt :global(.reveal-section[data-in-view='true']) {
		opacity: 1;
		transform: translateY(0);
	}
	.reduce .reveal-section { opacity: 1; transform: none; transition: none; }
	.reduce .anim-t { opacity: 1; animation: none; }

	@keyframes fadeUp {
		from { opacity: 0; transform: translateY(28px); }
		to { opacity: 1; transform: none; }
	}

	/* ── Gold glow animation for couple names ── */
	.gold-glow {
		color: var(--gold-mt);
		animation: goldGlow 3s ease-in-out infinite;
	}
	@keyframes goldGlow {
		0%, 100% { text-shadow: 0 0 10px rgba(212,175,55,0.3), 0 0 30px rgba(212,175,55,0.1); }
		50% { text-shadow: 0 0 20px rgba(212,175,55,0.6), 0 0 50px rgba(245,230,163,0.3), 0 0 80px rgba(212,175,55,0.15); }
	}

	/* ── Shimmer on gold text (block-level elements only) ── */
	.shimmer-text {
		display: inline-block;
		background: linear-gradient(
			105deg,
			#c9982a 0%, #d4af37 20%, #f5e6a3 40%, #fff8dc 50%, #f5e6a3 60%, #d4af37 80%, #c9982a 100%
		);
		background-size: 250% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: shimmerSlide 4s ease-in-out infinite;
	}

	.shimmer-text-subtle {
		display: inline-block;
		background: linear-gradient(
			105deg,
			#d4af37 0%, #f5e6a3 40%, #d4af37 60%, #f5e6a3 100%
		);
		background-size: 200% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: shimmerSlide 5s ease-in-out infinite;
	}

	@keyframes shimmerSlide {
		0% { background-position: 100% 0; }
		50% { background-position: 0% 0; }
		100% { background-position: 100% 0; }
	}

	/* ── Glowing ring (borders that breathe) ── */
	.glow-ring {
		position: relative;
	}
	.glow-ring::after {
		content: '';
		position: absolute;
		inset: -4px;
		border-radius: inherit;
		border: 2px solid transparent;
		background: conic-gradient(from 0deg, #d4af37, #f5e6a3, #d4af37, #c9982a, #d4af37, #f5e6a3, #d4af37) border-box;
		-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
		mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		animation: spinGlow 6s linear infinite;
		opacity: 0.7;
	}

	.glow-ring-sm::after {
		content: '';
		position: absolute;
		inset: -3px;
		border-radius: inherit;
		border: 1.5px solid transparent;
		background: conic-gradient(from 0deg, #d4af37, #f5e6a3, #d4af37, #c9982a, #d4af37) border-box;
		-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
		mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		animation: spinGlow 8s linear infinite;
		opacity: 0.5;
	}

	@keyframes spinGlow {
		to { transform: rotate(360deg); }
	}

	/* ── Glow card (know cards hover shimmer) ── */
	.glow-card {
		position: relative;
		overflow: hidden;
	}
	.glow-card::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(212,175,55,0.08) 60deg, transparent 120deg);
		animation: rotateSheen 10s linear infinite;
		pointer-events: none;
	}
	@keyframes rotateSheen {
		to { transform: rotate(360deg); }
	}

	/* ── Pulse glow ── */
	.pulse-glow {
		animation: pulseG 3s ease-in-out infinite;
	}
	@keyframes pulseG {
		0%, 100% { text-shadow: 0 0 10px rgba(212,175,55,0.3), 0 0 30px rgba(212,175,55,0.1); filter: brightness(1); }
		50% { text-shadow: 0 0 20px rgba(212,175,55,0.6), 0 0 50px rgba(212,175,55,0.25); filter: brightness(1.15); }
	}

	/* ── Animated divider ── */
	.animated-divider {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin: 2rem 0 0;
	}
	.div-line {
		flex: 1;
		max-width: 120px;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--gold-mt), transparent);
		animation: divPulse 3s ease-in-out infinite;
	}
	.div-diamond {
		width: 8px; height: 8px;
		background: var(--gold-mt);
		transform: rotate(45deg);
		animation: diamondPulse 2s ease-in-out infinite;
	}
	@keyframes divPulse {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}
	@keyframes diamondPulse {
		0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.5; }
		50% { transform: rotate(45deg) scale(1.3); opacity: 1; }
	}

	/* ── Damask pattern overlay ── */
	.damask-bg {
		position: absolute;
		inset: 0;
		opacity: 0.04;
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L45 15 L37 22 L40 32 L30 26 L20 32 L23 22 L15 15 L25 15 Z' fill='%23d4af37' opacity='0.8'/%3E%3Ccircle cx='30' cy='50' r='4' fill='%23d4af37' opacity='0.5'/%3E%3Ccircle cx='5' cy='30' r='3' fill='%23d4af37' opacity='0.3'/%3E%3Ccircle cx='55' cy='30' r='3' fill='%23d4af37' opacity='0.3'/%3E%3C/svg%3E");
		background-size: 60px 60px;
		animation: driftPattern 30s linear infinite;
		pointer-events: none;
	}
	.damask-light { opacity: 0.03; }

	@keyframes driftPattern {
		from { background-position: 0 0; }
		to { background-position: 60px 60px; }
	}

	/* ══════════════════════════════════════ HERO ══════════════════════════════════════ */
	.hero {
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: radial-gradient(ellipse 110% 70% at 50% 20%, #1a4d5c 0%, #0d2530 60%, #091a22 100%);
		overflow: hidden;
		padding: 3rem 1.5rem 6rem;
	}

	/* Stars */
	.stars { position: absolute; inset: 0; pointer-events: none; }
	.star {
		position: absolute;
		background: #fff;
		border-radius: 50%;
		animation: twinkle var(--dur, 3s) ease-in-out infinite;
	}
	@keyframes twinkle {
		0%, 100% { opacity: 0.15; transform: scale(0.8); }
		50% { opacity: 1; transform: scale(1.2); }
	}

	/* Shooting star */
	.shooting-star {
		position: absolute;
		top: 15%;
		left: 10%;
		width: 80px;
		height: 1px;
		background: linear-gradient(90deg, rgba(255,255,255,0), #f5e6a3, rgba(255,255,255,0));
		transform: rotate(-35deg);
		animation: shoot 8s ease-in-out infinite;
		opacity: 0;
	}
	@keyframes shoot {
		0%, 90%, 100% { opacity: 0; transform: rotate(-35deg) translateX(0); }
		92% { opacity: 1; }
		95% { opacity: 0.8; transform: rotate(-35deg) translateX(350px); }
		96% { opacity: 0; }
	}

	/* Golden particles */
	.particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
	.particles-rsvp { z-index: 0; }
	.particle {
		position: absolute;
		bottom: -10%;
		width: 3px; height: 3px;
		background: var(--gold-mt);
		border-radius: 50%;
		animation: floatUp var(--dur, 8s) ease-in-out infinite;
		opacity: 0;
	}
	.particle-light {
		background: rgba(245, 230, 163, 0.6);
		width: 2px; height: 2px;
	}
	@keyframes floatUp {
		0% { opacity: 0; transform: translateY(0) translateX(0); }
		10% { opacity: 0.8; }
		90% { opacity: 0.6; }
		100% { opacity: 0; transform: translateY(-110vh) translateX(var(--drift, 0px)); }
	}

	/* Moon */
	.moon {
		position: absolute;
		top: 7%;
		right: 10%;
		width: 50px; height: 50px;
		will-change: transform;
	}
	.moon-glow {
		position: absolute;
		inset: -20px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%);
		animation: moonPulse 4s ease-in-out infinite;
	}
	.moon-body {
		width: 50px; height: 50px;
		border-radius: 50%;
		box-shadow: -10px 5px 0 0 var(--gold-mt);
	}
	@keyframes moonPulse {
		0%, 100% { transform: scale(1); opacity: 0.6; }
		50% { transform: scale(1.2); opacity: 1; }
	}

	/* Clouds */
	.cloud {
		position: absolute;
		border-radius: 50%;
		background: rgba(255,255,255,0.04);
		will-change: transform;
		animation: cloudFloat 20s ease-in-out infinite;
	}
	.cloud-1 { top: 18%; left: -5%; width: 200px; height: 60px; border-radius: 60px; animation-duration: 25s; }
	.cloud-2 { top: 30%; right: -8%; width: 180px; height: 50px; border-radius: 50px; animation-delay: 5s; animation-duration: 22s; }
	.cloud-3 { top: 12%; left: 40%; width: 120px; height: 35px; border-radius: 35px; animation-delay: 10s; animation-duration: 30s; opacity: 0.6; }

	@keyframes cloudFloat {
		0%, 100% { transform: translateX(0); }
		50% { transform: translateX(30px); }
	}

	/* Ornament borders */
	.ornament-border {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		width: min(90%, 400px);
		z-index: 2;
	}
	.ob-top { top: 1.5rem; }
	.ob-bottom { bottom: 28%; }
	.ornament-border svg { width: 100%; overflow: visible; }

	/* Hero content */
	.hero-content {
		position: relative;
		z-index: 3;
		text-align: center;
		padding: 0 1rem;
		will-change: transform;
	}

	.kicker {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.38em;
		text-transform: uppercase;
		color: var(--gold-mt);
		margin: 0 0 0.75rem;
	}

	.couple-names {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2.6rem, 8vw, 4.5rem);
		line-height: 1.05;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		gap: 0.3rem 0.75rem;
	}
	.couple-names.single { display: block; }

	.amp {
		font-weight: 400;
		font-style: italic;
		font-size: 0.45em;
		opacity: 0.85;
		color: var(--gold-light);
	}

	.hero-date {
		margin: 1.2rem 0 0;
		font-size: clamp(1rem, 2.4vw, 1.25rem);
		letter-spacing: 0.06em;
		color: var(--cream-soft);
		opacity: 0.9;
	}

	.mantra {
		margin: 0.75rem 0 0;
		font-size: clamp(0.9rem, 2vw, 1.1rem);
		letter-spacing: 0.14em;
	}

	.hero-cta {
		display: inline-flex;
		margin-top: 1.5rem;
		padding: 0.6rem 1.3rem;
		border-radius: 999px;
		border: 1px solid rgba(212,175,55,0.5);
		color: var(--gold-mt);
		text-decoration: none;
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		backdrop-filter: blur(8px);
		background: rgba(13,37,48,0.4);
		transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
	}
	.hero-cta:hover {
		transform: translateY(-3px);
		background: rgba(212,175,55,0.15);
		box-shadow: 0 8px 30px rgba(212,175,55,0.2);
	}

	/* Mountains */
	.mountains-wrap {
		position: absolute;
		bottom: 0; left: 0; right: 0;
		z-index: 1;
		pointer-events: none;
	}
	.mountains {
		display: block;
		width: 100%;
		height: auto;
		will-change: transform;
	}

	/* ══════════════════════════════════════ HERO IMAGE ══════════════════════════════════════ */
	.hero-image-band {
		background: linear-gradient(180deg, var(--teal-deep) 0%, var(--teal) 50%, var(--teal-deep) 100%);
		padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.hero-img-frame {
		width: min(85%, 400px);
		border-radius: 50%;
		aspect-ratio: 1;
		overflow: hidden;
		border: 4px solid var(--gold-mt);
		box-shadow: 0 0 0 8px rgba(212,175,55,0.12), 0 0 40px rgba(212,175,55,0.1), 0 20px 60px rgba(0,0,0,0.4);
	}

	.hero-img {
		width: 100%; height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.6s ease;
	}
	.hero-img-frame:hover .hero-img { transform: scale(1.05); }

	.couple-line {
		font-family: var(--font-display);
		font-size: clamp(1.4rem, 3.5vw, 2rem);
		text-align: center;
		margin: 0;
	}

	/* ══════════════════════════════════════ BANDS ══════════════════════════════════════ */
	.band { padding: clamp(3rem, 8vw, 5rem) clamp(1.25rem, 4vw, 2rem); position: relative; overflow: hidden; }
	.inner { max-width: 52rem; margin: 0 auto; }
	.inner.narrow { max-width: 38rem; }
	.inner.wide { max-width: 64rem; }
	.center { text-align: center; }

	.teal-band {
		background: linear-gradient(175deg, var(--teal) 0%, var(--teal-deep) 100%);
		color: #f0ebe4;
	}
	.mint-band {
		background: linear-gradient(180deg, var(--mint) 0%, #b8dfc4 50%, var(--mint-deep) 100%);
		color: #1a2a20;
	}
	.rsvp-band {
		background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(61,24,72,0.92), rgba(42,16,52,0.98)),
			linear-gradient(180deg, #2a1034, #1a0822);
		color: #f0e8f4;
	}
	.know-band {
		background: linear-gradient(180deg, #3a1a48, #2a1034);
		color: #f0e8f4;
	}
	.cream-band {
		background: linear-gradient(180deg, var(--cream-mt), var(--cream-soft));
		color: #2a1a10;
	}
	.countdown-band {
		background: linear-gradient(180deg, var(--cream-mt), #f0e0a8 40%, var(--cream-soft));
		color: #2a1a10;
		position: relative; overflow: hidden;
	}
	.gal-band {
		background: linear-gradient(180deg, var(--teal) 0%, var(--teal-deep) 100%);
		padding-bottom: clamp(3rem, 8vw, 5rem);
	}

	/* ══════════════════════════════════════ OM / SECTION LABELS ══════════════════════════════════════ */
	.om-symbol {
		font-size: 2.5rem;
		text-align: center;
		color: var(--gold-mt);
		margin: 0 0 0.75rem;
		line-height: 1;
	}
	.section-label {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		text-align: center;
		margin: 0 0 0.65rem;
	}
	.bless-intro {
		text-align: center;
		font-style: italic;
		margin: 0 0 0.75rem;
		opacity: 0.9;
		font-size: 1.1rem;
	}
	.bless-list {
		list-style: none;
		margin: 0; padding: 0;
		text-align: center;
		font-size: clamp(1rem, 2.2vw, 1.15rem);
		line-height: 1.85;
	}
	.bless-li {
		opacity: 0;
		transform: translateY(12px);
		animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: var(--st, 0s);
	}

	/* ══════════════════════════════════════ INVITE ══════════════════════════════════════ */
	.invite-section { text-align: center; }
	.invite-label-big {
		font-family: var(--font-display);
		font-size: clamp(3rem, 8vw, 5rem);
		font-weight: 700;
		margin: 0 0 0.5rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.invite-lead {
		font-size: clamp(1.05rem, 2.2vw, 1.2rem);
		line-height: 1.7;
		margin: 0 0 0.75rem;
	}
	.invite-couple {
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		color: var(--teal);
		margin: 0 0 1.25rem;
	}
	.lineage { font-size: 1rem; line-height: 1.65; margin: 0 0 0.5rem; }
	.letter p { margin: 0 0 1rem; line-height: 1.8; font-size: 1.02rem; opacity: 0.9; }
	.sign {
		margin: 1.5rem 0 0;
		font-weight: 600;
		font-family: var(--font-display);
		font-size: 1.08rem;
		color: var(--teal);
	}

	/* ══════════════════════════════════════ HEADINGS ══════════════════════════════════════ */
	.h2-gold {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3.2vw, 2.1rem);
		color: var(--gold-mt);
		margin: 0 0 1rem;
	}
	.h2-center { text-align: center; }
	.h2-light {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3.2vw, 2.1rem);
		color: #f0e8f4;
		margin: 0 0 0.75rem;
		text-align: center;
	}
	.h2-teal {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3.2vw, 2.1rem);
		color: var(--teal);
		margin: 0 0 1rem;
		text-align: center;
	}

	/* ══════════════════════════════════════ EVENTS ══════════════════════════════════════ */
	.events-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
		gap: 2.5rem 1.5rem;
		margin-top: 1.5rem;
	}
	.event-circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		opacity: 0;
		transform: translateY(20px);
		animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: var(--st, 0s);
	}
	.circle-frame {
		width: min(220px, 80vw);
		aspect-ratio: 1;
		border-radius: 50%;
		border: 3px solid var(--gold-mt);
		box-shadow: 0 0 0 6px rgba(212,175,55,0.1), 0 0 30px rgba(212,175,55,0.08), 0 12px 40px rgba(0,0,0,0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle at 50% 40%, rgba(26,77,92,0.95), rgba(13,37,48,0.98));
		padding: 1.25rem;
		position: relative;
		transition: transform 0.4s ease, box-shadow 0.4s ease;
	}
	.circle-frame:hover {
		transform: scale(1.06);
		box-shadow: 0 0 0 6px rgba(212,175,55,0.2), 0 0 40px rgba(212,175,55,0.15), 0 18px 50px rgba(0,0,0,0.4);
	}
	.circle-inner h3 {
		font-family: var(--font-display);
		font-size: 1.15rem;
		color: var(--gold-mt);
		margin: 0 0 0.4rem;
	}
	.ev-when { font-size: 0.85rem; margin: 0 0 0.25rem; opacity: 0.85; color: var(--cream-soft); }
	.ev-where { font-size: 0.82rem; margin: 0; opacity: 0.75; color: var(--mint); }
	.ev-dress { font-size: 0.78rem; margin: 0.3rem 0 0; opacity: 0.65; font-style: italic; }
	.ev-addr { margin: 0.65rem 0 0; font-size: 0.85rem; opacity: 0.7; }
	.route-btn {
		display: inline-flex;
		margin-top: 0.5rem;
		padding: 0.38rem 0.95rem;
		border-radius: 999px;
		background: rgba(212,175,55,0.12);
		color: var(--gold-mt);
		font-weight: 600;
		font-size: 0.82rem;
		text-decoration: none;
		border: 1px solid rgba(212,175,55,0.3);
		font-family: var(--font-ui);
		transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
	}
	.route-btn:hover {
		background: rgba(212,175,55,0.25);
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(212,175,55,0.2);
	}

	/* ══════════════════════════════════════ RSVP ══════════════════════════════════════ */
	.rsvp-lead { margin: 0 0 1.5rem; opacity: 0.85; font-size: 1.02rem; text-align: center; }
	.rsvp-circle-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 130px; height: 130px;
		border-radius: 50%;
		border: 3px solid var(--gold-mt);
		background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%);
		text-decoration: none;
		transition: transform 0.35s ease, box-shadow 0.35s ease;
		box-shadow: 0 0 0 6px rgba(212,175,55,0.06), 0 0 30px rgba(212,175,55,0.08);
	}
	.rsvp-circle-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 0 0 8px rgba(212,175,55,0.15), 0 0 50px rgba(212,175,55,0.15), 0 12px 40px rgba(0,0,0,0.3);
	}
	.rsvp-text {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.15rem;
		letter-spacing: 0.15em;
	}
	.muted { opacity: 0.6; margin: 0; text-align: center; }

	/* ══════════════════════════════════════ THINGS TO KNOW ══════════════════════════════════════ */
	.know-sub {
		text-align: center;
		max-width: 44ch;
		margin: -0.25rem auto 1.75rem;
		font-size: 0.96rem;
		line-height: 1.55;
		opacity: 0.78;
	}
	.know-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
	}
	@media (min-width: 640px) {
		.know-grid { grid-template-columns: repeat(2, 1fr); }
	}
	.know-card {
		padding: 1.5rem 1.25rem;
		border-radius: 16px;
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(212,175,55,0.2);
		text-align: center;
		transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
	}
	.know-card:hover {
		border-color: rgba(212,175,55,0.5);
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(212,175,55,0.08);
	}
	.know-icon { width: 36px; height: 36px; margin: 0 auto 0.75rem; color: var(--gold-mt); }
	.know-card h3 {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold-mt);
		margin: 0 0 0.5rem;
	}
	.know-card p { margin: 0; font-size: 0.95rem; line-height: 1.55; opacity: 0.85; }
	.coord { margin: 1.75rem 0 0; text-align: center; font-size: 0.95rem; opacity: 0.78; line-height: 1.55; }

	/* ══════════════════════════════════════ INSTAGRAM ══════════════════════════════════════ */
	.insta-block { padding: 0.5rem 0; }
	.insta-hint { margin: -0.25rem 0 1.25rem; opacity: 0.75; line-height: 1.55; }
	.insta-circle {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem;
		border-radius: 50%;
		width: 120px; height: 120px;
		justify-content: center;
		border: 2px solid var(--gold-mt);
		background: rgba(26,77,92,0.08);
		text-decoration: none;
		color: var(--teal);
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 600;
		position: relative;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}
	.insta-circle:hover {
		transform: scale(1.08);
		box-shadow: 0 8px 30px rgba(26,77,92,0.2);
	}
	.insta-icon {
		width: 28px; height: 28px;
		border-radius: 8px;
		background: linear-gradient(145deg, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285aeb 100%);
	}

	/* ══════════════════════════════════════ COUNTDOWN ══════════════════════════════════════ */
	.count-static { font-size: 1.1rem; margin: 0; opacity: 0.85; }
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
		min-width: 4.5rem;
		padding: 0.75rem 0.65rem;
		border-radius: 14px;
		background: rgba(26,77,92,0.1);
		border: 1px solid rgba(212,175,55,0.2);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}
	.digit-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(26,77,92,0.12); }
	.digits strong {
		font-size: clamp(2rem, 5vw, 3rem);
		font-family: var(--font-display);
		line-height: 1;
		color: var(--teal);
	}
	.digits small {
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		opacity: 0.6;
		margin-top: 0.35rem;
	}

	/* ══════════════════════════════════════ GALLERY ══════════════════════════════════════ */
	.gal-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
		gap: 1rem;
		padding: 0.5rem 0;
	}
	.gal-tile {
		position: relative;
		border: none;
		padding: 0;
		border-radius: 14px;
		overflow: hidden;
		cursor: pointer;
		background: var(--teal-dark);
		aspect-ratio: 4 / 5;
		border: 2px solid rgba(212,175,55,0.2);
		transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.3s ease;
	}
	.gal-tile:hover, .gal-tile:focus-visible {
		transform: scale(1.04);
		box-shadow: 0 16px 48px rgba(0,0,0,0.4);
		border-color: var(--gold-mt);
		outline: none;
	}
	.gal-tile img {
		width: 100%; height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.6s ease;
	}
	.gal-tile:hover img { transform: scale(1.08); }
	.gal-hint {
		position: absolute;
		bottom: 0.6rem; right: 0.6rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		background: rgba(0,0,0,0.55);
		color: var(--gold-mt);
		backdrop-filter: blur(6px);
		opacity: 0;
		transition: opacity 0.25s ease;
	}
	.gal-tile:hover .gal-hint, .gal-tile:focus-visible .gal-hint { opacity: 1; }

	/* ══════════════════════════════════════ FOOTER ══════════════════════════════════════ */
	.foot {
		position: relative;
		padding: 3rem 1.5rem 2.5rem;
		text-align: center;
		background: var(--cream-soft);
		color: #3a2a1a;
		overflow: hidden;
	}
	.foot-mountains {
		position: absolute;
		top: 0; left: 0; right: 0;
		pointer-events: none;
	}
	.foot-mountains svg { display: block; width: 100%; }
	.foot-family { position: relative; font-size: 0.98rem; margin: 0; line-height: 1.6; }
	.pv { margin-top: 0.5rem; font-size: 0.75rem; color: var(--teal); }

	/* ══════════════════════════════════════ REDUCED MOTION ══════════════════════════════════════ */
	@media (prefers-reduced-motion: reduce) {
		.star, .shooting-star, .particle, .cloud, .moon-glow { animation: none !important; }
		.star { opacity: 0.5; }
		.shooting-star { display: none; }
		.particle { display: none; }
		.shimmer-text, .shimmer-text-subtle { animation: none !important; background: none !important; -webkit-text-fill-color: var(--gold-mt); color: var(--gold-mt); }
		.gold-glow { animation: none !important; text-shadow: none !important; }
		.glow-ring::after, .glow-ring-sm::after { animation: none !important; }
		.glow-card::before { animation: none !important; }
		.pulse-glow { animation: none !important; }
		.damask-bg { animation: none !important; }
		.animated-divider .div-line, .animated-divider .div-diamond { animation: none !important; opacity: 0.6; }
		.anim-t { opacity: 1 !important; animation: none !important; transform: none !important; }
		.bless-li, .event-circle { opacity: 1 !important; animation: none !important; transform: none !important; }
		.reveal-section { opacity: 1 !important; transform: none !important; transition: none !important; }
		.circle-frame:hover, .gal-tile:hover, .rsvp-circle-btn:hover, .digit-card:hover, .know-card:hover, .insta-circle:hover { transform: none; }
		.gal-tile img, .hero-img { transition: none; }
	}
</style>

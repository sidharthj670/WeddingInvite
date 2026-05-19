/** Unified invite JSON — shared across all templates */

export type ThingsToKnow = {
	hashtag: string;
	weather: string;
	staff: string;
	parking: string;
};

export type WeddingEvent = {
	title: string;
	dateTime: string;
	/** ISO date YYYY-MM-DD for calendar UX */
	eventDateISO: string;
	/** `datetime-local` value when set */
	eventDateTimeLocal: string;
	venueName: string;
	venueAddress: string;
	mapUrl: string;
	dressCode: string;
	notes: string;
};

export type WeddingPayload = {
	coupleNames: string;
	groomFirstName: string;
	brideFirstName: string;
	weddingDate: string;
	/** Primary calendar value for wedding day */
	weddingDateISO: string;
	weddingTimezone: string;
	tagline: string;
	heroImageUrl: string;
	/** Uploaded file URL path e.g. /api/files/slug/file.ext — takes precedence over heroImageUrl when set */
	heroImagePath: string;
	openingQuote: string;
	openingAttribution: string;
	openingMantra: string;
	blessingIntro: string;
	blessingLines: string[];
	inviteLead: string;
	brideLineage: string;
	groomLineage: string;
	personalLetter: string;
	signOffLine: string;
	thingsToKnow: ThingsToKnow;
	countdownTargetISO: string;
	footerFamilyNote: string;
	brideParents: string;
	groomParents: string;
	brideFamilyNote: string;
	groomFamilyNote: string;
	events: WeddingEvent[];
	galleryTitle: string;
	galleryImageUrls: string[];
	/** Direct upload path for background music */
	musicPath: string;
	musicUrl: string;
	rsvpUrl: string;
	instagramUrl: string;
	hashtag: string;
	coordinatorNote: string;
	contactPhone: string;
	footerNote: string;
};

export const WEDDING_CLASSIC_ID = 'wedding-classic-v1' as const;
export const WEDDING_SCROLL_V2_ID = 'wedding-scroll-v2' as const;
export const WEDDING_CITY_LUXE_ID = 'wedding-city-luxe-v1' as const;
export const WEDDING_OCEANIC_ID = 'wedding-oceanic-v1' as const;
export const WEDDING_MOUNTAIN_ID = 'wedding-mountain-v1' as const;

export const TEMPLATE_IDS = [
	WEDDING_CLASSIC_ID,
	WEDDING_SCROLL_V2_ID,
	WEDDING_CITY_LUXE_ID,
	WEDDING_OCEANIC_ID,
	WEDDING_MOUNTAIN_ID
] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export function isValidTemplateId(id: string | null | undefined): id is TemplateId {
	return !!id && (TEMPLATE_IDS as readonly string[]).includes(id);
}

export function defaultThingsToKnow(): ThingsToKnow {
	return { hashtag: '', weather: '', staff: '', parking: '' };
}

export function emptyEvent(): WeddingEvent {
	return {
		title: '',
		dateTime: '',
		eventDateISO: '',
		eventDateTimeLocal: '',
		venueName: '',
		venueAddress: '',
		mapUrl: '',
		dressCode: '',
		notes: ''
	};
}

export function defaultWeddingPayload(): WeddingPayload {
	return {
		coupleNames: '',
		groomFirstName: '',
		brideFirstName: '',
		weddingDate: '',
		weddingDateISO: '',
		weddingTimezone: 'Asia/Kolkata',
		tagline: '',
		heroImageUrl:
			'https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&q=80&w=1600',
		heroImagePath: '',
		openingQuote: '',
		openingAttribution: '',
		openingMantra: '',
		blessingIntro: '',
		blessingLines: [],
		inviteLead: '',
		brideLineage: '',
		groomLineage: '',
		personalLetter: '',
		signOffLine: '',
		thingsToKnow: defaultThingsToKnow(),
		countdownTargetISO: '',
		footerFamilyNote: '',
		brideParents: '',
		groomParents: '',
		brideFamilyNote: '',
		groomFamilyNote: '',
		events: [emptyEvent()],
		galleryTitle: 'Moments before the day',
		galleryImageUrls: [],
		musicPath: '',
		musicUrl: '',
		rsvpUrl: '',
		instagramUrl: '',
		hashtag: '',
		coordinatorNote: '',
		contactPhone: '',
		footerNote: ''
	};
}

function formatLongDate(iso: string): string {
	try {
		const [y, m, d] = iso.split('-').map(Number);
		if (!y || !m || !d) return iso;
		const dt = new Date(Date.UTC(y, m - 1, d));
		return new Intl.DateTimeFormat('en-IN', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(dt);
	} catch {
		return iso;
	}
}

function normalizePayload(p: WeddingPayload): WeddingPayload {
	const groom = p.groomFirstName?.trim() ?? '';
	const bride = p.brideFirstName?.trim() ?? '';
	let coupleNames = p.coupleNames?.trim() ?? '';
	if (!coupleNames && groom && bride) {
		coupleNames = `${groom} & ${bride}`;
	}
	let weddingDate = p.weddingDate?.trim() ?? '';
	const iso = p.weddingDateISO?.trim() ?? '';
	if (!weddingDate && iso) {
		weddingDate = formatLongDate(iso);
	}
	const blessingLines = Array.isArray(p.blessingLines)
		? p.blessingLines.map((s) => String(s))
		: [];
	const thingsToKnow = {
		...defaultThingsToKnow(),
		...(typeof p.thingsToKnow === 'object' && p.thingsToKnow ? p.thingsToKnow : {})
	};
	return {
		...p,
		coupleNames,
		weddingDate,
		blessingLines,
		thingsToKnow
	};
}

export function getSlugSeed(p: WeddingPayload): string {
	const n = p.coupleNames?.trim();
	if (n) return n;
	const g = p.groomFirstName?.trim();
	const b = p.brideFirstName?.trim();
	if (g && b) return `${g}-${b}`;
	if (g || b) return g || b || 'invite';
	return 'invite';
}

/** Hero image for <img src> — relative paths work for same-origin /api/files */
export function getHeroImageSrc(p: WeddingPayload): string {
	const path = p.heroImagePath?.trim();
	if (path) return path;
	const url = p.heroImageUrl?.trim();
	if (url) return url;
	return 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80';
}

/** Absolute URL for Open Graph (needs origin for relative paths) */
export function getHeroImageAbsolute(p: WeddingPayload, origin: string): string {
	const base = origin.replace(/\/$/, '');
	const src = getHeroImageSrc(p);
	if (src.startsWith('http://') || src.startsWith('https://')) return src;
	return `${base}${src.startsWith('/') ? src : `/${src}`}`;
}

export function getDisplayCoupleLine(p: WeddingPayload): string {
	if (p.coupleNames?.trim()) return p.coupleNames.trim();
	const g = p.groomFirstName?.trim();
	const b = p.brideFirstName?.trim();
	if (g && b) return `${g} & ${b}`;
	return g || b || 'Names go here';
}

export function getMusicSrc(p: WeddingPayload): string | null {
	const path = p.musicPath?.trim();
	if (path) return path;
	const url = p.musicUrl?.trim();
	if (url) return url;
	return null;
}

/** Safe `src` for `<audio>`: relative paths or http(s) URLs only. */
export function getMusicPlaybackSrc(p: WeddingPayload): string | null {
	const raw = getMusicSrc(p);
	if (!raw?.trim()) return null;
	const t = raw.trim();
	if (t.startsWith('/')) return t;
	try {
		const x = new URL(t);
		return x.protocol === 'http:' || x.protocol === 'https:' ? x.href : null;
	} catch {
		return null;
	}
}

export function formatEventWhen(ev: WeddingEvent): string {
	if (ev.eventDateTimeLocal?.trim()) {
		try {
			const d = new Date(ev.eventDateTimeLocal);
			if (!Number.isNaN(d.getTime())) {
				return new Intl.DateTimeFormat('en-IN', {
					dateStyle: 'full',
					timeStyle: 'short'
				}).format(d);
			}
		} catch {
			/* fall through */
		}
	}
	if (ev.eventDateISO?.trim()) {
		return formatLongDate(ev.eventDateISO) + (ev.dateTime?.trim() ? ` · ${ev.dateTime.trim()}` : '');
	}
	return ev.dateTime?.trim() || 'Date & time';
}

export function hydratePayload(data: unknown): WeddingPayload {
	if (!data || typeof data !== 'object') return defaultWeddingPayload();
	return normalizePayload(mergePayload(defaultWeddingPayload(), data as Partial<WeddingPayload>));
}

export function parsePayload(json: string): WeddingPayload {
	const data = JSON.parse(json) as unknown;
	if (!data || typeof data !== 'object') return defaultWeddingPayload();
	return normalizePayload(mergePayload(defaultWeddingPayload(), data as Partial<WeddingPayload>));
}

function mergePayload(base: WeddingPayload, patch: Partial<WeddingPayload>): WeddingPayload {
	const events =
		Array.isArray(patch.events) && patch.events.length > 0
			? patch.events.map((e) => ({ ...emptyEvent(), ...e }))
			: base.events;
	const things =
		patch.thingsToKnow && typeof patch.thingsToKnow === 'object'
			? { ...defaultThingsToKnow(), ...patch.thingsToKnow }
			: base.thingsToKnow;
	const blessingLines = Array.isArray(patch.blessingLines) ? patch.blessingLines.map(String) : base.blessingLines;
	return {
		...base,
		...patch,
		events,
		thingsToKnow: things,
		blessingLines
	};
}

export type PublishValidation = { ok: true } | { ok: false; errors: string[] };

export function validateForPublish(
	p: WeddingPayload,
	templateId: string = WEDDING_CLASSIC_ID
): PublishValidation {
	const errors: string[] = [];
	const groom = p.groomFirstName?.trim();
	const bride = p.brideFirstName?.trim();
	const couple = p.coupleNames?.trim();
	const hasNames = (groom && bride) || !!couple;
	if (!hasNames) {
		errors.push('Enter groom and bride names, or a combined title in “Couple title”.');
	}
	if (groom && !bride && !couple) errors.push('Bride name is required (or use a combined title).');
	if (bride && !groom && !couple) errors.push('Groom name is required (or use a combined title).');
	const hasDate = !!(p.weddingDateISO?.trim() || p.weddingDate?.trim());
	if (!hasDate) errors.push('Wedding date is required.');
	if (!p.rsvpUrl?.trim()) errors.push('RSVP link is required.');

	if (templateId === WEDDING_SCROLL_V2_ID || templateId === WEDDING_OCEANIC_ID) {
		if (errors.length) return { ok: false, errors };
		return { ok: true };
	}

	// Event-rich templates
	if (!p.events?.length) errors.push('Add at least one event.');
	for (let i = 0; i < (p.events?.length ?? 0); i++) {
		const e = p.events[i];
		if (!e.title?.trim()) errors.push(`Event ${i + 1}: title is required.`);
		const evWhen =
			e.eventDateTimeLocal?.trim() || e.eventDateISO?.trim() || e.dateTime?.trim();
		if (!evWhen) errors.push(`Event ${i + 1}: date & time is required.`);
		if (!e.venueName?.trim()) errors.push(`Event ${i + 1}: venue is required.`);
	}
	if (errors.length) return { ok: false, errors };
	return { ok: true };
}

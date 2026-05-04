<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getInviteTemplateComponent, INVITE_TEMPLATE_LIST } from '$lib/invite-templates';
	import { rememberDraft } from '$lib/drafts-storage';
	import {
		defaultWeddingPayload,
		emptyEvent,
		hydratePayload,
		getDisplayCoupleLine,
		WEDDING_CLASSIC_ID,
		isValidTemplateId,
		type WeddingPayload,
		type WeddingEvent,
		type TemplateId
	} from '$lib/payload';

	let { data } = $props();

	/** Reactive slug/token — `page.url` updates on client navigation before `data` in edge cases */
	const editSlug = $derived((page.url.searchParams.get('edit') ?? data.edit ?? '').trim());
	const editToken = $derived((page.url.searchParams.get('token') ?? data.token ?? '').trim());
	const canUpload = $derived(!!editSlug && !!editToken);

	let payload = $state<WeddingPayload>(defaultWeddingPayload());
	let selectedTemplateId = $state<TemplateId>(WEDDING_CLASSIC_ID);
	let step = $state(0);
	let loading = $state(false);

	$effect(() => {
		if (!editSlug && !editToken) {
			selectedTemplateId = data.initialTemplate;
		}
	});
	let loadError = $state('');
	let saving = $state(false);
	let publishError = $state('');
	let shareUrl = $state('');
	let galleryUrlsText = $state('');
	let blessingLinesText = $state('');
	let uploadBusy = $state(false);

	const steps = [
		{ id: 'hero', title: 'Hero & date' },
		{ id: 'quote', title: 'Opening & story' },
		{ id: 'families', title: 'Families' },
		{ id: 'events', title: 'Events' },
		{ id: 'gallery', title: 'Gallery' },
		{ id: 'join', title: 'Join & links' }
	];

	const PreviewCmp = $derived(getInviteTemplateComponent(selectedTemplateId));

	let lastFetchKey = '';

	function syncSecondaryFields() {
		galleryUrlsText = (payload.galleryImageUrls ?? []).join('\n');
		blessingLinesText = (payload.blessingLines ?? []).join('\n');
	}

	function preparePayloadForSave(): WeddingPayload {
		const gal = galleryFromText(galleryUrlsText);
		const blessings = blessingLinesText
			.split(/\r?\n/)
			.map((s) => s.trim())
			.filter(Boolean);
		return hydratePayload({
			...payload,
			galleryImageUrls: gal,
			blessingLines: blessings
		});
	}

	function patchThings(patch: Partial<WeddingPayload['thingsToKnow']>) {
		payload = { ...payload, thingsToKnow: { ...payload.thingsToKnow, ...patch } };
	}

	afterNavigate(({ to }) => {
		const edit = to?.url.searchParams.get('edit') ?? '';
		const token = to?.url.searchParams.get('token') ?? '';
		if (!edit || !token) {
			lastFetchKey = '';
			const q = to?.url.searchParams.get('template');
			selectedTemplateId = isValidTemplateId(q) ? q : WEDDING_CLASSIC_ID;
			return;
		}
		const key = `${edit}:${token}`;
		if (key === lastFetchKey) return;
		lastFetchKey = key;
		loading = true;
		loadError = '';
		fetch(`/api/invites/${encodeURIComponent(edit)}?token=${encodeURIComponent(token)}`)
			.then(async (r) => {
				const j = await r.json().catch(() => ({}));
				if (!r.ok) throw new Error((j as { message?: string }).message || 'Could not load invite.');
				return j as {
					payload?: WeddingPayload;
					slug?: string;
					templateId?: string;
					published?: boolean;
				};
			})
			.then((j) => {
				payload = hydratePayload(j.payload);
				if (isValidTemplateId(j.templateId)) {
					selectedTemplateId = j.templateId;
				}
				syncSecondaryFields();
				if (typeof window !== 'undefined' && j.slug) {
					shareUrl = `${window.location.origin}/i/${j.slug}`;
					const p = hydratePayload(j.payload);
					rememberDraft({
						slug: j.slug,
						editToken: token,
						templateId: isValidTemplateId(j.templateId) ? j.templateId : selectedTemplateId,
						label: getDisplayCoupleLine(p),
						published: !!j.published
					});
				}
			})
			.catch((e) => {
				loadError = e instanceof Error ? e.message : 'Load failed';
			})
			.finally(() => {
				loading = false;
			});
	});

	function addEvent() {
		payload = { ...payload, events: [...payload.events, emptyEvent()] };
	}

	function removeEvent(i: number) {
		const next = payload.events.filter((_, j) => j !== i);
		payload = { ...payload, events: next.length ? next : [emptyEvent()] };
	}

	function updateEvent(i: number, patch: Partial<WeddingEvent>) {
		const events = payload.events.map((e, j) => (j === i ? { ...e, ...patch } : e));
		payload = { ...payload, events };
	}

	function galleryFromText(t: string): string[] {
		return t
			.split(/\r?\n/)
			.map((s) => s.trim())
			.filter(Boolean)
			.slice(0, 12);
	}

	function buildCreateSessionUrl(slug: string, token: string): string {
		const sp = new URLSearchParams();
		sp.set('edit', slug);
		sp.set('token', token);
		if (isValidTemplateId(selectedTemplateId)) {
			sp.set('template', selectedTemplateId);
		}
		return `/create/edit?${sp.toString()}`;
	}

	async function uploadToInvite(kind: 'hero' | 'gallery' | 'music', file: File): Promise<string | null> {
		if (!editSlug || !editToken) {
			publishError =
				'Your edit link is not ready yet — wait for the draft to finish saving, or tap “Save draft”.';
			return null;
		}
		uploadBusy = true;
		publishError = '';
		try {
			const fd = new FormData();
			fd.set('file', file);
			fd.set('kind', kind);
			const r = await fetch(`/api/invites/${encodeURIComponent(editSlug)}/upload`, {
				method: 'POST',
				headers: { 'X-Edit-Token': editToken },
				body: fd
			});
			const j = await r.json().catch(() => ({}));
			if (!r.ok) {
				publishError = (j as { message?: string }).message || 'Upload failed';
				return null;
			}
			return (j as { url?: string }).url ?? null;
		} finally {
			uploadBusy = false;
		}
	}

	async function onHeroFile(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		const f = el.files?.[0] ?? null;
		el.value = '';
		if (!f) return;
		const url = await uploadToInvite('hero', f);
		if (url) payload = { ...payload, heroImagePath: url };
	}

	async function onGalleryFiles(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		// Snapshot before clearing value — clearing can empty the FileList in some browsers.
		const fileArray = Array.from(el.files ?? []);
		el.value = '';
		if (!fileArray.length) return;
		let urls = [...(payload.galleryImageUrls ?? [])];
		for (const f of fileArray) {
			if (urls.length >= 12) break;
			const url = await uploadToInvite('gallery', f);
			if (url) urls = [...urls, url];
		}
		payload = { ...payload, galleryImageUrls: urls };
		galleryUrlsText = urls.join('\n');
	}

	async function onMusicFile(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		const f = el.files?.[0] ?? null;
		el.value = '';
		if (!f) return;
		const url = await uploadToInvite('music', f);
		if (url) payload = { ...payload, musicPath: url };
	}

	async function saveDraft() {
		if (saving) return;
		publishError = '';
		const toSave = preparePayloadForSave();
		payload = toSave;
		saving = true;
		try {
			if (editSlug && editToken) {
				const r = await fetch(`/api/invites/${encodeURIComponent(editSlug)}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'X-Edit-Token': editToken
					},
					body: JSON.stringify({
						payload: toSave,
						publish: false,
						templateId: selectedTemplateId
					})
				});
				if (!r.ok) {
					const j = await r.json().catch(() => ({}));
					publishError =
						(j as { message?: string }).message ||
						(Array.isArray((j as { errors?: string[] }).errors)
							? (j as { errors: string[] }).errors.join(' ')
							: 'Save failed');
					return;
				}
				const okBody = (await r.json().catch(() => ({}))) as { published?: boolean };
				if (typeof window !== 'undefined') {
					shareUrl = `${window.location.origin}/i/${editSlug}`;
					rememberDraft({
						slug: editSlug,
						editToken: editToken,
						templateId: selectedTemplateId,
						label: getDisplayCoupleLine(toSave),
						published: !!okBody.published
					});
				}
			} else {
				const r = await fetch('/api/invites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						payload: toSave,
						publish: false,
						templateId: selectedTemplateId
					})
				});
				const j = await r.json();
				if (!r.ok) {
					publishError =
						(j.message as string) ||
						(Array.isArray(j.errors) ? j.errors.join(' ') : 'Save failed');
					return;
				}
				if (typeof window !== 'undefined') {
					rememberDraft({
						slug: j.slug,
						editToken: j.editToken,
						templateId: selectedTemplateId,
						label: getDisplayCoupleLine(toSave),
						published: !!(j as { published?: boolean }).published
					});
				}
				await goto(buildCreateSessionUrl(j.slug, j.editToken), { replaceState: true });
				if (typeof window !== 'undefined') {
					shareUrl = `${window.location.origin}/i/${j.slug}`;
				}
			}
		} finally {
			saving = false;
		}
	}

	async function publish() {
		if (saving) return;
		publishError = '';
		const toSave = preparePayloadForSave();
		payload = toSave;
		saving = true;
		try {
			if (editSlug && editToken) {
				const r = await fetch(`/api/invites/${encodeURIComponent(editSlug)}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'X-Edit-Token': editToken
					},
					body: JSON.stringify({
						payload: toSave,
						publish: true,
						templateId: selectedTemplateId
					})
				});
				const j = await r.json();
				if (!r.ok) {
					publishError = Array.isArray(j.errors) ? j.errors.join(' ') : j.message || 'Publish failed';
					return;
				}
				if (typeof window !== 'undefined') {
					shareUrl = `${window.location.origin}/i/${editSlug}`;
					rememberDraft({
						slug: editSlug,
						editToken: editToken,
						templateId: selectedTemplateId,
						label: getDisplayCoupleLine(toSave),
						published: !!(j as { published?: boolean }).published
					});
				}
			} else {
				const r = await fetch('/api/invites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						payload: toSave,
						publish: true,
						templateId: selectedTemplateId
					})
				});
				const j = await r.json();
				if (!r.ok) {
					publishError = Array.isArray(j.errors) ? j.errors.join(' ') : j.message || 'Publish failed';
					return;
				}
				if (typeof window !== 'undefined') {
					rememberDraft({
						slug: j.slug,
						editToken: j.editToken,
						templateId: selectedTemplateId,
						label: getDisplayCoupleLine(toSave),
						published: !!(j as { published?: boolean }).published
					});
				}
				await goto(buildCreateSessionUrl(j.slug, j.editToken), { replaceState: true });
				if (typeof window !== 'undefined') {
					shareUrl = `${window.location.origin}/i/${j.slug}`;
				}
			}
		} finally {
			saving = false;
		}
	}

	onMount(() => {
		if (!browser) return;
		const sp = page.url.searchParams;
		if (sp.get('edit')?.trim() && sp.get('token')?.trim()) return;
		if (isValidTemplateId(data.initialTemplate)) {
			selectedTemplateId = data.initialTemplate;
		}
		void saveDraft();
	});

	async function copyShare() {
		if (!shareUrl && typeof window !== 'undefined' && editSlug) {
			shareUrl = `${window.location.origin}/i/${editSlug}`;
		}
		try {
			await navigator.clipboard.writeText(shareUrl);
		} catch {
			/* ignore */
		}
	}
</script>

<svelte:head>
	<title>Create invite · Vow & Scroll</title>
</svelte:head>

<div class="shell">
	<header class="top">
		<h1 class="page-title">Create your invite</h1>
		<p class="sub">
			Template <strong>{selectedTemplateId}</strong> · live preview on the right
		</p>
	</header>

	{#if loading}
		<p class="hint">Loading your invite…</p>
	{:else if loadError}
		<p class="err">{loadError}</p>
	{:else}
		<div class="layout">
			<div class="panel form-panel">
				<nav class="steps" aria-label="Steps">
					{#each steps as s, i (s.id)}
						<button
							type="button"
							class="step"
							class:active={step === i}
							onclick={() => (step = i)}>{i + 1}. {s.title}</button
						>
					{/each}
				</nav>

				<div class="template-picker" role="group" aria-label="Choose template">
					<span class="picker-label">Template</span>
					<div class="picker-row">
						{#each INVITE_TEMPLATE_LIST as def (def.id)}
							<button
								type="button"
								class="picker-btn"
								class:active={selectedTemplateId === def.id}
								title={def.description}
								onclick={() => (selectedTemplateId = def.id)}
							>
								{def.label}
							</button>
						{/each}
					</div>
					<p class="picker-hint">
						Switching templates keeps your fields — only the layout changes in preview.
					</p>
				</div>

				<div class="fields">
					{#if step === 0}
						<label>
							<span>Groom first name</span>
							<input bind:value={payload.groomFirstName} placeholder="e.g. Rohan" />
						</label>
						<label>
							<span>Bride first name</span>
							<input bind:value={payload.brideFirstName} placeholder="e.g. Ananya" />
						</label>
						<label>
							<span>Couple title (optional override)</span>
							<input
								bind:value={payload.coupleNames}
								placeholder="Leave blank to use “Groom & Bride” on the invite"
							/>
						</label>
						<label>
							<span>Wedding day (calendar)</span>
							<input type="date" bind:value={payload.weddingDateISO} />
						</label>
						<label>
							<span>How the date reads (optional)</span>
							<input
								bind:value={payload.weddingDate}
								placeholder="Overrides auto-formatted date if you fill this"
							/>
						</label>
						<label>
							<span>Timezone (optional)</span>
							<input bind:value={payload.weddingTimezone} placeholder="Asia/Kolkata" />
						</label>
						<label>
							<span>Tagline (optional)</span>
							<input bind:value={payload.tagline} placeholder="Short line under the names" />
						</label>
						<label>
							<span>Hero image URL</span>
							<input
								bind:value={payload.heroImageUrl}
								placeholder="https://… (or upload after saving draft)"
							/>
						</label>
						<label class="file-row">
							<span>Hero image file</span>
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp"
								disabled={!canUpload || uploadBusy}
								onchange={onHeroFile}
							/>
						</label>
						{#if payload.heroImagePath}
							<p class="tip">Uploaded hero: <code>{payload.heroImagePath}</code></p>
						{/if}
						{#if !canUpload}
							<p class="tip">
								{saving
									? 'Creating your draft so file uploads can connect to your invite…'
									: 'Use “Save draft” if uploads stay disabled.'}
							</p>
						{/if}
					{:else if step === 1}
						<label>
							<span>Opening quote (optional)</span>
							<textarea bind:value={payload.openingQuote} rows="4"></textarea>
						</label>
						<label>
							<span>Attribution (optional)</span>
							<input bind:value={payload.openingAttribution} placeholder="Source or author" />
						</label>
						{#if selectedTemplateId !== WEDDING_CLASSIC_ID}
							<label>
								<span>Sacred opener / mantra (optional)</span>
								<textarea bind:value={payload.openingMantra} rows="3"></textarea>
							</label>
							<label>
								<span>Blessing intro (optional)</span>
								<textarea bind:value={payload.blessingIntro} rows="2"></textarea>
							</label>
							<label>
								<span>Blessing lines (one per line)</span>
								<textarea bind:value={blessingLinesText} rows="4"></textarea>
							</label>
							<label>
								<span>Formal invite lead (optional)</span>
								<textarea bind:value={payload.inviteLead} rows="3"></textarea>
							</label>
						{/if}
					{:else if step === 2}
						<label>
							<span>Bride’s parents / hosts</span>
							<input bind:value={payload.brideParents} />
						</label>
						<label>
							<span>Note (optional)</span>
							<textarea bind:value={payload.brideFamilyNote} rows="2"></textarea>
						</label>
						<label>
							<span>Groom’s parents / hosts</span>
							<input bind:value={payload.groomParents} />
						</label>
						<label>
							<span>Note (optional)</span>
							<textarea bind:value={payload.groomFamilyNote} rows="2"></textarea>
						</label>
						{#if selectedTemplateId !== WEDDING_CLASSIC_ID}
							<label>
								<span>Bride lineage / family (optional)</span>
								<textarea bind:value={payload.brideLineage} rows="3"></textarea>
							</label>
							<label>
								<span>Groom lineage / family (optional)</span>
								<textarea bind:value={payload.groomLineage} rows="3"></textarea>
							</label>
							<label>
								<span>Personal letter (optional)</span>
								<textarea bind:value={payload.personalLetter} rows="6"></textarea>
							</label>
							<label>
								<span>Sign-off line (optional)</span>
								<input bind:value={payload.signOffLine} />
							</label>
						{/if}
					{:else if step === 3}
						{#each payload.events as ev, i (i)}
							<div class="event-block">
								<div class="event-head">
									<h3>Event {i + 1}</h3>
									{#if payload.events.length > 1}
										<button type="button" class="linkish" onclick={() => removeEvent(i)}>Remove</button>
									{/if}
								</div>
								<label>
									<span>Title</span>
									<input
										value={ev.title}
										oninput={(e) => updateEvent(i, { title: e.currentTarget.value })}
									/>
								</label>
								<label>
									<span>When (calendar)</span>
									<input
										type="datetime-local"
										value={ev.eventDateTimeLocal}
										oninput={(e) =>
											updateEvent(i, { eventDateTimeLocal: e.currentTarget.value })}
									/>
								</label>
								<label>
									<span>Date only (optional)</span>
									<input
										type="date"
										value={ev.eventDateISO}
										oninput={(e) => updateEvent(i, { eventDateISO: e.currentTarget.value })}
									/>
								</label>
								<label>
									<span>Date & time (free text fallback)</span>
									<input
										value={ev.dateTime}
										oninput={(e) => updateEvent(i, { dateTime: e.currentTarget.value })}
									/>
								</label>
								<label>
									<span>Venue name</span>
									<input
										value={ev.venueName}
										oninput={(e) => updateEvent(i, { venueName: e.currentTarget.value })}
									/>
								</label>
								<label>
									<span>Address (optional)</span>
									<textarea
										value={ev.venueAddress}
										rows="2"
										oninput={(e) => updateEvent(i, { venueAddress: e.currentTarget.value })}
									></textarea>
								</label>
								<label>
									<span>Map link (Google Maps share URL)</span>
									<input
										value={ev.mapUrl}
										oninput={(e) => updateEvent(i, { mapUrl: e.currentTarget.value })}
									/>
								</label>
								<label>
									<span>Dress code (optional)</span>
									<input
										value={ev.dressCode}
										oninput={(e) => updateEvent(i, { dressCode: e.currentTarget.value })}
									/>
								</label>
								<label>
									<span>Notes (optional)</span>
									<textarea
										value={ev.notes}
										rows="2"
										oninput={(e) => updateEvent(i, { notes: e.currentTarget.value })}
									></textarea>
								</label>
							</div>
						{/each}
						<button type="button" class="btn secondary" onclick={addEvent}>+ Add event</button>
					{:else if step === 4}
						<label>
							<span>Gallery section title</span>
							<input bind:value={payload.galleryTitle} />
						</label>
						<label>
							<span>Gallery image URLs (one per line, max 12)</span>
							<textarea bind:value={galleryUrlsText} rows="6"></textarea>
						</label>
						<label class="file-row">
							<span>Gallery image files</span>
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp"
								multiple
								disabled={!canUpload || uploadBusy}
								onchange={onGalleryFiles}
							/>
						</label>
						<label>
							<span>Background music URL (optional)</span>
							<input
								bind:value={payload.musicUrl}
								placeholder="https://…/song.mp3 — plays while guests view the invite"
							/>
						</label>
						<label class="file-row">
							<span>Background music file</span>
							<input
								type="file"
								accept="audio/mpeg,audio/mp3,audio/mp4,.mp3,.m4a"
								disabled={!canUpload || uploadBusy}
								onchange={onMusicFile}
							/>
						</label>
						{#if payload.musicPath}
							<p class="tip">Uploaded background track: <code>{payload.musicPath}</code></p>
						{/if}
						{#if !canUpload}
							<p class="tip">
								{saving
									? 'Creating your draft so uploads work…'
									: 'Use “Save draft” if file picks stay disabled.'}
							</p>
						{/if}
						{#if selectedTemplateId !== WEDDING_CLASSIC_ID}
							<label>
								<span>Countdown target (local date & time)</span>
								<input type="datetime-local" bind:value={payload.countdownTargetISO} />
							</label>
						{/if}
						<p class="tip">
							URLs still work. Uploaded files stay on this server until you switch to cloud storage
							later. Background music loops while guests view the invite; many browsers only start
							audio after a tap or key press on the page.
						</p>
					{:else if step === 5}
						<div class="rsvp-callout">
							<h3>RSVP</h3>
							<p>
								Paste a link to any RSVP tool — Google Forms, Zola, WithJoy, etc. Guests tap
								<strong>RSVP</strong> on your public page.
							</p>
						</div>
						<label>
							<span>RSVP URL</span>
							<input bind:value={payload.rsvpUrl} placeholder="https://forms.gle/…" />
						</label>
						<label>
							<span>Instagram URL (optional)</span>
							<input bind:value={payload.instagramUrl} />
						</label>
						<label>
							<span>Wedding hashtag</span>
							<input bind:value={payload.hashtag} placeholder="#AnanyaWedsRohan" />
						</label>
						<label>
							<span>Coordinator note (parking, dress, etc.)</span>
							<textarea bind:value={payload.coordinatorNote} rows="3"></textarea>
						</label>
						{#if selectedTemplateId !== WEDDING_CLASSIC_ID}
							<h3 class="subhead">Things to know (scroll template)</h3>
							<label>
								<span>Hashtag note</span>
								<input
									value={payload.thingsToKnow.hashtag}
									oninput={(e) => patchThings({ hashtag: e.currentTarget.value })}
								/>
							</label>
							<label>
								<span>Weather</span>
								<textarea
									value={payload.thingsToKnow.weather}
									rows="2"
									oninput={(e) => patchThings({ weather: e.currentTarget.value })}
								></textarea>
							</label>
							<label>
								<span>Staff / contacts</span>
								<textarea
									value={payload.thingsToKnow.staff}
									rows="2"
									oninput={(e) => patchThings({ staff: e.currentTarget.value })}
								></textarea>
							</label>
							<label>
								<span>Parking</span>
								<textarea
									value={payload.thingsToKnow.parking}
									rows="2"
									oninput={(e) => patchThings({ parking: e.currentTarget.value })}
								></textarea>
							</label>
							<label>
								<span>Footer family note (optional)</span>
								<textarea bind:value={payload.footerFamilyNote} rows="2"></textarea>
							</label>
						{/if}
						<label>
							<span>Contact phone (optional)</span>
							<input bind:value={payload.contactPhone} />
						</label>
						<label>
							<span>Footer line</span>
							<input bind:value={payload.footerNote} placeholder="With love · Ananya & Rohan" />
						</label>
					{/if}
				</div>

				<div class="nav-row">
					<button type="button" class="btn secondary" disabled={step === 0} onclick={() => step--}>
						Back
					</button>
					<button
						type="button"
						class="btn secondary"
						disabled={step >= steps.length - 1}
						onclick={() => step++}
					>
						Next
					</button>
				</div>

				<div class="actions">
					<button type="button" class="btn ghost" disabled={saving || uploadBusy} onclick={saveDraft}>
						{saving ? 'Saving…' : 'Save draft'}
					</button>
					<button type="button" class="btn primary" disabled={saving || uploadBusy} onclick={publish}>
						Publish
					</button>
				</div>

				{#if publishError}
					<p class="err">{publishError}</p>
				{/if}

				{#if shareUrl}
					<div class="share">
						<p>Share link (live after publish):</p>
						<div class="share-row">
							<code>{shareUrl}</code>
							<button type="button" class="btn secondary" onclick={copyShare}>Copy</button>
							<a class="btn secondary" href={shareUrl}>Open</a>
						</div>
						<p class="tip">
							Keep this edit link private: bookmark the page URL after first save — it contains your
							secret token.
						</p>
					</div>
				{/if}
			</div>

			<div class="panel preview-panel" aria-label="Live preview">
				<h2 class="preview-title">Live preview</h2>
				<div class="preview-frame">
					<PreviewCmp {payload} preview />
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.shell {
		min-height: 100vh;
		padding: clamp(1rem, 3vw, 2rem);
		font-family: var(--font-body);
		color: var(--ink);
		background: var(--paper);
	}

	.top {
		max-width: 88rem;
		margin: 0 auto 2rem;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem 1rem;
	}

	.page-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.35rem;
		margin: 0;
		letter-spacing: -0.02em;
		color: var(--ink);
	}

	.sub strong {
		color: var(--maroon);
		font-weight: 600;
	}

	.sub {
		margin: 0;
		font-size: 0.85rem;
		opacity: 0.75;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		max-width: 88rem;
		margin: 0 auto;
	}

	@media (min-width: 960px) {
		.layout {
			grid-template-columns: minmax(320px, 1fr) minmax(0, 1.15fr);
			align-items: start;
		}
	}

	.panel {
		background: rgba(255, 255, 255, 0.35);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 1.25rem;
	}

	.steps {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-bottom: 1rem;
	}

	.step {
		font-family: var(--font-display);
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		padding: 0.35rem 0.55rem;
		border: 1px solid transparent;
		border-radius: 4px;
		background: transparent;
		cursor: pointer;
		color: var(--ink);
	}

	.step.active {
		border-color: var(--ink);
		background: rgba(26, 24, 20, 0.05);
	}

	.template-picker {
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--line);
	}

	.picker-label {
		display: block;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		font-family: var(--font-display);
		margin-bottom: 0.5rem;
		color: var(--ink-soft, var(--ink));
		opacity: 0.85;
	}

	.picker-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.picker-btn {
		font-family: var(--font-display);
		font-size: 0.82rem;
		padding: 0.45rem 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: #fffef9;
		cursor: pointer;
		color: var(--ink);
	}

	.picker-btn.active {
		border-color: var(--maroon);
		background: rgba(107, 34, 51, 0.08);
		color: var(--maroon);
	}

	.picker-hint {
		margin: 0.5rem 0 0;
		font-size: 0.82rem;
		opacity: 0.85;
		line-height: 1.45;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.subhead {
		font-family: var(--font-display);
		font-size: 1rem;
		margin: 0.5rem 0 0.25rem;
	}

	label span {
		display: block;
		font-size: 0.8rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		font-family: var(--font-display);
	}

	input,
	textarea {
		width: 100%;
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--line);
		border-radius: 4px;
		font: inherit;
		background: #fffef9;
		color: var(--ink);
	}

	.file-row input[type='file'] {
		padding: 0.35rem 0;
		border: none;
		background: transparent;
	}

	.event-block {
		border-left: 2px solid var(--foliage);
		padding-left: 0.75rem;
		margin-bottom: 1rem;
	}

	.event-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.event-head h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
	}

	.linkish {
		border: none;
		background: none;
		color: var(--accent);
		cursor: pointer;
		font-size: 0.85rem;
		text-decoration: underline;
	}

	.nav-row,
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.actions {
		border-top: 1px solid var(--line);
		padding-top: 1rem;
	}

	.btn {
		font-family: var(--font-display);
		font-size: 0.85rem;
		padding: 0.45rem 0.85rem;
		border-radius: 4px;
		border: 1px solid var(--ink);
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: var(--ink);
	}

	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fffaf7;
	}

	.btn.secondary:hover,
	.btn.ghost:hover {
		background: rgba(26, 24, 20, 0.06);
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.hint {
		text-align: center;
		padding: 3rem;
	}

	.err {
		color: #9a2f2f;
		font-size: 0.95rem;
	}

	.tip,
	.rsvp-callout p {
		font-size: 0.9rem;
		line-height: 1.5;
		opacity: 0.9;
		margin: 0;
	}

	.rsvp-callout {
		padding: 0.85rem;
		background: rgba(45, 59, 46, 0.08);
		border-radius: 4px;
		margin-bottom: 0.75rem;
	}

	.rsvp-callout h3 {
		margin: 0 0 0.35rem;
		font-family: var(--font-display);
		font-size: 1rem;
	}

	.share {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--line);
		font-size: 0.9rem;
	}

	.share-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin: 0.35rem 0 0.5rem;
	}

	code {
		font-size: 0.8rem;
		background: rgba(26, 24, 20, 0.06);
		padding: 0.35rem 0.5rem;
		border-radius: 4px;
		word-break: break-all;
		flex: 1 1 200px;
	}

	.preview-title {
		margin: 0 0 0.75rem;
		font-family: var(--font-display);
		font-size: 1rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.preview-frame {
		max-height: min(80vh, 900px);
		overflow: auto;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--paper);
	}

	.preview-frame :global(.invite) {
		box-shadow: none;
	}
</style>

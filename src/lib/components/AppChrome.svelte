<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';

	let { children } = $props();
	let open = $state(false);

	const isHome = $derived(page.url.pathname === '/');

	afterNavigate(() => {
		open = false;
	});
</script>

<div class="app" class:app-home={isHome}>
	<button
		type="button"
		class="nav-fab"
		aria-label={open ? 'Close menu' : 'Open menu'}
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<span class="burger" class:open={open}></span>
	</button>

	{#if open}
		<button type="button" class="scrim" aria-label="Close menu" onclick={() => (open = false)}></button>
	{/if}

	<aside class="sidebar" class:open>
		<div class="brand-block">
			<a href="/" class="brand">Vow & Scroll</a>
			<p class="brand-tag">Digital shaadi · one sacred link</p>
		</div>

		<nav class="nav-main" aria-label="Primary">
			<a href="/" class="nav-link" class:active={page.url.pathname === '/'} data-sveltekit-preload-data>
				<span class="nav-icon" aria-hidden="true">◈</span>
				Home
			</a>
			<a
				href="/create"
				class="nav-link nav-cta"
				class:active={page.url.pathname.startsWith('/create')}
				data-sveltekit-preload-data
			>
				<span class="nav-icon" aria-hidden="true">◎</span>
				Create invite
			</a>
			<a
				href="/about"
				class="nav-link"
				class:active={page.url.pathname.startsWith('/about')}
				data-sveltekit-preload-data
			>
				<span class="nav-icon" aria-hidden="true">❋</span>
				About
			</a>
			<a
				href="/contact"
				class="nav-link"
				class:active={page.url.pathname.startsWith('/contact')}
				data-sveltekit-preload-data
			>
				<span class="nav-icon" aria-hidden="true">✉</span>
				Contact us
			</a>
		</nav>

		<div class="nav-social">
			<p class="social-label">Follow</p>
			<div class="social-row">
				<button type="button" class="social-pill" disabled title="YouTube link coming soon">
					<span class="si si-yt">▶</span>
					YouTube
				</button>
				<button type="button" class="social-pill" disabled title="Instagram link coming soon">
					<span class="si si-ig">◎</span>
					Instagram
				</button>
			</div>
		</div>
	</aside>

	<div class="stage">
		{@render children()}
	</div>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		position: relative;
	}

	.nav-fab {
		position: fixed;
		top: max(1rem, env(safe-area-inset-top, 0px));
		left: max(1rem, env(safe-area-inset-left, 0px));
		z-index: 50;
		width: 48px;
		height: 48px;
		border: none;
		border-radius: 12px;
		background: rgba(253, 248, 240, 0.82);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow: 0 4px 24px rgba(40, 12, 24, 0.12);
		cursor: pointer;
		display: grid;
		place-items: center;
		transition: transform 0.2s ease;
	}

	.nav-fab:hover {
		transform: scale(1.04);
	}

	.burger {
		display: block;
		width: 20px;
		height: 2px;
		background: var(--maroon);
		border-radius: 1px;
		position: relative;
		transition: background 0.2s ease;
	}

	.burger::before,
	.burger::after {
		content: '';
		position: absolute;
		left: 0;
		width: 20px;
		height: 2px;
		background: var(--maroon);
		border-radius: 1px;
		transition: transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
	}

	.burger::before {
		top: -7px;
	}
	.burger::after {
		top: 7px;
	}

	.burger.open {
		background: transparent;
	}

	.burger.open::before {
		transform: translateY(7px) rotate(45deg);
	}
	.burger.open::after {
		transform: translateY(-7px) rotate(-45deg);
	}

	.scrim {
		position: fixed;
		inset: 0;
		z-index: 30;
		background: rgba(26, 12, 18, 0.45);
		backdrop-filter: blur(4px);
		border: none;
		cursor: pointer;
	}

	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 40;
		width: min(300px, 88vw);
		height: 100vh;
		padding: 5.5rem 1.5rem 2rem;
		background: linear-gradient(
			175deg,
			rgba(253, 250, 245, 0.97) 0%,
			rgba(250, 238, 228, 0.98) 50%,
			rgba(245, 228, 218, 0.99) 100%
		);
		border-right: 1px solid rgba(201, 162, 39, 0.22);
		box-shadow: 16px 0 48px rgba(60, 20, 30, 0.08);
		transform: translateX(-102%);
		transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1);
		display: flex;
		flex-direction: column;
		gap: 2rem;
		overflow-y: auto;
	}

	.sidebar.open {
		transform: translateX(0);
	}

	@media (min-width: 1100px) {
		.app:not(.app-home) .nav-fab {
			display: none;
		}
		.app:not(.app-home) .sidebar {
			position: fixed;
			transform: translateX(0);
			width: 280px;
		}
		.app:not(.app-home) .scrim {
			display: none;
		}
	}

	/* Home: full-width stage; menu is always a left drawer (all breakpoints). */
	.app-home .stage {
		padding-top: 0;
		margin-left: 0;
	}

	.app-home .nav-fab {
		display: grid;
	}

	.app-home .sidebar {
		transform: translateX(-102%);
	}

	.app-home .sidebar.open {
		transform: translateX(0);
	}

	.brand-block {
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--line-gold);
	}

	.brand {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.35rem;
		letter-spacing: -0.03em;
		color: var(--ink);
		text-decoration: none;
		display: block;
	}

	.brand-tag {
		margin: 0.35rem 0 0;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		color: rgba(26, 24, 20, 0.55);
		font-family: var(--font-ui);
	}

	.nav-main {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.65rem 0.75rem;
		border-radius: 10px;
		font-family: var(--font-ui);
		font-size: 0.92rem;
		font-weight: 500;
		color: var(--ink);
		text-decoration: none;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.nav-link:hover {
		background: rgba(201, 162, 39, 0.12);
	}

	.nav-link.active {
		background: linear-gradient(135deg, rgba(139, 40, 60, 0.12), rgba(201, 162, 39, 0.1));
		color: var(--maroon);
		font-weight: 600;
	}

	.nav-cta {
		margin-top: 0.35rem;
		border: 1px solid rgba(201, 162, 39, 0.45);
		background: rgba(255, 248, 238, 0.8);
	}

	.nav-icon {
		opacity: 0.75;
		font-size: 0.85rem;
	}

	.nav-social {
		margin-top: auto;
		padding-top: 1.5rem;
		border-top: 1px solid var(--line-gold);
	}

	.social-label {
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		margin: 0 0 0.65rem;
		color: rgba(26, 24, 20, 0.45);
		font-family: var(--font-ui);
	}

	.social-row {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.social-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.65rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid var(--line-gold);
		font-size: 0.82rem;
		font-family: var(--font-ui);
		color: var(--ink);
		text-decoration: none;
		opacity: 0.85;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
		cursor: pointer;
		text-align: left;
		width: 100%;
	}

	.social-pill:disabled {
		cursor: default;
		opacity: 0.65;
	}

	.social-pill:not(:disabled):hover {
		opacity: 1;
		transform: translateX(4px);
	}

	.si {
		width: 1.25rem;
		text-align: center;
		opacity: 0.8;
	}

	.stage {
		flex: 1;
		width: 100%;
		min-width: 0;
		min-height: 100vh;
		padding-top: 4.25rem;
	}

	@media (min-width: 1100px) {
		.stage {
			padding-top: 0;
			margin-left: 280px;
		}
	}
</style>

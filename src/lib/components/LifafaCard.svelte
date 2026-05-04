<script lang="ts">
	type Variant = 'live' | 'soon';

	let {
		title,
		subtitle,
		tag,
		variant = 'soon',
		href = '/create',
		ctaLabel = 'Open lifāfā'
	}: {
		title: string;
		subtitle: string;
		tag: string;
		variant?: Variant;
		href?: string;
		ctaLabel?: string;
	} = $props();

	let open = $state(false);
	let rootEl = $state<HTMLDivElement | undefined>();

	function toggle() {
		if (variant === 'soon') return;
		open = !open;
	}

	function onKey(e: KeyboardEvent) {
		if (variant === 'soon') return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle();
		}
	}
</script>

<div
	class="lifafa-wrap"
	class:open={open}
	class:soon={variant === 'soon'}
	bind:this={rootEl}
>
	<button
		type="button"
		class="lifafa-hit"
		onclick={toggle}
		onkeydown={onKey}
		disabled={variant === 'soon'}
		aria-expanded={open}
		aria-label={variant === 'soon' ? `${title} — coming soon` : `Open invitation ${title}`}
	>
		<div class="lifafa-3d">
			<div class="env-body"></div>
			<div class="env-flap"></div>
			<div class="env-inner">
				<span class="inner-tag">{tag}</span>
				<h3 class="inner-title">{title}</h3>
				<p class="inner-sub">{subtitle}</p>
				{#if variant === 'live'}
					{#if open}
						<a class="inner-cta" {href} onclick={(e) => e.stopPropagation()}>{ctaLabel} →</a>
					{:else}
						<span class="inner-hint">Tap to reveal</span>
					{/if}
				{:else}
					<span class="inner-lock">शीघ्र आ रहा है · Coming soon</span>
				{/if}
			</div>
			<div class="env-seal">
				<span class="om">ॐ</span>
			</div>
		</div>
	</button>
</div>

<style>
	.lifafa-wrap {
		perspective: 1400px;
		width: 100%;
		max-width: 340px;
		margin: 0 auto;
	}

	.lifafa-hit {
		all: unset;
		cursor: pointer;
		display: block;
		width: 100%;
		box-sizing: border-box;
	}

	.lifafa-wrap.soon .lifafa-hit {
		cursor: default;
	}

	.lifafa-3d {
		position: relative;
		transform-style: preserve-3d;
		min-height: 280px;
		border-radius: 12px;
		transition: transform 0.65s cubic-bezier(0.34, 1.3, 0.64, 1);
	}

	.lifafa-wrap:not(.soon):hover .lifafa-3d {
		transform: translateY(-6px) rotateX(2deg);
	}

	.env-body {
		position: absolute;
		inset: 12% 6% 8%;
		background: linear-gradient(
			145deg,
			var(--envelope-dark) 0%,
			var(--envelope-mid) 45%,
			var(--envelope-light) 100%
		);
		border-radius: 8px;
		box-shadow:
			0 24px 48px rgba(60, 20, 30, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(201, 162, 39, 0.35);
	}

	.env-flap {
		position: absolute;
		top: 12%;
		left: 6%;
		right: 6%;
		height: 42%;
		background: linear-gradient(
			180deg,
			rgba(255, 232, 210, 0.15) 0%,
			var(--envelope-mid) 40%,
			var(--envelope-dark) 100%
		);
		border-radius: 8px 8px 2px 2px;
		transform-origin: top center;
		transform: rotateX(0deg);
		transition: transform 0.75s cubic-bezier(0.34, 1.3, 0.64, 1);
		border: 1px solid rgba(201, 162, 39, 0.25);
		z-index: 2;
	}

	.open .env-flap {
		transform: rotateX(-168deg);
		z-index: 0;
	}

	.env-inner {
		position: absolute;
		left: 10%;
		right: 10%;
		top: 28%;
		bottom: 14%;
		padding: 1.25rem 1rem;
		background: linear-gradient(180deg, #fffdf8 0%, #faf4ea 100%);
		border-radius: 6px;
		z-index: 1;
		box-shadow: 0 8px 32px rgba(40, 12, 20, 0.12);
		border: 1px solid rgba(201, 162, 39, 0.2);
		transform: translateY(12px);
		opacity: 0.85;
		transition:
			transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1) 0.1s,
			opacity 0.45s ease;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
	}

	.open .env-inner {
		transform: translateY(0);
		opacity: 1;
	}

	.inner-tag {
		font-size: 0.68rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--gold);
		font-family: var(--font-ui);
	}

	.inner-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 600;
		color: var(--ink);
		line-height: 1.2;
	}

	.inner-sub {
		margin: 0;
		font-size: 0.88rem;
		line-height: 1.45;
		color: rgba(26, 24, 20, 0.78);
	}

	.inner-cta {
		margin-top: 0.5rem;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--maroon);
		text-decoration: none;
		padding: 0.45rem 0.85rem;
		border-radius: 999px;
		background: linear-gradient(180deg, rgba(255, 213, 160, 0.45), rgba(201, 162, 39, 0.15));
		border: 1px solid rgba(201, 162, 39, 0.45);
		transition: transform 0.2s ease;
	}

	.inner-cta:hover {
		transform: scale(1.03);
	}

	.inner-hint {
		font-size: 0.78rem;
		opacity: 0.65;
		font-family: var(--font-ui);
	}

	.inner-lock {
		font-size: 0.8rem;
		color: rgba(26, 24, 20, 0.55);
		margin-top: 0.25rem;
	}

	.env-seal {
		position: absolute;
		bottom: 18%;
		left: 50%;
		transform: translateX(-50%);
		width: 52px;
		height: 52px;
		border-radius: 50%;
		background: radial-gradient(circle at 30% 25%, #ffe8c8, #c9a227 55%, #8a6d1a);
		box-shadow:
			0 6px 16px rgba(60, 30, 20, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.35);
		z-index: 3;
		display: grid;
		place-items: center;
		transition:
			opacity 0.35s ease,
			transform 0.45s cubic-bezier(0.34, 1.3, 0.64, 1);
		border: 2px solid rgba(255, 248, 230, 0.5);
	}

	.open .env-seal {
		opacity: 0;
		transform: translateX(-50%) scale(0.4);
		pointer-events: none;
	}

	.om {
		font-size: 1.15rem;
		color: #3d2914;
		line-height: 1;
	}

	.lifafa-wrap.soon .env-body {
		filter: saturate(0.65) brightness(0.92);
	}

	.lifafa-wrap.soon .env-inner {
		opacity: 0.95;
	}
</style>

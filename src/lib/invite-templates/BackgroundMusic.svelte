<script lang="ts">
	/**
	 * Hidden looping background track for the public invite.
	 * Browsers often block autoplay without a user gesture — we start on first tap/key.
	 */
	let { src, preview = false }: { src: string | null; preview?: boolean } = $props();

	let audioEl = $state<HTMLAudioElement | null>(null);

	function tryPlay() {
		if (!audioEl || preview) return;
		void audioEl.play().catch(() => {});
	}

	$effect(() => {
		if (typeof window === 'undefined' || preview || !src?.trim()) return;
		const onFirst = () => tryPlay();
		window.addEventListener('pointerdown', onFirst, { capture: true, once: true });
		window.addEventListener('keydown', onFirst, { capture: true, once: true });
		queueMicrotask(() => tryPlay());
		return () => {
			window.removeEventListener('pointerdown', onFirst, { capture: true });
			window.removeEventListener('keydown', onFirst, { capture: true });
		};
	});
</script>

{#if src?.trim() && !preview}
	<audio
		bind:this={audioEl}
		{src}
		loop
		playsinline
		preload="auto"
		class="bg-audio"
		aria-hidden="true"
	></audio>
{/if}

<style>
	.bg-audio {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		pointer-events: none;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
</style>

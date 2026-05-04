<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import AppChrome from '$lib/components/AppChrome.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppChrome>{@render children()}</AppChrome>

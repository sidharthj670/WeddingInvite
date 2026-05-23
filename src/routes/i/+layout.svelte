<script lang="ts">
	let { children } = $props();
</script>

{@render children()}

<style>
	:global(body) {
		background: #080608;
		background-image: none;
	}
</style>

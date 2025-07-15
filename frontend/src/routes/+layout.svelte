<script lang="ts">
	import '../app.css';
	import { themeStore } from '$lib/stores/theme.svelte';

	let { children } = $props();
	
	// Initialize theme store on app start
	if (typeof window !== 'undefined') {
		themeStore;
	}
</script>

{@render children()}

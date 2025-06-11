<script>
	import GoogleMaps from '$lib/components/outputs/GoogleMaps.svelte';
	export let gigs;
</script>

<div class="min-w-full min-h-full">
	<GoogleMaps {gigs} />
</div>

<script>
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';
	let venueName = 'The Gem';
	let readOut = 'Ready to begin';
	let loading = false;
</script>

<div class="space-y-4 page">
	<h1 class="text-5xl font-bold text-center">
		{venueName}
	</h1>
	<div class="flex flex-col items-center w-full p-10 text-center bg-white/5">
		{readOut}{#if loading}<PacMan />{/if}
	</div>
	<button class="w-full btn">Get Links</button>
</div>

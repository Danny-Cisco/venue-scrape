<script>
	import { onMount } from 'svelte';
	let knownVenues = [];
	let scrapedName = '';
	let matchResult = '';
	let loading = false;

	async function matchVenue() {
		loading = true;
		matchResult = '';
		const res = await fetch('/api/supabase/soft-match-venue', {
			method: 'POST',
			body: JSON.stringify({ scrapedName }),
			headers: { 'Content-Type': 'application/json' }
		});

		const data = await res.json();
		matchResult = data.match || data.error;
		loading = false;
	}

	onMount(async () => {
		const res = await fetch('/api/supabase/soft-match-venue');
		knownVenues = await res.json();
	});
</script>

<h1 class="mb-4 text-xl font-bold">LLM Venue Matcher</h1>

<div class="space-y-4 page">
	<input
		class="w-full p-2 border rounded"
		placeholder="Scraped Venue Name"
		bind:value={scrapedName}
	/>

	<button
		class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
		on:click={matchVenue}
		disabled={loading}
	>
		{loading ? 'Matching...' : 'Match Venue'}
	</button>

	{#if matchResult}
		<p class="mt-4 font-mono">
			Result: <strong>{matchResult}</strong>
		</p>
	{/if}

	<details class="mt-6">
		<summary class="cursor-pointer">Known Venues ({knownVenues.length})</summary>
		<ul class="mt-2 ml-6 text-sm list-disc">
			{#each knownVenues as venue}
				<li>{venue}</li>
			{/each}
		</ul>
	</details>
</div>

<script>
	import { onMount } from 'svelte';
	let knownVenues = [];
	let scrapedName = '';
	let resultMatch = '';
	let resultId = '';
	let loading = false;

	async function matchVenue() {
		loading = true;
		resultMatch = '';
		const res = await fetch('/api/supabase/venue-name-match', {
			method: 'POST',
			body: JSON.stringify({ scrapedName }),
			headers: { 'Content-Type': 'application/json' }
		});

		const data = await res.json();
		resultMatch = data.match || data.error;
		resultId = data.venue_id;
		loading = false;
	}

	onMount(async () => {
		const res = await fetch('/api/supabase/whats-lively-urls');
		knownVenues = await res.json();
		console.log('🚀 ~ onMount ~ knownVenues:', knownVenues);
	});
</script>

<h1 class="mb-4 text-xl font-bold">Records in database with Whats Lively urls</h1>

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

	{#if resultMatch}
		<div class="flex flex-col items-start mt-4 font-mono min-w-sm">
			<p>
				name: <strong>{resultMatch}</strong>
			</p>
			<p>id: <strong>{resultId}</strong></p>
		</div>
	{/if}

	<details class="mt-6">
		<summary class="cursor-pointer">Known Venues ({knownVenues.length})</summary>
		<ul class="mt-2 ml-6 text-sm list-disc">
			{#each knownVenues as venue}
				<li>
					<a href={venue.whatsLivelyUrl}>{venue.name}</a>
				</li>
			{/each}
		</ul>
	</details>
</div>

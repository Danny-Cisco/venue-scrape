<script>
	let venue = '';
	let results = [];

	async function search() {
		const res = await fetch(`/api/algolia/oztix-venue-to-urls?venue=${encodeURIComponent(venue)}`);
		const data = await res.json();

		results = data.hits || [];
		console.log('🚀 ~ search ~ results:', results);
	}
</script>

<div class="page">
	<h2 class="mt-8 font-sans text-xl font-medium">Search for any venue name found on Oztix</h2>
	<div class="my-8 row">
		<input bind:value={venue} placeholder="Search..." />
		<button class="btn" on:click={search}>Search</button>
	</div>
	<ul class="gap-4 mx-auto w-max-sm">
		{#if results.length > 0}
			<h2 class="mt-8 font-sans text-xl font-medium text-center">
				({results.length}) Oztix links found
			</h2>

			{#each results as result}
				<li class="mb-4">
					<p class="font-sans text-lg font-medium">{result.EventName}</p>
					<div class="flex flex-col ml-4">
						{#each result.Bands as band}
							<p>- {band}</p>
						{/each}
					</div>
					<a href={result.EventUrl} target="_blank">{result.EventUrl}</a>
				</li>
			{/each}
		{:else}
			<p class="text-gray-500">No Results</p>
		{/if}
	</ul>
</div>

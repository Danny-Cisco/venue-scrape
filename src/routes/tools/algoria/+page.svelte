<script>
	let venue = '';
	let results = [];

	async function search() {
		const res = await fetch(`/api/algoria/search?venue=${encodeURIComponent(venue)}`);
		const data = await res.json();

		results = data.hits || [];
		console.log('🚀 ~ search ~ results:', results);
	}
</script>

<div class="page">
	<div class="row">
		<input bind:value={venue} placeholder="Search..." />
		<button on:click={search}>Search</button>
	</div>
	<ul class="gap-4 mx-auto w-max-sm">
		{#each results as result}
			<li class="mb-4">
				<p>{result.EventName}</p>
				<a href={result.EventUrl} target="_blank">{result.EventUrl}</a>
			</li>
		{/each}
	</ul>
</div>

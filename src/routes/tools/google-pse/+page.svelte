<script>
	let query = '';
	let results = [];

	async function search() {
		const res = await fetch(`/api/google/pse?query=${encodeURIComponent(query)}`);
		const data = await res.json();
		console.log(data);

		results = data.items || [];
	}
</script>

<input bind:value={query} placeholder="Search..." />
<button on:click={search}>Search</button>

<ul>
	{#each results as result}
		<li>
			<a href={result.link} target="_blank">{result.title}</a>
			<p>{result.snippet}</p>
		</li>
	{/each}
</ul>

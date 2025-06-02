<script>
	let result = '';
	let band = '';
	let elapsedMs = null;

	async function search() {
		result = 'searching...';
		elapsedMs = null;

		const start = performance.now();

		const res = await fetch(`/api/serper/get-instagram-url?band=${encodeURIComponent(band)}`);
		const data = await res.json();

		const end = performance.now();
		elapsedMs = Math.round(end - start);

		console.log(data);
		result = data.answer || 'No result';
	}
</script>

<div class="gap-2 mt-4 page">
	<h1>Get Instagram Url</h1>

	<input class="w-full" bind:value={band} placeholder="bandname..." />
	<button class="btn" on:click={search}>Search</button>

	<h1 class="my-4">Result:</h1>
	<a href={result} target="_blank" rel="noopener">{result}</a>

	{#if elapsedMs !== null}
		<p class="mt-2 text-sm">Response time: {elapsedMs} ms</p>
	{/if}
</div>

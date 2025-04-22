<script>
	let result = '';
	let band = '';

	async function search() {
		result = 'searching...';
		const res = await fetch(`/api/google/get-instagram-url?band=${encodeURIComponent(band)}`);
		const data = await res.json();
		console.log(data);

		result = data.answer || [];
	}
</script>

<div class="gap-2 mt-4 page">
	<h1>Get Instagram Url</h1>

	<input class="w-full" bind:value={band} placeholder="Bandname..." />
	<button class="btn" on:click={search}>Search</button>
	<h1 class="my-4">Result:</h1>
	<a href={result}>{result}</a>
</div>

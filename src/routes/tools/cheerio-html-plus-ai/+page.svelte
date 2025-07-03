<script>
	let url = '';
	let ai = '';
	let result = '';

	async function search() {
		const res = await fetch(
			`/api/cheerio/cheerio-html-plus-ai?url=${encodeURIComponent(url)}&ai=${encodeURIComponent(ai)}`
		);
		const data = await res.json();
		console.log(data);

		result = data.answer || [];
	}
</script>

<div class="gap-2 mt-4 page">
	<h1>Cheerio FULL HTML plus AI</h1>

	<input class="w-full" bind:value={url} placeholder="Url..." />
	<input class="w-full" bind:value={ai} placeholder="ai..." />
	<button class="btn" on:click={search}>Search</button>
	<h1 class="my-4">Result:</h1>
	<div>{result}</div>
</div>

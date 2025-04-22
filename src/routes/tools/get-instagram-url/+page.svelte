<script>
	let google = '';
	let ai = '';
	let result = '';
	let band = '';

	$: google = `${band} + band instagram`;
	$: ai = `what is the url for ${band} + band instagram profile. If unsure, prioritise Melbourne Bands.`;

	async function search() {
		const res = await fetch(
			`/api/google/pse-plus-ai?google=${encodeURIComponent(google)}&ai=${encodeURIComponent(ai)}`
		);
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

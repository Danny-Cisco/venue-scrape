<script>
	let google = '';
	let ai = '';
	let result = '';

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
	<h1>Google PSE plus AI</h1>

	<input class="w-full" bind:value={google} placeholder="Google..." />
	<input class="w-full" bind:value={ai} placeholder="ai..." />
	<button class="btn" on:click={search}>Search</button>
	<h1 class="my-4">Result:</h1>
	<div>{result}</div>
</div>

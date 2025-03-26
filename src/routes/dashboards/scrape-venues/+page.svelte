<script lang="ts">
	import { fade } from 'svelte/transition';

	let url = '';
	let html = '';

	async function scrapeSite() {
		const res = await fetch(`/api/scrape-html?target=${url}`);
		const data = await res.json();
		html = data.html;
	}
</script>

<div class="page" in:fade>
	<h1>Scrape Venues</h1>

	<input type="text" bind:value={url} />

	<button on:click={scrapeSite}>Scrape Html</button>

	{html}
</div>

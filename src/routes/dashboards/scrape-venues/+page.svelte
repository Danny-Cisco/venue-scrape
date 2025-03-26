<script lang="ts">
	import { fade } from 'svelte/transition';

	let html = '';
	let placeholder = 'https://thetotehotel.com/gig-guide/';
	let url = '';

	async function scrapeSite() {
		if (!url) {
			url = placeholder;
		}
		const res = await fetch(`/api/scrape-html?target=${url}`);
		const data = await res.json();
		html = data.html;
	}
</script>

<div class="pt-10 space-y-4 page" in:fade>
	<h1 class="text-3xl">Scrape Venues</h1>

	<input type="text" class="w-full" {placeholder} bind:value={url} />

	<button on:click={scrapeSite} class="btn">Scrape Html</button>

	{html}
</div>

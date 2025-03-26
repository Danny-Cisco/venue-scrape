<script lang="ts">
	import { fade } from 'svelte/transition';

	let html = '';

	async function scrapeSite() {
		const res = await fetch('/api/scrape-html?target=https://thetotehotel.com/gig-guide/');
		const data = await res.json();
		html = data.html;
	}
</script>

<div class="page" in:fade>
	Scrape Venues Goes Here

	<button on:click={scrapeSite}>Scrape</button>

	{html}
</div>

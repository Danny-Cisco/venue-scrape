<script>
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';
	let venueName = 'The Gem';
	let readOut = 'Ready to begin';
	let loading = false;

	let links = [];

	let regex = /https?:\/\/www\.thegembar\.com\.au\/gigs\/[\w\-0-9]+/gi;

	let output = '';

	let url = 'https://r.jina.ai/https://www.thegembar.com.au/';

	async function getLinks() {
		loading = true;
		readOut = 'fetching Markdown';
		let res = await fetch(url);
		if (!res.ok) {
			readOut = res.error;
			throw new Error('Jina failed to fetch Markdown');
		} else {
			output = await res.text();
		}
		readOut = 'extracting links using regex';

		links = [...new Set(output.match(regex) || [])];

		loading = false;
		readOut = 'Done';
	}
</script>

<div class="space-y-4 page">
	<h1 class="text-5xl font-bold text-center">
		{venueName}
	</h1>
	<div class="flex flex-col items-center w-full p-10 text-center bg-white/5">
		{readOut}{#if loading}<PacMan />{/if}
	</div>
	<button class="w-full btn" on:click={getLinks}>Get Links</button>
	<!-- <h1>JINA OUT</h1>
	<div>{output}</div> -->
	{#if links.length > 0}
		<div>
			<h1>LINKS</h1>
			{#each links as link}
				<p>
					{link}
				</p>
			{/each}
		</div>
	{/if}
</div>

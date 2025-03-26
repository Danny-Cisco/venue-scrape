<script lang="ts">
	import { fade } from 'svelte/transition';

	let html = '';
	let links: string[] = [];
	let placeholder = 'https://thetotehotel.com/gig-guide/';
	let url = '';

	async function scrapeSite() {
		try {
			if (!url) {
				url = placeholder;
			}
			const res = await fetch(`/api/scrape-html?target=${url}`);
			const data = await res.json();
			html = data.html;

			// Create a temporary DOM element to parse the HTML
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			// Extract all anchor tags and get their href attributes
			const anchorTags = doc.getElementsByTagName('a');
			links = Array.from(anchorTags)
				.map((a) => a.getAttribute('href'))
				.filter((href) => href !== null) as string[];
		} catch (error) {
			console.error('Error scraping site:', error);
			links = ['Error occurred while scraping the site'];
		}
	}
</script>

<div class="pt-10 space-y-4 page" in:fade>
	<h1 class="text-3xl">Scrape Venues</h1>

	<input type="text" class="w-full p-2 border rounded" {placeholder} bind:value={url} />

	<button
		on:click={scrapeSite}
		class="px-4 py-2 text-white bg-blue-500 rounded btn hover:bg-blue-600"
	>
		Scrape Links
	</button>

	{#if links.length > 0}
		<div class="mt-4">
			<h2 class="mb-2 text-xl">Found Links:</h2>
			<ul class="pl-5 space-y-2 list-disc">
				{#each links as link}
					<li>
						<a
							href={link}
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-600 break-all hover:underline"
						>
							{link}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{:else if html}
		<p>No links found in the scraped content</p>
	{/if}
</div>

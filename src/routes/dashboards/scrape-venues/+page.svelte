<script lang="ts">
	import { fade } from 'svelte/transition';

	let markdown = '';
	let oztixLinks: string[] = [];
	let placeholder = 'https://thetotehotel.oztix.com.au/';
	let url = '';
	let isLoading = false;

	async function fetchMarkdown() {
		try {
			isLoading = true;
			if (!url) {
				url = placeholder;
			}
			// Prepend r.jina.ai/ to the URL
			const jinaUrl = `https://r.jina.ai/${url}`;
			const res = await fetch(jinaUrl);
			if (!res.ok) throw new Error('Failed to fetch Markdown');
			markdown = await res.text();

			// Extract Oztix links using regex
			const linkRegex = /https:\/\/thetotehotel\.oztix\.com\.au[^\s)]+/g;
			oztixLinks = [...new Set(markdown.match(linkRegex) || [])]; // Remove duplicates with Set
		} catch (error) {
			console.error('Error fetching Markdown:', error);
			oztixLinks = ['Error occurred while fetching Markdown'];
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="pt-10 space-y-4 page" in:fade>
	<h1 class="text-3xl">Scrape Oztix Links with Jina</h1>

	<input type="text" class="w-full p-2 border rounded" {placeholder} bind:value={url} />

	<button
		on:click={fetchMarkdown}
		class="px-4 py-2 text-white bg-blue-500 rounded btn hover:bg-blue-600"
		disabled={isLoading}
	>
		{isLoading ? 'Fetching...' : 'Find Oztix Links'}
	</button>

	{#if oztixLinks.length > 0}
		<div class="mt-4">
			<h2 class="mb-2 text-xl">Found Oztix Links:</h2>
			<ul class="pl-5 space-y-2 list-disc">
				{#each oztixLinks as link}
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
	{:else if markdown}
		<p>No Oztix links found in the content</p>
	{/if}
</div>

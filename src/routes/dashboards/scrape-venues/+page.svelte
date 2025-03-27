<script lang="ts">
	import { fade, slide } from 'svelte/transition';

	let markdown = '';
	let oztixLinks: string[] = [];
	let urlPlaceholder = 'enter url';
	let url = '';

	let regexPlaceholder = 'enter regex';
	let regex;
	let isLoading = false;

	async function fetchMarkdown() {
		try {
			isLoading = true;

			if (!regex || !url) return;

			// Prepend r.jina.ai/ to the URL
			const jinaUrl = `https://r.jina.ai/${url}`;
			const res = await fetch(jinaUrl);
			if (!res.ok) throw new Error('Failed to fetch Markdown');
			markdown = await res.text();

			// Extract Oztix links using regex
			const regexObj = new RegExp(regex, 'g');
			console.log('regex: ', regex);

			oztixLinks = [...new Set(markdown.match(regexObj) || [])]; // Remove duplicates with Set
		} catch (error) {
			console.error('Error fetching Markdown:', error);
			oztixLinks = ['Error occurred while fetching Markdown'];
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="!items-start pt-10 space-y-4 page" in:fade>
	<h1 class="text-3xl">Scrape Oztix Links with Jina</h1>

	<label for="url">URL</label>
	<input
		type="text"
		class="w-full p-2 border rounded"
		placeholder={urlPlaceholder}
		bind:value={url}
	/>
	<label for="regex">Regex Pattern</label>
	<input
		type="text"
		class="w-full p-2 border rounded"
		placeholder={regexPlaceholder}
		bind:value={regex}
	/>

	{#if url && regex}
		<button on:click={fetchMarkdown} class="w-full btn" disabled={isLoading} in:slide>
			{isLoading ? 'Fetching...' : 'Find Oztix Links'}
		</button>
	{/if}

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

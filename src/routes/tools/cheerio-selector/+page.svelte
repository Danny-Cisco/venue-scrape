<script>
	import { fade } from 'svelte/transition';
	import CopyClipboard from '$lib/components/ui/CopyClipboard.svelte';
	let input;
	let output;
	let copied = false;

	const cheerioEndpoints = [
		'gem-gig',
		'gem-links',
		'oztix-json',
		'tote-links',
		'moshtix-json',
		'moshtix-venue',
		'moshtix-venueUrls-to-gigs',
		'oztix-venueName-to-gigs',
		'humanitix-json',
		'eventbrite-json',
		'eventbrite-organiser-to-gigs',
		'eventbrite-organiser-to-urls',
		'john-curtain-links',
		'linktree-profile-pic',
		'linktree-links',
		'linktree-links-all'
	];

	async function useCheerio(endpoint) {
		copied = false;
		try {
			const res = await fetch(`/api/cheerio/${endpoint}?url=${encodeURIComponent(input)}`);
			if (res.ok) {
				const json = await res.json();
				output = JSON.stringify(json, null, 2);
			} else {
				const errText = await res.text();
				output = `Error ${res.status}: ${errText}`;
			}
		} catch (err) {
			output = `Network error: ${err.message}`;
		}
	}
</script>

<div class="mb-4 space-y-4 page" in:fade>
	<h1>Run Cheerio Scraper</h1>

	<input type="text" class="w-full" bind:value={input} placeholder="Enter URL..." />

	<div class="flex flex-wrap gap-4">
		{#each cheerioEndpoints as endpoint}
			<button class="btn" on:click={() => useCheerio(endpoint)}>
				{endpoint.replace(/-/g, ' ')}
			</button>
		{/each}
	</div>
</div>

<div class="w-full p-4 bg-white/15 rounded-xl">
	<div class="flex items-center justify-between mb-2">
		<h1>OUTPUT GOES HERE:</h1>
		<CopyClipboard text={output} {copied} />
	</div>
	{#if output}
		<div class="w-full my-8 border-t border-dashed"></div>
		<pre class="whitespace-pre-wrap">{output}</pre>
	{/if}
</div>

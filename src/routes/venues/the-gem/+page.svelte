<script>
	import { fade } from 'svelte/transition';
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';
	import GigCard from '../../../lib/components/ui/GigCard.svelte';
	let venueName = 'The Gem';
	let readOut = '😎 Ready to begin';
	let loading = false;

	let links = [];
	let gigs = [];

	let regex = /https?:\/\/www\.thegembar\.com\.au\/gigs\/[\w\-0-9]+/gi;
	let tixUrlRegex = /https?:\/\/tickets.oztix.com.au[\w\-0-9\/]+/gi;

	let output = '';

	let gigObj = {
		tixUrl: '',
		venue: 'The Gem',
		eventName: '',
		eventDescription: '',
		markdown: ''
	};

	let url = 'https://www.thegembar.com.au/';

	async function getLinks() {
		loading = true;
		readOut = '✋ Cheerio is finding links';

		const res = await fetch(`/api/cheerio/gem-links?url=${url}`);

		if (!res.ok) {
			readOut = await res.text();
			throw new Error('Cheerio failed to fetch Links');
		}

		const json = await res.json(); // ✅ this is already your array

		output = JSON.stringify(json, null, 2); // ✅ this is just for visual logging or display

		// ✅ assign json directly to links
		links = [...new Set(json)];

		loading = false;
		readOut = '✅ Done';
		crawlGemGigs();
	}

	async function useCheerio(link) {
		// copied = false;
		try {
			const res = await fetch(`/api/cheerio/gem-gig?url=${link}`);

			if (res.ok) {
				const json = await res.json();
				return json;
			} else {
				const errText = await res.text();
				readOut = `Error ${res.status}: ${errText}`;
			}
		} catch (err) {
			readOut = `Network error: ${err.message}`;
		}
	}

	async function crawlGemGigs() {
		loading = true;
		if (links.length === 0) return;
		for (const link of links) {
			readOut = `✋ Cheerio is fetching :   ${link}`;

			const gig = await useCheerio(link);

			gigs = [...gigs, gig];
		}
		readOut = '✅ Done';
		loading = false;
	}

	async function getGig(link) {
		const jinaLink = 'https://r.jina.ai/' + link;
		const res = await fetch(jinaLink);
		if (res.ok) {
			return await res.text();
		} else {
			output = 'Failed to get gig';
			return;
		}
	}

	async function getTixUrl(markdown) {
		return markdown.match(tixUrlRegex) || '';
	}
</script>

<div class="page">
	<div class="w-screen text-center bg-gradient-to-br from-purple-500 to-pink-500">
		<h1
			class="mt-4 mb-4 text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl"
		>
			{venueName}
		</h1>
	</div>

	<div class="flex flex-col items-center w-screen p-10 text-center h-[100px] bg-black">
		{#key readOut}
			<div class="h-[2rem] flex items-center overflow-hidden max-w-full" in:fade>
				{readOut}
			</div>
		{/key}
	</div>

	<div class="w-screen bg-black h-[200px] py-4 overflow-y-auto">
		{#if links.length > 0}
			<div class="flex flex-col items-start max-w-4xl mx-auto min-w-4xl">
				{#each links as link}
					<p>
						{link}
					</p>
				{/each}
			</div>
			<!-- <button class="w-full btn" on:click={crawlGemGigs}>Crawl Gigs</button> -->
		{/if}
	</div>

	<button
		class="w-full max-w-xl my-4 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-purple-800"
		on:click={getLinks}
	>
		<span
			class="relative px-5 py-2.5 transition-all ease-in duration-75 w-full bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent"
		>
			{#if loading}<PacMan />{:else}
				<div in:fade={{ delay: 700, duration: 300 }}>START</div>{/if}
		</span>
	</button>

	<!-- <h1>JINA OUT</h1>
	<div>{output}</div> -->

	{#if gigs.length > 0}
		<div class="w-screen">
			<div class="flex flex-wrap justify-center gap-4 mx-auto">
				{#each gigs as gig}
					<div class="max-w-[400px] min-w-[400px] min-h-[200px]">
						<GigCard {gig} />
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

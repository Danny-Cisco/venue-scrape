<script>
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';
	import GigCard from '../../../lib/components/ui/GigCard.svelte';
	let venueName = 'The Gem';
	let readOut = 'Ready to begin';
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
		readOut = 'cheerio fetching links';

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
		readOut = 'Done';
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
			readOut = `cheerio fetching ${link}`;

			const gig = await useCheerio(link);

			gigs = [...gigs, gig];
		}
		readOut = 'Done';
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

<div class="space-y-4 page">
	<h1 class="text-5xl font-bold text-center">
		{venueName}
	</h1>
	<div class="flex flex-col items-center w-full p-10 text-center rounded-3xl bg-white/5">
		{readOut}{#if loading}<PacMan />{/if}
	</div>
	<button class="w-full btn" on:click={getLinks}>START</button>
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
		<!-- <button class="w-full btn" on:click={crawlGemGigs}>Crawl Gigs</button> -->
	{/if}

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

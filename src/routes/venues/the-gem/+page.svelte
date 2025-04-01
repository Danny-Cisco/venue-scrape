<script>
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';
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

	async function crawlGemGigs() {
		loading = true;
		if (links.length === 0) return;
		for (const link of links) {
			readOut = `fetching ${link}`;
			const markdown = await getGig(link);
			const tixUrl = await getTixUrl(markdown);

			let gig = {
				tixUrl,
				venue: 'The Gem',
				eventName: '', // You could extract this from markdown if needed
				eventDescription: '', // Same here
				markdown
			};

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
		<button class="w-full btn" on:click={crawlGemGigs}>Crawl Gigs</button>
	{/if}

	{#if gigs.length > 0}
		<div>
			<h1>GIGS</h1>
			{#each gigs as gig}
				<div class="flex flex-col gap-10">
					<p class="p-4 border rounded">
						{gig.markdown}
					</p>

					{#if !gig.tixUrl}
						<p>FREE GIG??</p>
					{:else}
						<p class>{gig.tixUrl}</p>

						<a class="btn" href={gig.tixUrl}>{gig.tixUrl}</a>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

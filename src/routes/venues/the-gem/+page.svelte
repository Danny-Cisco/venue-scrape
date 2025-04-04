<script>
	import { fade } from 'svelte/transition';
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';
	import GigCard from '../../../lib/components/ui/GigCard.svelte';
	import { interpolateViridis } from 'd3';
	let venueName = 'The Gem';
	let readOut = '😎 Ready to begin';
	let loading = false;

	let links = [];
	let gigs = [];

	let activeTab = 'gigs'; // or 'bands'

	let bands = [];

	let lastClicked = {};
	let showGigModal = false;

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

	function handleRowClick(gig) {
		lastClicked = gig;
		showGigModal = true;
	}

	async function getBands(question) {
		const systemPrompt =
			' You are to act as a simple tool. extract all the bands from the following information and return as a json array. do not enclose in any backticks, just the json array in the following format { "bands": [] }';

		loading = true;
		const parsedBody = await JSON.stringify({ question, systemPrompt });
		const response = await fetch('/api/openai/qabot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: parsedBody
		});

		const data = await response.json();
		const responseJson = data.answer;

		const finalJson = await JSON.parse(responseJson);

		bands = [...bands, ...(finalJson.bands || [])];
		loading = false;
	}

	$: console.log('bands: ', bands);

	$: if (gigs.length > 0) {
		const lastGig = gigs[gigs.length - 1];
		const question = lastGig.title + lastGig.description;
		getBands(question);
	}
</script>

<div class="page">
	<!-- header with gradient -->
	<div class="w-screen text-center bg-gradient-to-br from-purple-500 to-pink-500">
		<h1
			class="mt-4 mb-4 text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl"
		>
			{venueName}
		</h1>
	</div>

	<!-- upper section of output -->
	<div class="flex flex-col items-center w-screen p-10 text-center h-[100px] bg-black">
		{#key readOut}
			<div class="h-[2rem] flex items-center overflow-hidden max-w-full" in:fade>
				{readOut}
			</div>
		{/key}
	</div>

	<!-- lower section of output -->
	<div class="w-screen bg-black h-[200px] py-4 overflow-y-auto">
		{#if links.length > 0}
			<div class="flex flex-col items-start max-w-4xl mx-auto min-w-4xl">
				{#each links as link}
					<p>
						{link}
					</p>
				{/each}
			</div>
			<div class="flex flex-col items-start max-w-4xl mx-auto min-w-4xl">
				{#each bands as band}
					<p>
						{band}
					</p>
				{/each}
			</div>
			<!-- <button class="w-full btn" on:click={crawlGemGigs}>Crawl Gigs</button> -->
		{/if}
	</div>
	<div class="flex items-center w-screen my-10">
		<!-- dotted divider -->
		<div class="border-b-[3px] border-dotted border-purple-500 w-full"></div>
		<!-- start button -->
		<div class="w-full max-w-xl min-w-xl center">
			<button
				class="w-full max-w-xl mt-2 relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-purple-800"
				on:click={getLinks}
			>
				<span
					class="relative px-5 py-2.5 transition-all h-[3rem] row items-center justify-center ease-in duration-75 w-full bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent"
				>
					{#if loading}
						<div class="relative w-full h-full">
							<div class="absolute inset-0 center">
								<PacMan />
							</div>
						</div>
					{:else}
						<div class="absolute inset-0 font-bold center" in:fade={{ delay: 700, duration: 300 }}>
							START
						</div>{/if}
				</span>
			</button>
		</div>

		<!-- dotted divider -->
		<div class="border-b-[3px] border-dotted border-purple-500 w-full"></div>
	</div>

	<!-- <h1>JINA OUT</h1>
	<div>{output}</div> -->

	<!-- Tab buttons -->
	<div class="flex justify-center w-screen space-x-1 px-14">
		<button
			class="flex-1 px-4 py-2 font-medium transition-all duration-200 border-[1px] border-b-0 rounded-t-2xl overflow-hidden relative group"
			class:!bg-purple-600={activeTab === 'gigs'}
			class:!text-white={activeTab === 'gigs'}
			class:bg-gray-800={activeTab !== 'gigs'}
			class:text-gray-300={activeTab !== 'gigs'}
			class:invisible={gigs.length === 0}
			on:click={() => (activeTab = 'gigs')}
			in:fade
		>
			<!-- Gradient hover background -->
			<span
				class="absolute inset-0 z-0 transition-opacity duration-200 opacity-0 bg-gradient-to-br from-purple-500 to-pink-500 group-hover:opacity-100 rounded-t-2xl"
			></span>
			<!-- Text layer -->
			<span class="relative z-10">Gigs</span>
		</button>

		<button
			class="flex-1 px-4 py-2 font-medium transition-all duration-200 border-[1px] border-b-0 rounded-t-2xl overflow-hidden relative group"
			class:!bg-pink-600={activeTab === 'bands'}
			class:!text-white={activeTab === 'bands'}
			class:bg-gray-800={activeTab !== 'bands'}
			class:text-gray-300={activeTab !== 'bands'}
			class:invisible={bands.length === 0}
			on:click={() => (activeTab = 'bands')}
			in:fade
		>
			<!-- Gradient hover background -->
			<span
				class="absolute inset-0 z-0 transition-opacity duration-200 opacity-0 bg-gradient-to-br from-purple-500 to-pink-500 group-hover:opacity-100 rounded-t-2xl"
			></span>
			<!-- Text layer -->
			<span class="relative z-10">Bands</span>
		</button>
	</div>

	{#if activeTab === 'gigs' && gigs.length > 0}
		<div class="w-screen px-4 overflow-x-auto" in:fade>
			<table class="min-w-full overflow-hidden table-auto rounded-xl">
				<thead class="text-left bg-black border-b-[2px] border-white">
					<tr>
						<th class="px-4 py-2">Title</th>
						<th class="px-4 py-2">Date</th>
						<th class="px-4 py-2">Time</th>
						<th class="px-4 py-2">Description</th>
						<th class="px-4 py-2">Image</th>
						<th class="px-4 py-2">Ticket Price</th>
						<th class="px-4 py-2">Ticket Link</th>
						<th class="px-4 py-2">Sold Out</th>
					</tr>
				</thead>
				<tbody>
					{#each gigs as gig}
						<tr
							class="hover:bg-gray-900 max-h-[2.5rem] rowfx text-xs font-light text-gray-300 hover:text-white border-b-[1px] border-gray-500 overflow-hidden"
							on:click={handleRowClick(gig)}
						>
							<td class="px-4 py-2">{gig.title}</td>
							<td class="px-4 py-2">{gig.date}</td>
							<td class="px-4 py-2">{gig.time}</td>
							<td class="px-4 py-2 text-xs">{gig.description}</td>
							<td class="px-4 py-2">
								{#if gig.imageUrl}
									<img src={gig.imageUrl} alt="Gig Image" class="object-cover w-20 h-20 rounded" />
								{:else}
									<span class="text-sm italic text-gray-400">No image</span>
								{/if}
							</td>
							<td class="px-4 py-2">{gig.ticketPrice}</td>
							<td class="px-4 py-2">
								{#if gig.ticketUrl}
									<a
										href={gig.ticketUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 underline">Buy Ticket</a
									>
								{:else}
									<span class="text-sm italic text-gray-400">N/A</span>
								{/if}
							</td>
							<td class="px-4 py-2">{gig.soldOut}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if activeTab === 'bands' && bands.length > 0}
		<div class="w-screen px-4 overflow-x-auto" in:fade>
			<table class="min-w-full overflow-hidden table-auto rounded-xl">
				<thead class="text-left bg-black border-b-[2px] border-white">
					<tr>
						<th class="px-4 py-2">Band Name</th>
					</tr>
				</thead>
				<tbody>
					{#each bands as band}
						<tr
							class="hover:bg-gray-900 rowfx text-xs font-light text-gray-300 hover:text-white border-b-[1px] border-gray-500"
						>
							<td class="px-4 py-2">{band}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if showGigModal && lastClicked}
	<div
		class="fixed inset-0 top-[100px] flex flex-col items-center justify-center bg-black/80"
		transition:fade={{ duration: 100 }}
	>
		<div class="relative h-full">
			<GigCard gig={lastClicked} />
			<div
				class="absolute top-0 bg-purple-500 rounded-full size-8 center hover:bg-pink-500 -right-10"
				on:click={() => {
					showGigModal = false;
					lastClicked = null;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</div>
		</div>
	</div>
{/if}

<style>
	.rowfx {
		transition: color, 200ms;
	}
</style>

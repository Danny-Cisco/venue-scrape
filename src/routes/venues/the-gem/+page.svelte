<script>
	import { fade } from 'svelte/transition';
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';

	import { lastClicked, showGigModal, showBandModal } from '$lib/stores/modalStores.js';

	let venueName = 'The Gem';
	let readOut = '😎 Ready to begin';
	let loading = false;

	let links = [];
	let gigs = [];

	let socialUrls = [];

	let activeTab = 'gigs'; // or 'bands'

	let bands = [];

	let regex = /https?:\/\/www\.thegembar\.com\.au\/gigs\/[\w\-0-9]+/gi;
	let tixUrlRegex = /https?:\/\/tickets.oztix.com.au[\w\-0-9\/]+/gi;

	let instaProfileRegex = /https:\/\/www\.instagram\.com\/(?!reel\/)[\w\.\-]+\/?/gi;

	let output = '';

	let gigObj = {
		tixUrl: '',
		venue: 'The Gem',
		eventName: '',
		eventDescription: '',
		markdown: ''
	};

	let url = 'https://www.thegembar.com.au/gigs';

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
		console.log('👀👀🤖🥸 ~ getLinks ~ 🔥output:', output);

		// ✅ assign json directly to links
		links = [...new Set(json)];
		console.log('👀👀🤖🥸 ~ getLinks ~ links:', links);

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

	async function getOztix(link) {
		readOut = `✋ Cheerio is scraping Oztix event : ${link}`;

		// copied = false;
		try {
			const res = await fetch(`/api/cheerio/oztix?url=${link}`);

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
			gig.bands = []; // add some blank fields ready for the ui
			gig.bios = []; // add some blank fields ready for the ui
			gig.instaCaptions = []; // add some blank fields ready for the ui
			gig.instaHashtags = []; // add some blank fields ready for the ui
			gig.oztix = {};
			if (gig.ticketUrl != '#' || false) {
				gig.oztix = await getOztix(gig.ticketUrl);
			}

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

	function handleGigRowClick(gig) {
		$lastClicked = gig;
		$showGigModal = true;
	}

	function handleBandRowClick(band) {
		$lastClicked = band;
		$showBandModal = true;
	}

	async function getBands(question, gigIndex) {
		console.log('🍄 ~ getBands ~ question:', question);
		const systemPrompt =
			' You are to act as a simple tool. extract all the bands from the following information and return as a json array. do not enclose in any backticks, just the json array in the following format { "bands": [] }';

		loading = true;
		readOut = '😛 ChatGPT is finding band names';
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

		for (const band of finalJson.bands) {
			let bandObject = { bandName: band, socialUrls: await getSocialUrls(band) };
			// let bandObject = { bandName: band, socialUrls: ['perplexity disabled'] };
			console.log('🚀✅ ~ getBands ~ bandObject.socialUrls:', bandObject.socialUrls); // lets peek at the socialUrls here

			for (const url of bandObject.socialUrls) {
				if (url.match(instaProfileRegex)) {
					bandObject.instagram = await scrapeInsta(url);
					gigs[gigIndex].bios = [...(gigs[gigIndex].bios || []), bandObject.instagram.biography]; // spread bios into gig
					gigs[gigIndex].instaCaptions = [
						...(gigs[gigIndex]?.instaCaptions || []),
						...bandObject.instagram.latestPosts.map((post) => post.caption)
					];
					gigs[gigIndex].instaHashtags = [
						...(gigs[gigIndex]?.instaHashtags || []),
						...bandObject.instagram.latestPosts.map((post) => post.hashtags).flat() // use flat to turn array of arrays into a single array
					];
				}
			}

			bands = [...bands, bandObject || {}];
		}

		readOut = '✅ Done!';
		loading = false;

		return finalJson.bands;
	}

	async function scrapeInsta(url) {
		loading = true;
		console.log('👀👀👀 scrapeInsta function has url:', url);

		const instaUsernameRegex = /https:\/\/www\.instagram\.com\/([a-zA-Z0-9_.]+)\/?(?!.*reel)/i;
		const match = url.match(instaUsernameRegex);

		if (!match || !match[1]) {
			console.error('❌ No valid Instagram username found in URL.');
			return;
		}

		const username = match[1]; // ← This is the captured username
		console.log('✅ Extracted username:', username);
		readOut = `✌️ Apify is scraping Instagram profile: ${username}`;

		const response = await fetch(`/api/apify/instagram-profile-scraper?username=${username}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();
		console.log('🌼 Received data:', data);

		loading = false;
		readOut = '✅ Done!';
		return data.data[0];
	}

	async function getSocialUrls(bandName) {
		const systemPrompt =
			' You are to act as a simple tool to return as a json array of social media links in the following format { "socialUrls": []}, do not say anything else. do not enclose the result in backticks';
		loading = true;

		readOut = `💀 Perplexity is finding social media links for ${bandName}`;

		const prompt = `what are all the social media links you can find for the band called ${bandName}.`;
		const parsedBody = await JSON.stringify({ prompt, systemPrompt });
		const response = await fetch('/api/perplexity/sonar-pro', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: parsedBody
		});

		const body = await response.json();
		console.log('🚀 ~ getSocialUrls ~ body.message:', body.message);

		// Remove ```json or ``` and trim the string
		const cleanMessage = body.message
			.replace(/^```json\s*/i, '') // Remove starting ```json (case-insensitive)
			.replace(/^```\s*/i, '') // Or just ```
			.replace(/```$/, '') // Remove ending ```, at end of string
			.trim();

		let socialUrls = [];
		try {
			const json = JSON.parse(cleanMessage);
			socialUrls = json.socialUrls || [];
			console.log('🚀 ~ getSocialUrls ~ socialUrls:', socialUrls);
		} catch (err) {
			console.error('❌ Failed to parse message as JSON:', err);
		}

		loading = false;
		readOut = '✅ Done';
		return socialUrls || [];
	}

	$: console.log('bands: ', bands);

	let lastGigIndex = 0;
	let commencedIndexGetBands = 99999;

	$: console.log('🚀 ~ lastGigIndex:', lastGigIndex);
	$: console.log('🚀 ~ gigs:', gigs);

	async function updateBandForLastGig() {
		commencedIndexGetBands = lastGigIndex;
		console.log('🚀 ~ updateBandForLastGig ~ commencedIndexGetBands:', commencedIndexGetBands);
		const lastGig = gigs[commencedIndexGetBands];
		const question = lastGig.title + lastGig.description;
		gigs[commencedIndexGetBands].bands = await getBands(question, commencedIndexGetBands);
	}

	$: if (gigs.length > 0) {
		lastGigIndex = gigs.length - 1 || 0;
		// checks first to see if the job is already commenced
		if (commencedIndexGetBands !== lastGigIndex)
			if (gigs[lastGigIndex].bands.length == 0) updateBandForLastGig();
	}
</script>

<div class="page isolate">
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
						{band.bandName}
						{band.socialUrls}
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
						<th class="px-4 py-2">Bands</th>
						<th class="px-4 py-2">Description</th>
						<th class="px-4 py-2">Bios</th>
						<th class="px-4 py-2">InstaCaptions</th>
						<th class="px-4 py-2">InstaHashtags</th>
						<th class="px-4 py-2">Image</th>
						<th class="px-4 py-2">Ticket Price</th>
						<th class="px-4 py-2">Ticket Link</th>
						<th class="px-4 py-2">Oztix</th>
						<th class="px-4 py-2">Sold Out</th>
					</tr>
				</thead>
				<tbody>
					{#each gigs as gig}
						<tr
							class="hover:bg-gray-900 rowfx text-xs font-light text-gray-300 hover:text-white border-b-[1px] border-gray-500"
							on:click={handleGigRowClick(gig)}
						>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">{gig.title}</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">{gig.date}</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">{gig.time}</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">
									{#if gig.bands?.length > 0}
										{#each gig.bands || [] as band}
											<div class="block">{band}</div>
										{/each}
									{/if}
								</div>
							</td>
							<td class="px-4 py-2 text-xs">
								<div class="max-h-[200px] overflow-y-auto">{gig.description}</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">
									{#if gig.bios?.length > 0}
										{#each gig.bios || [] as bio}
											<div class="block">{bio}</div>
										{/each}
									{/if}
								</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">
									{#if gig.instaCaptions?.length > 0}
										{#each gig.instaCaptions || [] as caption}
											<div class="block">{caption}</div>
										{/each}
									{/if}
								</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">
									{#if gig.instaHashtags?.length > 0}
										{#each gig.instaHashtags || [] as hashtag}
											<div class="block">{hashtag}</div>
										{/each}
									{/if}
								</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">
									{#if gig.imageUrl}
										<img
											src={gig.imageUrl}
											alt="Gig Image"
											class="object-cover w-20 h-20 rounded"
										/>
									{:else}
										<span class="text-sm italic text-gray-400">No image</span>
									{/if}
								</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">{gig.ticketPrice}</div>
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">
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
								</div>
							</td>
							<td class="px-4 py-2">
								{#if gig.oztix}
									<div class="max-h-[200px] overflow-y-auto">
										{JSON.stringify(gig.oztix, null, 2)}
									</div>
								{/if}
							</td>
							<td class="px-4 py-2">
								<div class="max-h-[200px] overflow-y-auto">{gig.soldOut}</div>
							</td>
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
						<th class="px-4 py-2">Social Urls</th>
						<th class="px-4 py-2">FurtherUrls</th>
					</tr>
				</thead>
				<tbody>
					{#each bands as band}
						<tr
							class="hover:bg-gray-900 rowfx text-xs font-light text-gray-300 hover:text-white border-b-[1px] border-gray-500"
							on:click={handleBandRowClick(band)}
						>
							<td class="px-4 py-2">{band.bandName}</td>
							<td class="px-4 py-2">
								{#each band.socialUrls || [] as socialUrl}
									<div class="flex flex-col">
										{socialUrl}
									</div>
								{/each}
							</td>
							<td class="px-4 py-2">
								{#each band.furtherUrls || [] as furtherUrl}
									<div class="flex flex-col">
										{furtherUrl}
									</div>
								{/each}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.rowfx {
		transition: color, 200ms;
	}
</style>

<script>
	import { fade } from 'svelte/transition';
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';

	import GigsBandsTable from '$lib/components/tables/GigsBandsTable.svelte';

	let venueName = 'The Gem';
	let readOut = '😎 Ready to begin';
	let loading = false;

	let links = [];
	let gigs = [];

	let socialUrls = [];

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

	async function beginCrawl() {
		loading = true;
		readOut = '✋ Cheerio is finding links';

		const res = await fetch(`/api/cheerio/gem-links?url=${url}`);

		if (!res.ok) {
			readOut = await res.text();
			throw new Error('Cheerio failed to fetch Links');
		}

		const json = await res.json(); // ✅ this is already your array

		output = JSON.stringify(json, null, 2); // ✅ this is just for visual logging or display
		console.log('👀👀🤖🥸 ~ beginCrawl ~ 🔥output:', output);

		// ✅ assign json directly to links
		links = [...new Set(json)];
		console.log('👀👀🤖🥸 ~ beginCrawl ~ links:', links);

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

<div class="page isolate" in:fade>
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
				on:click={beginCrawl}
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

	<GigsBandsTable {gigs} {bands} />
</div>

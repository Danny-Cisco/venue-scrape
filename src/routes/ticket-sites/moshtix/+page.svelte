<script>
	import { fade } from 'svelte/transition';
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';

	import GigsBandsTable from '$lib/components/tables/GigsBandsTable.svelte';
	import { genreClassifier, bandnameExtractor } from '$lib/utils/prompts';
	import { gigsFuzzyDupeCheckWithUpdate } from '$lib/utils/supabase.js';

	import { convertStringToDatetime } from '$lib/utils/date.ts';
	import { readonly } from 'svelte/store';

	let readOut = '😎 Ready to begin';
	let loading = false;

	let links = [];
	let gigs = [];

	let bands = [];

	let instaProfileRegex = /https:\/\/www\.instagram\.com\/(?!reel\/)[\w\.\-]+\/?/gi;

	let output = '';

	let venueId = '';

	let venues = [
		{
			name: 'Bad Decisions',
			id: '037c86b9-386d-404d-a124-f48dfe41ddca',
			moshtix: 'https://www.moshtix.com.au/v2/venues/bad-decisions-bar/8683'
		},
		{
			name: 'The Toff',
			id: 'd15de333-dc11-43e0-a468-4b285cf32390',
			moshtix: 'https://www.moshtix.com.au/v2/venues/the-toff-in-town-melbourne/1007'
		}
	];

	let urls = venues.map((venue) => venue.moshtix); // this turns the venues oblect into the urls list i need

	// async function beginCrawl() {
	// 	loading = true;

	// 	// venueId = await softMatchVenueName(venueName); // THIS IS A MULTI VENUE PAGE, CANNOT GET ID FIRST

	// 	readOut = '✋ Cheerio is finding links';

	// 	const res = await fetch(`/api/cheerio/gem-links?url=${url}`);

	// 	if (!res.ok) {
	// 		readOut = await res.text();
	// 		throw new Error('Cheerio failed to fetch Links');
	// 	}

	// 	const json = await res.json(); // ✅ this is already your array

	// 	output = JSON.stringify(json, null, 2); // ✅ this is just for visual logging or display
	// 	console.log('👀👀🤖🥸 ~ beginCrawl ~ 🔥output:', output);

	// 	// ✅ assign json directly to links
	// 	links = [...new Set(json)];
	// 	console.log('👀👀🤖🥸 ~ beginCrawl ~ links:', links);

	// 	loading = false;
	// 	readOut = '✅ Done!';
	// 	crawlGemGigs();
	// }

	async function beginCrawl() {
		loading = true;
		let result = null;
		// error = null;

		readOut = 'Begin Crawl!';

		try {
			readOut = '✅ Collecting all gigs from provided Moshtix urls';
			const res = await fetch('/api/cheerio/moshtix-venueUrls-to-gigs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ urls })
			});

			if (!res.ok) {
				throw new Error(`Error ${res.status}: ${await res.text()}`);
			}

			result = await res.json();
			console.log('✅BOOP✅ ~ fetchTicketLinks ~ result:', result);

			let knownIdsCache = []; // { venue, id }

			for (const gig of result.gigs) {
				console.log('gig.venue: ', gig.venue);
				console.log('knownIdsCache: ', knownIdsCache);
				// Check cache with strict string match
				const cached = knownIdsCache.find((entry) => entry.input === gig.venue);
				console.log('🚀 ~ beginCrawl ~ cached:', cached);

				let venue;

				if (cached) {
					// Use cached venue
					venue = { id: cached.id, name: cached.venue };
				} else {
					// Not cached — run the soft match
					venue = await softMatchVenueName(gig.venue);
					knownIdsCache.push({ venue: venue.name, id: venue.id, input: gig.venue });
				}

				// Assign matched venue info
				gig.venueId = venue.id;
				gig.venue = venue.name;

				// Prepare UI fields
				gig.bandObjects = [];
				gig.bios = [];
				gig.instaCaptions = [];
				gig.instaHashtags = [];
			}

			gigs = result.gigs;
		} catch (err) {
			console.log('🚀 ~ beginCrawl ~ err.message:', err.message);
		} finally {
			loading = false;
		}
	}

	// HEY I SHOULD ALREADY HAVE THE ID NUMBERS FOR THE VENUES

	async function softMatchVenueName(scrapedName) {
		readOut = `🧠 finding soft match venue_id for : ${scrapedName}`;

		loading = true;
		// resultMatch = '';
		const res = await fetch('/api/supabase/venue-name-match', {
			method: 'POST',
			body: JSON.stringify({ scrapedName }),
			headers: { 'Content-Type': 'application/json' }
		});

		const data = await res.json();
		console.log('🚀 ~ softMatchVenueName ~ data:', data);
		// resultMatch = data.match || data.error;
		// resultId = data.venue_id;
		loading = false;
		console.log('🚀 ~ softMatchVenueName ~ data.venue_id:', data.venue_id);

		readOut = `✅ found match: ${data.match}`;

		return { id: data.venue_id, name: data.match };
	}

	// async function useCheerio(link) {
	// 	// copied = false;
	// 	try {
	// 		const res = await fetch(`/api/cheerio/gem-gig?url=${link}`);

	// 		if (res.ok) {
	// 			const json = await res.json();
	// 			return json;
	// 		} else {
	// 			const errText = await res.text();
	// 			readOut = `Error ${res.status}: ${errText}`;
	// 		}
	// 	} catch (err) {
	// 		readOut = `Network error: ${err.message}`;
	// 	}
	// }

	// async function crawlGemGigs() {
	// 	loading = true;

	// 	if (links.length === 0) return;
	// 	for (const link of links) {
	// 		readOut = `✋ Cheerio is fetching :   ${link}`;

	// 		const gig = await useCheerio(link);
	// 		gig.startDate = convertStringToDatetime(gig.date, gig.time);
	// 		gig.venue = venueName;
	// 		gig.venueId = venueId;
	// 		gig.bands = []; // add some blank fields ready for the ui
	// 		gig.bios = []; // add some blank fields ready for the ui
	// 		gig.instaCaptions = []; // add some blank fields ready for the ui
	// 		gig.instaHashtags = []; // add some blank fields ready for the ui
	// 		gig.oztix = {};
	// 		if (gig.ticketUrl != '#' || false) {
	// 			gig.oztix = await getOztix(gig.ticketUrl);
	// 		}

	// 		gigs = [...gigs, gig];
	// 	}
	// 	readOut = '✅ Done!';
	// 	loading = false;
	// }

	async function getGenres(gig) {
		const systemPrompt = genreClassifier;
		const question = gig.description + gig.bios + gig.tags + gigs.oztix + gigs.instaCaptions; // look into this more

		// fetch from openai qa endpoint

		loading = true;
		readOut = '🤪 ChatGPT is genre classifying a gig...';

		const jsonBody = await JSON.stringify({ question, systemPrompt });
		const response = await fetch('/api/openai/qabot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application./json'
			},
			body: jsonBody
		});

		const data = await response.json();
		const answerJson = data.answer;
		const genres = await JSON.parse(answerJson);
		console.log('✅🚀✅ ~ getGenres ~ genres:', genres);

		// recieve a json with a field called genres

		return genres;
	}

	async function getBands(question, gigIndex) {
		console.log('🍄 ~ getBands ~ question:', question);
		const systemPrompt = bandnameExtractor;

		loading = true;
		readOut = '😛 ChatGPT is finding band names';
		const jsonBody = await JSON.stringify({ question, systemPrompt });
		const response = await fetch('/api/openai/qabot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: jsonBody
		});

		const data = await response.json();
		const responseJson = data.answer;

		const finalJson = await JSON.parse(responseJson);
		let bandObjects = [];
		let followersTotal = 0;

		for (const band of finalJson.bands) {
			let bandObject = band;

			if (!bandObject.instagram) {
				const socialUrls = await getInstagramUrl(bandObject.bandname);
			} else {
				const socialUrls = [...socialUrls, bandObject.instagram];
			}

			// let bandObject = { bandname: band, socialUrls: ['perplexity disabled'] };
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

					followersTotal = followersTotal + bandObject.instagram.followersCount; // this is working... but why is the bandObject not saving the instagram?
				}

				bandObjects = [...bandObjects, bandObject || {}];
			}

			bands = [...bands, bandObject || {}];

			// HERE IS WHERE I CAN SAVE THE bandObject TO THE BANDS SUPABASE note... bands wont have a genre here
		}

		gigs[gigIndex].followers = followersTotal;

		if (gigs[gigIndex].oztix?.tickets?.[0]?.availability !== 'http://shema.org/InStock') {
			gigs[gigIndex].soldout = true;
		}

		// HERE IS WHERE I CAN ASK CHAT GPT FOR THE GENRES USING gigs[gigIndex] ... getGenres is for a gig, not a band
		const genreObject = await getGenres(gigs[gigIndex]);
		gigs[gigIndex].genres = genreObject.genres;
		gigs[gigIndex].thinking = genreObject.thinking;

		// gigs[gigIndex].bands = finalJson.bands; // fuck it... ill save the bands too
		gigs[gigIndex].bandObjects = bandObjects; // save the whole damn thing in there... an array of bandObjects with instagram data to boot
		console.log('🚀🌼🌼 ~ getBands ~ bandObjects:', bandObjects);
		// HERE IS WHERE I CAN SAVE TO THE GIGS SUPABASE

		await gigsFuzzyDupeCheckWithUpdate(gigs[gigIndex]);

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
		console.log('🌼 Received Instagram data:', data);

		loading = false;
		readOut = '✅ Done!';
		return data.data[0];
	}

	async function getInstagramUrl(bandname) {
		loading = true;

		readOut = `💀 Google is finding Instagram url for ${bandname}`;

		const response = await fetch(
			`/api/google/get-instagram-url?band=${encodeURIComponent(bandname)}`
		);

		const body = await response.json();
		console.log('🚀 ~ getSocialUrls ~ body.message:', body.answer);

		let socialUrls = [];
		try {
			socialUrls = [...socialUrls, body.answer];
			console.log('🚀 ~ getSocialUrls ~ socialUrls:', socialUrls);
		} catch (err) {
			console.error('❌ Failed to parse message as JSON:', err);
		}

		loading = false;
		readOut = '✅ Done!';
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
		gigs[commencedIndexGetBands].bandObjects = await getBands(question, commencedIndexGetBands);
	}

	$: if (gigs.length > 0) {
		lastGigIndex = gigs.length - 1 || 0;
		// checks first to see if the job is already commenced
		if (commencedIndexGetBands !== lastGigIndex)
			if (gigs[lastGigIndex].bandObjects?.length == 0 || undefined) updateBandForLastGig();
	}
</script>

<div class="page isolate" in:fade>
	<!-- upper section of output -->
	<div class="w-screen pt-4 text-lg font-bold text-center uppercase bg-black">Moshtix</div>
	<div class="flex flex-col items-center w-screen p-10 text-center h-[100px] bg-black">
		{#key readOut}
			<div class="h-[2rem] flex items-center text-green-600 overflow-hidden max-w-full" in:fade>
				{readOut}
			</div>
		{/key}
	</div>

	<div class="flex items-center w-screen pb-4 mb-4 bg-black">
		<!-- dotted divider -->
		<div class="border-b-[3px] border-dotted border-purple-500 w-full"></div>
		<!-- start button -->
		<div class="w-full max-w-xl min-w-xl center">
			<button
				class="w-full max-w-xl mt-2 relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium rounded-full group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-purple-800"
				on:click={beginCrawl}
			>
				<span
					class="relative px-5 py-2.5 transition-all h-[3rem] row items-center justify-center ease-in duration-75 w-full bg-gray-900 rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent"
				>
					{#if loading}
						<div class="relative w-full h-full">
							<div class="absolute inset-0 center">
								<PacMan />
							</div>
						</div>
					{:else}
						<div class="absolute inset-0 text-lg center" in:fade={{ delay: 700, duration: 300 }}>
							START
						</div>{/if}
				</span>
			</button>
		</div>

		<!-- dotted divider -->
		<div class="border-b-[3px] border-dotted border-purple-500 w-full"></div>
	</div>

	<GigsBandsTable {gigs} {bands} />
</div>

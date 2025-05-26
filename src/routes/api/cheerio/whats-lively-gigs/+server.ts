import { json } from '@sveltejs/kit';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'url';

const OZTIX_ENDPOINT = '/api/cheerio/oztix-json';
const MOSHTIX_ENDPOINT = '/api/cheerio/moshtix-json';
const EVENTBRITE_ENDPOINT = '/api/cheerio/eventbrite-json';
const HUMANITIX_ENDPOINT = '/api/cheerio/humanitix-json';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, fetch }) {
	const body = await request.json();
	const venueUrls = body.urls;

	if (!Array.isArray(venueUrls) || venueUrls.length === 0) {
		return json({ error: 'Request body must contain a non-empty `urls` array' }, { status: 400 });
	}

	// Group ticket links by venue URL and platform
	const linkBuckets = {};

	// Queue all venue URLs
	const requestQueue = await RequestQueue.open();
	for (const url of venueUrls) {
		await requestQueue.addRequest({ url, uniqueKey: `${url}#${uuidv4()}` });
	}

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			const sourceUrl = request.url;
			console.log(`🔍 Crawling venue: ${sourceUrl}`);

			const scriptTag = $('#__NEXT_DATA__');
			if (!scriptTag.length) return;

			try {
				const jsonData = JSON.parse(scriptTag.text());
				const events = jsonData?.props?.pageProps?.venueEvents ?? [];

				for (const event of events) {
					let ticketUrl = event?.ticket?.original_url ?? event?.ticket?.url;
					if (typeof ticketUrl !== 'string') continue;

					// Normalize URL
					ticketUrl = ticketUrl.trim();

					// Determine platform
					let platform = 'other';
					if (ticketUrl.includes('moshtix.com')) {
						ticketUrl = cleanMoshtixUrl(ticketUrl);
						platform = 'moshtix';
					} else if (ticketUrl.includes('oztix.com')) {
						ticketUrl = cleanOztixUrl(ticketUrl);
						platform = 'oztix';
					} else if (ticketUrl.includes('eventbrite.com')) {
						platform = 'eventbrite';
					} else if (ticketUrl.includes('humanitix.com')) {
						platform = 'humanitix';
					}

					// Initialize nested object
					if (!linkBuckets[sourceUrl]) {
						linkBuckets[sourceUrl] = {
							eventbrite: [],
							humanitix: [],
							moshtix: [],
							oztix: [],
							other: []
						};
					}

					// Deduplicate
					if (!linkBuckets[sourceUrl][platform].includes(ticketUrl)) {
						linkBuckets[sourceUrl][platform].push(ticketUrl);
					}
				}
			} catch (err) {
				console.error(`❌ Failed to parse JSON on ${request.url}:`, err.message);
			}
		}
	});

	await crawler.run();

	// Flatten and batch-send requests by platform
	async function fetchBatch(endpoint, allUrls) {
		const urls = Array.from(new Set(allUrls.flat()));
		if (urls.length === 0) return [];
		try {
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ urls })
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return await res.json();
		} catch (e) {
			console.error(`❌ Failed to fetch batch from ${endpoint}:`, e.message);
			return [];
		}
	}

	// Collect platform-specific URL arrays
	const allOztix = Object.values(linkBuckets).flatMap((b) => b.oztix);
	const allMoshtix = Object.values(linkBuckets).flatMap((b) => b.moshtix);
	const allEventbrite = Object.values(linkBuckets).flatMap((b) => b.eventbrite);
	const allHumanitix = Object.values(linkBuckets).flatMap((b) => b.humanitix);

	const [oztixGigs, moshtixGigs, eventbriteGigs, humanitixGigs] = await Promise.all([
		fetchBatch(OZTIX_ENDPOINT, allOztix),
		fetchBatch(MOSHTIX_ENDPOINT, allMoshtix),
		fetchBatch(EVENTBRITE_ENDPOINT, allEventbrite),
		fetchBatch(HUMANITIX_ENDPOINT, allHumanitix)
	]);

	return json({
		byVenue: linkBuckets,
		oztix: oztixGigs,
		moshtix: moshtixGigs,
		eventbrite: eventbriteGigs,
		humanitix: humanitixGigs
	});
}

function cleanMoshtixUrl(rawUrl) {
	try {
		const urlObj = new URL(rawUrl);
		const innerUrl = urlObj.searchParams.get('u');
		if (innerUrl) return decodeURIComponent(innerUrl);
		return rawUrl;
	} catch {
		return rawUrl;
	}
}

function cleanOztixUrl(rawUrl) {
	try {
		const urlObj = new URL(rawUrl);
		urlObj.searchParams.delete('utm_source');
		urlObj.searchParams.delete('utm_medium');
		urlObj.searchParams.delete('utm_campaign');
		return urlObj.toString();
	} catch {
		return rawUrl;
	}
}

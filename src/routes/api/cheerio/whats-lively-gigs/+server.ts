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

	const linkBuckets = {
		eventbrite: [],
		humanitix: [],
		moshtix: [],
		oztix: [],
		other: []
	};

	const requestQueue = await RequestQueue.open();

	for (const url of venueUrls) {
		await requestQueue.addRequest({ url, uniqueKey: `${url}#${uuidv4()}` });
	}

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			const scriptTag = $('#__NEXT_DATA__');
			if (!scriptTag.length) return;

			try {
				const jsonData = JSON.parse(scriptTag.text());
				const events = jsonData?.props?.pageProps?.venueEvents ?? [];

				for (const event of events) {
					let ticketUrl = event?.ticket?.original_url ?? event?.ticket?.url;
					if (typeof ticketUrl !== 'string') continue;

					if (ticketUrl.includes('moshtix.com')) {
						linkBuckets.moshtix.push(cleanMoshtixUrl(ticketUrl));
					} else if (ticketUrl.includes('oztix.com')) {
						linkBuckets.oztix.push(cleanOztixUrl(ticketUrl));
					} else if (ticketUrl.includes('eventbrite.com')) {
						linkBuckets.eventbrite.push(ticketUrl);
					} else if (ticketUrl.includes('humanitix.com')) {
						linkBuckets.humanitix.push(ticketUrl);
					} else {
						linkBuckets.other.push(ticketUrl);
					}
				}
			} catch (err) {
				console.error(`❌ Failed to parse JSON on ${request.url}:`, err.message);
			}
		}
	});

	await crawler.run();

	// Send a POST batch to each endpoint
	async function fetchBatch(endpoint, urls) {
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

	const [oztixGigs, moshtixGigs, eventbriteGigs, humanitixGigs] = await Promise.all([
		fetchBatch(OZTIX_ENDPOINT, linkBuckets.oztix),
		fetchBatch(MOSHTIX_ENDPOINT, linkBuckets.moshtix),
		fetchBatch(EVENTBRITE_ENDPOINT, linkBuckets.eventbrite),
		fetchBatch(HUMANITIX_ENDPOINT, linkBuckets.humanitix)
	]);

	return json({
		oztix: oztixGigs,
		moshtix: moshtixGigs,
		eventbrite: eventbriteGigs,
		humanitix: humanitixGigs,
		other: linkBuckets.other
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

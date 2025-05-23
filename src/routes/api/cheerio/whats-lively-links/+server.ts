import { json } from '@sveltejs/kit';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'url';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const body = await request.json();
	const venueUrls = body.urls;

	if (!Array.isArray(venueUrls) || venueUrls.length === 0) {
		return json({ error: 'Request body must contain a non-empty `urls` array' }, { status: 400 });
	}

	const result = {
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

					// Clean the ticket URL
					if (ticketUrl.includes('moshtix.com')) {
						ticketUrl = cleanMoshtixUrl(ticketUrl);
						result.moshtix.push(ticketUrl);
					} else if (ticketUrl.includes('oztix.com')) {
						ticketUrl = cleanOztixUrl(ticketUrl);
						result.oztix.push(ticketUrl);
					} else if (ticketUrl.includes('eventbrite.com')) {
						result.eventbrite.push(ticketUrl);
					} else if (ticketUrl.includes('humanitix.com')) {
						result.humanitix.push(ticketUrl);
					} else {
						result.other.push(ticketUrl);
					}
				}
			} catch (err) {
				console.error(`❌ Failed to parse JSON on ${request.url}:`, err.message);
			}
		}
	});

	try {
		await crawler.run();
		return json(result);
	} catch (err) {
		console.error('❌ Crawler failed:', err);
		return json({ error: 'Crawler failed', details: err.message }, { status: 500 });
	}
}

function cleanMoshtixUrl(rawUrl) {
	try {
		const urlObj = new URL(rawUrl);
		const innerUrl = urlObj.searchParams.get('u');
		if (innerUrl) {
			const decoded = decodeURIComponent(innerUrl);
			return decoded;
		}
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

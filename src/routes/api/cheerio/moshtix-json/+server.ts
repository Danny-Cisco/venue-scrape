import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import { moshtixToOztix } from '$lib/utils/gigConvertors.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');
	if (!targetUrl) {
		return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const result = await scrapeAndConvert([targetUrl]);
	return new Response(JSON.stringify(result[0]), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		}
	});
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	let urls;
	try {
		const body = await request.json();
		urls = Array.isArray(body.urls) ? body.urls : [body.url];
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON input' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!urls || urls.length === 0) {
		return new Response(JSON.stringify({ error: 'Missing `url` or `urls` in request body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const result = await scrapeAndConvert(urls);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		}
	});
}

async function scrapeAndConvert(urls) {
	const results = [];
	const requestQueue = await RequestQueue.open();

	for (const url of urls) {
		await requestQueue.addRequest({
			url,
			uniqueKey: `${url}#${uuidv4()}`
		});
	}

	const tempResults = {};

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			const url = request.loadedUrl;
			const scraped = {
				ld_json: null,
				event_details_raw_html: '',
				event_details_text: ''
			};

			// === 1. JSON-LD data extraction ===
			const jsonLdScript = $('#event-structured-data-section script[type="application/ld+json"]');
			if (jsonLdScript.length > 0) {
				try {
					const rawJson = jsonLdScript.first().html();
					scraped.ld_json = JSON.parse(rawJson);
				} catch (err) {
					console.error(`❌ Failed to parse JSON-LD on ${url}:`, err.message);
				}
			}

			// === 2. Event Details section extraction ===
			const eventDetailsDiv = $('#event-details-section .fr-view');
			if (eventDetailsDiv.length > 0) {
				scraped.event_details_raw_html = eventDetailsDiv.html()?.trim() || '';
				scraped.event_details_text = eventDetailsDiv.text()?.trim() || '';
			}

			tempResults[url] = moshtixToOztix(scraped);
		}
	});

	await crawler.run();

	// Return results in same order as input URLs
	return urls.map((url) => tempResults[url] || { error: 'No data found for ' + url });
}

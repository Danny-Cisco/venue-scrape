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

	const scraped = {
		ld_json: null,
		event_details_raw_html: '',
		event_details_text: ''
	};

	const requestQueue = await RequestQueue.open();

	await requestQueue.addRequest({
		url: targetUrl,
		uniqueKey: `${targetUrl}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			// === 1. JSON-LD data extraction ===
			const jsonLdScript = $('#event-structured-data-section script[type="application/ld+json"]');
			if (jsonLdScript.length > 0) {
				try {
					const rawJson = jsonLdScript.first().html();
					scraped.ld_json = JSON.parse(rawJson);
				} catch (err) {
					console.error('Failed to parse JSON-LD:', err.message);
				}
			}

			// === 2. Event Details section extraction ===
			const eventDetailsDiv = $('#event-details-section .fr-view');
			if (eventDetailsDiv.length > 0) {
				scraped.event_details_raw_html = eventDetailsDiv.html().trim();
				scraped.event_details_text = eventDetailsDiv.text().trim();
			}
		}
	});

	try {
		await crawler.run();

		const oztixFormatted = moshtixToOztix(scraped);

		return new Response(JSON.stringify(oztixFormatted), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (err) {
		console.error('❌ Crawling failed:', err);
		return new Response(JSON.stringify({ error: 'Scraping failed', details: err.message }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

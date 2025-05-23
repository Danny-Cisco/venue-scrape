import { json } from '@sveltejs/kit';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import { moshtixToOztix } from '$lib/utils/gigConvertors.js';

/**
 * Extracts and formats gig data from Oztix-compatible HTML page.
 * Returns a standard gigObject via moshtixToOztix().
 */
async function scrapeOztixPage(url) {
	const requestQueue = await RequestQueue.open();
	const scraped = {
		ld_json: null,
		event_details_raw_html: '',
		event_details_text: ''
	};

	await requestQueue.addRequest({
		url,
		uniqueKey: `${url}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			const jsonLdScript = $('#event-structured-data-section script[type="application/ld+json"]');
			if (jsonLdScript.length > 0) {
				try {
					const rawJson = jsonLdScript.first().html();
					scraped.ld_json = JSON.parse(rawJson);
				} catch (err) {
					console.error(`❌ Failed to parse JSON-LD for ${request.url}:`, err.message);
				}
			}

			const eventDetailsDiv = $('#event-details-section .fr-view');
			if (eventDetailsDiv.length > 0) {
				scraped.event_details_raw_html = eventDetailsDiv.html().trim();
				scraped.event_details_text = eventDetailsDiv.text().trim();
			}
		}
	});

	await crawler.run();
	return moshtixToOztix(scraped);
}

// === GET handler (single url) ===
export async function GET({ url }) {
	const target = url.searchParams.get('url');

	if (!target) {
		return json({ error: 'Missing ?url= parameter' }, { status: 400 });
	}

	try {
		const data = await scrapeOztixPage(target);
		return json(data);
	} catch (err) {
		console.error(`❌ Failed GET scrape for ${target}:`, err);
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

// === POST handler (batch of urls) ===
export async function POST({ request }) {
	const { urls } = await request.json();

	if (!Array.isArray(urls) || urls.length === 0) {
		return json({ error: 'POST body must include non-empty `urls` array' }, { status: 400 });
	}

	const results = [];

	for (const url of urls) {
		try {
			const gigObject = await scrapeOztixPage(url);
			results.push({ url, ...gigObject });
		} catch (err) {
			console.error(`❌ Error scraping ${url}:`, err.message);
			results.push({ url, error: true, message: err.message });
		}
	}

	return json(results);
}

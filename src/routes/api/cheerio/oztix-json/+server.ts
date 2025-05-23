// +server.ts (or similar SvelteKit route file)

import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import { json } from '@sveltejs/kit';

async function runScraper(targets: string[]) {
	const results: any[] = [];
	const requestQueue = await RequestQueue.open();

	for (const target of targets) {
		await requestQueue.addRequest({
			url: target,
			uniqueKey: `${target}#${uuidv4()}`
		});
	}

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			let scrapedData = { source: request.url };

			const jsonLdScript = $('script[type="application/ld+json"]').html();
			if (!jsonLdScript) {
				scrapedData.error = 'No ld+json script tag found';
				results.push(scrapedData);
				return;
			}

			try {
				const json = JSON.parse(jsonLdScript);
				const graph = json['@graph'] || [];
				const eventData = graph.find((item) => item['@type'] === 'Event');
				const productData = graph.find((item) => item['@type'] === 'Product');

				const tags = $('.event-tag')
					.map((_, el) => $(el).text().trim())
					.get();

				const tickets = (eventData?.offers || []).map((offer) => ({
					ticketType: offer.itemOffered?.name || productData?.name || 'General Admission',
					price: offer.price,
					currency: offer.priceCurrency,
					availability: offer.availability
				}));

				Object.assign(scrapedData, {
					title: eventData?.name,
					description: eventData?.description,
					startDate: eventData?.startDate,
					venue: eventData?.location?.name,
					address: eventData?.location?.address?.streetAddress,
					suburb: eventData?.location?.address?.addressLocality,
					image: eventData?.image?.[0] || productData?.image?.[0] || null,
					ticketUrl: eventData?.url,
					tickets,
					tags
				});
			} catch (err) {
				scrapedData.error = 'JSON parse failed';
				scrapedData.details = err.message;
			}

			results.push(scrapedData);
		}
	});

	await crawler.run();
	return results;
}

export async function GET({ url }) {
	const singleUrl = url.searchParams.get('url');

	if (!singleUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	try {
		const result = await runScraper([singleUrl]);
		return json(result[0]);
	} catch (err) {
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

export async function POST({ request }) {
	let urls: string[] = [];

	try {
		const body = await request.json();
		urls = body.urls;
	} catch {
		return json({ error: 'Invalid JSON in request body' }, { status: 400 });
	}

	if (!Array.isArray(urls) || urls.length === 0) {
		return json({ error: 'Missing or invalid urls array in POST body' }, { status: 400 });
	}

	try {
		const results = await runScraper(urls);
		return json(results);
	} catch (err) {
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

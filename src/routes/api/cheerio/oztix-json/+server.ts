import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let scrapedData = {};

	const requestQueue = await RequestQueue.open();
	await requestQueue.addRequest({
		url: targetUrl,
		uniqueKey: `${targetUrl}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			// Extract structured data from application/ld+json
			const jsonLdScript = $('script[type="application/ld+json"]').html();

			if (!jsonLdScript) {
				scrapedData = { error: 'No ld+json script tag found' };
				return;
			}

			try {
				const json = JSON.parse(jsonLdScript);
				const graph = json['@graph'] || [];
				const eventData = graph.find((item) => item['@type'] === 'Event');
				const productData = graph.find((item) => item['@type'] === 'Product');

				// Extract .event-tag labels from DOM
				const tags = $('.event-tag')
					.map((_, el) => $(el).text().trim())
					.get();

				// Build structured ticket list
				const tickets = (eventData.offers || []).map((offer) => ({
					ticketType: offer.itemOffered?.name || productData?.name || 'General Admission',
					price: offer.price,
					currency: offer.priceCurrency,
					availability: offer.availability
				}));

				// Assemble final clean object
				scrapedData = {
					title: eventData.name,
					description: eventData.description,
					startDate: eventData.startDate,
					venue: eventData.location?.name,
					address: eventData.location?.address?.streetAddress,
					suburb: eventData.location?.address?.addressLocality,
					image: eventData.image?.[0] || productData?.image?.[0] || null,
					ticketUrl: eventData.url,
					tickets,
					tags
				};
			} catch (err) {
				scrapedData = { error: 'JSON parse failed', details: err.message };
			}
		}
	});

	try {
		await crawler.run();

		return new Response(JSON.stringify(scrapedData), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: 'Scraping failed', details: err.message }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

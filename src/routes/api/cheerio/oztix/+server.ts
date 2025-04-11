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

	// 🔧 Create or reuse a request queue
	const requestQueue = await RequestQueue.open();

	// 💡 Add request with a uniqueKey to force processing
	await requestQueue.addRequest({
		url: targetUrl,
		uniqueKey: `${targetUrl}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			// 🧠 Find the first script tag with application/ld+json
			const jsonLdScript = $('script[type="application/ld+json"]').html();

			try {
				if (jsonLdScript) {
					// Parse it
					const json = JSON.parse(jsonLdScript);
					scrapedData = json;
				} else {
					scrapedData = { error: 'No ld+json script tag found' };
				}
			} catch (err) {
				scrapedData = { error: 'JSON parse failed', details: err.message };
			}
		}
	});

	try {
		await crawler.run(); // 🟢 run the crawl

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

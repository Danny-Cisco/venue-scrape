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

	const gigLinks = [];

	// Set up a new or existing request queue
	const requestQueue = await RequestQueue.open();

	await requestQueue.addRequest({
		url: targetUrl,
		uniqueKey: `${targetUrl}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			const baseUrl = new URL(request.loadedUrl).origin;

			$('a[href^="/gigs/"]').each((_, el) => {
				const relative = $(el).attr('href');
				if (relative) {
					const fullUrl = new URL(relative, baseUrl).href;
					if (!gigLinks.includes(fullUrl)) {
						gigLinks.push(fullUrl);
					}
				}
			});
		}
	});

	try {
		await crawler.run();

		return new Response(JSON.stringify(gigLinks), {
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

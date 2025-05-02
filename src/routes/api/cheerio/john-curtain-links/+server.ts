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
	const requestQueue = await RequestQueue.open();

	await requestQueue.addRequest({
		url: targetUrl,
		uniqueKey: `${targetUrl}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			$('div.collection-item-2 a[href]').each((_, el) => {
				const fullUrl = $(el).attr('href');
				if (fullUrl && !gigLinks.includes(fullUrl)) {
					gigLinks.push(fullUrl);
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

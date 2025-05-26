import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';

async function extractMoshtixLinksFrom(url: string): Promise<string[]> {
	const result = new Set<string>();
	const requestQueue = await RequestQueue.open();

	await requestQueue.addRequest({
		url,
		uniqueKey: `${url}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			$('a[href]').each((_, el) => {
				const href = $(el).attr('href');
				if (href && /^https:\/\/www\.moshtix\.com\.au\/v2\/event\/[^/]+\/\d+$/.test(href)) {
					result.add(href);
				}
			});
		}
	});

	await crawler.run();
	return Array.from(result);
}

// === GET handler ===
export async function GET({ url }) {
	const venueUrl = url.searchParams.get('url');

	if (!venueUrl) {
		return new Response(JSON.stringify({ error: 'Missing ?url parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const links = await extractMoshtixLinksFrom(venueUrl);
		return new Response(JSON.stringify({ links }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('❌ Crawling failed:', err);
		return new Response(JSON.stringify({ error: 'Scraping failed', details: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

// === POST handler ===
export async function POST({ request }) {
	const body = await request.json();
	const venueUrl = body.url;

	if (!venueUrl || typeof venueUrl !== 'string') {
		return new Response(JSON.stringify({ error: 'Missing or invalid `url` in body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const links = await extractMoshtixLinksFrom(venueUrl);
		return new Response(JSON.stringify({ links }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('❌ Crawling failed:', err);
		return new Response(JSON.stringify({ error: 'Scraping failed', details: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

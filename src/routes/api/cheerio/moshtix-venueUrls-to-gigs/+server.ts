import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';

function safeEncodeMoshtixUrl(rawUrl) {
	try {
		const url = new URL(rawUrl);
		const segments = url.pathname
			.split('/')
			.map((segment) => decodeURIComponent(segment)) // ensure we're not double-encoding
			.map((segment) => encodeURIComponent(segment)); // re-encode properly
		url.pathname = segments.join('/');
		return url.toString();
	} catch (err) {
		console.warn('Invalid URL in encodeUnicodePathOnly:', rawUrl);
		return rawUrl;
	}
}

// Extract all valid Moshtix event links from a page
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
					result.add(safeEncodeMoshtixUrl(href));
				}
			});
		}
	});

	await crawler.run();
	return Array.from(result);
}

async function fetchGigObjectsFromMoshtix(fetchFn: typeof fetch, urls: string[]) {
	const res = await fetchFn('/api/cheerio/moshtix-json', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ urls })
	});
	return await res.json();
}

// === GET handler ===
export async function GET({ url, fetch }) {
	const venueUrl = url.searchParams.get('url');

	if (!venueUrl) {
		return new Response(JSON.stringify({ error: 'Missing ?url parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const links = await extractMoshtixLinksFrom(venueUrl);
		const gigs = await fetchGigObjectsFromMoshtix(fetch, links);
		return new Response(JSON.stringify({ gigs }), {
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
export async function POST({ request, fetch }) {
	const body = await request.json();
	const venueUrls = body.urls;

	if (!Array.isArray(venueUrls) || venueUrls.length === 0) {
		return new Response(JSON.stringify({ error: 'Missing or invalid `urls` array in body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const allLinks = new Set<string>();

		for (const url of venueUrls) {
			const links = await extractMoshtixLinksFrom(url);
			links.forEach((link) => allLinks.add(link));
		}

		const linkArray = Array.from(allLinks);
		const gigs = await fetchGigObjectsFromMoshtix(fetch, linkArray);

		return new Response(JSON.stringify({ gigs }), {
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

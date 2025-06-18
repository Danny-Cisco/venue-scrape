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

// Extract all valid Oztix event links from a page
async function extractOztixLinksFrom(fetchFn: typeof fetch, venueName: string): Promise<string[]> {
	const result = await fetchFn(
		`/api/algolia/oztix-venue-to-urls?venue=${encodeURIComponent(venueName)}`
	);

	const json = await result.json();
	console.log('🚀 ~ extractOztixLinksFrom ~ json:', json);

	return json;
}

async function fetchGigObjectsFromOztix(fetchFn: typeof fetch, urls: string[]) {
	const res = await fetchFn('/api/cheerio/oztix-json', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ urls })
	});
	return await res.json();
}

// === GET handler ===
export async function GET({ url, fetch }) {
	const venueName = url.searchParams.get('url');
	console.log('🚀 ~ GET ~ venueName:', venueName);

	if (!venueName) {
		return new Response(JSON.stringify({ error: 'Missing ?url parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const links = await extractOztixLinksFrom(fetch, venueName);
		console.log('🚀🚀🚀🚀 ~ GET ~ links:', links);
		const gigs = await fetchGigObjectsFromOztix(fetch, links);
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
	const venueNames = body.urls;

	if (!Array.isArray(venueNames) || venueNames.length === 0) {
		return new Response(JSON.stringify({ error: 'Missing or invalid `urls` array in body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const allLinks = new Set<string>();

		for (const url of venueNames) {
			const links = await extractOztixLinksFrom(url);
			links.forEach((link) => allLinks.add(link));
		}

		const linkArray = Array.from(allLinks);
		const gigs = await fetchGigObjectsFromOztix(fetch, linkArray);

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

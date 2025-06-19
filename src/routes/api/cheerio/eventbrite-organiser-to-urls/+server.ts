import { json } from '@sveltejs/kit';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';

function isUpcoming(dateStr) {
	const now = new Date();
	const date = new Date(dateStr);
	const valid = !isNaN(date);
	const upcoming = valid && date > now;

	// console.table([
	// 	{
	// 		label: 'Raw dateStr',
	// 		value: dateStr
	// 	},
	// 	{
	// 		label: 'Parsed date (local)',
	// 		value: date.toString()
	// 	},
	// 	{
	// 		label: 'Parsed date (ISO)',
	// 		value: date.toISOString()
	// 	},
	// 	{
	// 		label: 'Now (local)',
	// 		value: now.toString()
	// 	},
	// 	{
	// 		label: 'Now (ISO)',
	// 		value: now.toISOString()
	// 	},

	// 	{
	// 		label: 'Is upcoming?',
	// 		value: upcoming
	// 	}
	// ]);

	return upcoming;
}

// Scrape one Eventbrite URL and return only upcoming event URLs
async function scrapeEventUrls(inputUrl) {
	const results = [];

	const requestQueue = await RequestQueue.open();
	await requestQueue.addRequest({ url: inputUrl, uniqueKey: `${inputUrl}#${uuidv4()}` });

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			$('script[type="application/ld+json"]').each((_, el) => {
				try {
					const data = JSON.parse($(el).html().trim());

					function walk(node) {
						if (!node) return;
						if (Array.isArray(node)) return node.forEach(walk);
						if (typeof node === 'object') {
							if (node['@type'] === 'Event' && node.url) {
								const upcoming = isUpcoming(node.endDate);
								if (upcoming) {
									results.push(node.url);
								}
							}
							for (const key in node) walk(node[key]);
						}
					}

					walk(data);
				} catch (e) {
					console.warn(`⚠️ Failed to parse LD+JSON: ${e.message}`);
				}
			});
		}
	});

	await crawler.run();
	return results;
}

// === GET /api/your-endpoint?url=... ===
export async function GET({ url }) {
	const inputUrl = url.searchParams.get('url');
	if (!inputUrl) {
		return json({ error: 'Missing ?url= parameter' }, { status: 400 });
	}

	try {
		const upcomingUrls = await scrapeEventUrls(inputUrl);
		return json(upcomingUrls);
	} catch (err) {
		console.error('❌ GET scraping error:', err.message);
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

// === POST /api/your-endpoint ===
// Body: { "urls": [ ... ] }
export async function POST({ request }) {
	const { urls } = await request.json();
	if (!Array.isArray(urls) || urls.length === 0) {
		return json({ error: 'POST body must include non-empty `urls` array' }, { status: 400 });
	}

	const allUpcomingUrls = new Set();

	for (const inputUrl of urls) {
		try {
			const upcoming = await scrapeEventUrls(inputUrl);
			upcoming.forEach((url) => allUpcomingUrls.add(url));
		} catch (err) {
			console.error(`❌ Failed to scrape ${inputUrl}: ${err.message}`);
		}
	}

	return json([...allUpcomingUrls]);
}

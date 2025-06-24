import { json } from '@sveltejs/kit';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import vm from 'node:vm';
import { eventbriteToOztix } from '$lib/utils/gigConvertors.js';

// Utility: Parses a JS object literal safely
function parseServerData(rawObj) {
	const wrapped = '(' + rawObj + ')';
	const sandbox = Object.create(null);
	return vm.runInNewContext(wrapped, sandbox, { timeout: 1000 });
}

// Utility: Extracts a balanced {...} block
function sliceBalancedBraceBlock(str) {
	const start = str.indexOf('{');
	if (start === -1) return null;
	let depth = 0;
	for (let i = start; i < str.length; i++) {
		if (str[i] === '{') depth++;
		else if (str[i] === '}') {
			depth--;
			if (depth === 0) return str.slice(start, i + 1);
		}
	}
	return null;
}

// Scraper logic for a single Eventbrite URL
async function scrapeEventbritePage(targetUrl) {
	const rawResult = {
		ld_events: [],
		server_data: null,
		event_details_raw_html: '',
		event_details_text: ''
	};

	const requestQueue = await RequestQueue.open();
	await requestQueue.addRequest({ url: targetUrl, uniqueKey: `${targetUrl}#${uuidv4()}` });

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			// Grab any LD+JSON blocks with @type: Event or BusinessEvent
			$('script[type="application/ld+json"]').each((_, el) => {
				try {
					const json = JSON.parse($(el).html().trim());
					const events = [];
					(function walk(n) {
						if (!n) return;
						if (Array.isArray(n)) return n.forEach(walk);
						if (typeof n === 'object') {
							const type = n['@type'];
							if (type === 'Event' || type === 'BusinessEvent') events.push(n);
							if (n['@graph']) walk(n['@graph']);
							// Also walk nested properties that may contain embedded types
							for (const key in n) {
								if (typeof n[key] === 'object') walk(n[key]);
							}
						}
					})(json);
					if (events.length) rawResult.ld_events.push(...events);
				} catch {}
			});

			// Extract window.__SERVER_DATA__ if available
			$('script').each((_, el) => {
				const raw = $(el).html();
				if (!raw.includes('window.__SERVER_DATA__')) return;
				const objBlock = sliceBalancedBraceBlock(raw);
				if (!objBlock) return;
				try {
					rawResult.server_data = parseServerData(objBlock);
				} catch (err) {
					console.warn(`Failed to eval __SERVER_DATA__ on ${request.url}: ${err.message}`);
				}
			});

			const div = $('#event-details-section .fr-view');
			if (div.length) {
				rawResult.event_details_raw_html = div.html().trim();
				rawResult.event_details_text = div.text().trim();
			}
		}
	});

	await crawler.run();

	// Convert the scraped raw structure into unified gig format
	return eventbriteToOztix(rawResult);
}

// === GET version ===
export async function GET({ url }) {
	const inputUrl = url.searchParams.get('url');
	if (!inputUrl) {
		return json({ error: 'Missing ?url= parameter' }, { status: 400 });
	}

	try {
		const gig = await scrapeEventbritePage(inputUrl);
		return json({ gig });
	} catch (err) {
		console.error('❌ GET scraping error:', err.message);
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

// === POST version ===
export async function POST({ request }) {
	const { urls } = await request.json();
	if (!Array.isArray(urls) || urls.length === 0) {
		return json({ error: 'POST body must include non-empty `urls` array' }, { status: 400 });
	}

	const results = [];

	for (const inputUrl of urls) {
		try {
			const gig = await scrapeEventbritePage(inputUrl);
			results.push(gig);
		} catch (err) {
			console.error(`❌ Failed to scrape ${inputUrl}:`, err.message);
			results.push({ url: inputUrl, error: true, message: err.message });
		}
	}

	return json(results);
}

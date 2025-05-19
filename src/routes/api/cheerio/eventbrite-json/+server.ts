import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import vm from 'node:vm'; // ← built-in

/** run vanilla JS object-literal safely */
function parseServerData(rawObj) {
	// wrap in parens so it’s treated as an expression, not a block
	const wrapped = '(' + rawObj + ')';

	// empty context prevents access to require, process, etc.
	const sandbox = Object.create(null);

	// 1-second timeout so a malicious loop won’t hang your server
	return vm.runInNewContext(wrapped, sandbox, { timeout: 1000 });
}

/** brutish brace-counter: finds the *matching* } for the first { */
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
	return null; // unbalanced
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');
	if (!targetUrl) {
		return new Response(JSON.stringify({ error: 'Missing ?url=' }), { status: 400 });
	}

	const result = {
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
			/* === 1. JSON-LD Events (unchanged) === */
			$('script[type="application/ld+json"]').each((_, el) => {
				try {
					const json = JSON.parse($(el).html().trim());
					const events = [];
					(function walk(n) {
						if (!n) return;
						if (Array.isArray(n)) return n.forEach(walk);
						if (typeof n === 'object') {
							if (n['@type'] === 'Event') events.push(n);
							if (n['@graph']) walk(n['@graph']);
						}
					})(json);
					if (events.length) result.ld_events.push(...events);
				} catch {
					/* skip bad blocks */
				}
			});

			/* === 2. window.__SERVER_DATA__ (JS, not JSON) === */
			$('script').each((_, el) => {
				const raw = $(el).html();
				if (!raw.includes('window.__SERVER_DATA__')) return;

				const objBlock = sliceBalancedBraceBlock(raw);
				if (!objBlock) return;

				try {
					result.server_data = parseServerData(objBlock);
				} catch (err) {
					console.warn(`Failed to eval __SERVER_DATA__ on ${request.url}: ${err.message}`);
				}
			});

			/* === 3. Event Details section === */
			const div = $('#event-details-section .fr-view');
			if (div.length) {
				result.event_details_raw_html = div.html().trim();
				result.event_details_text = div.text().trim();
			}
		}
	});

	try {
		await crawler.run();
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: 'Scraping failed', details: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
		});
	}
}

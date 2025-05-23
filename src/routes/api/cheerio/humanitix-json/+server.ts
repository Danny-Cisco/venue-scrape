import { json } from '@sveltejs/kit';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import vm from 'node:vm';
import { humanitixToOztix } from '$lib/utils/gigConvertors.js';

async function scrapeHumanitixPage(inputUrl) {
	// Normalize to `/tickets` subpage
	if (!inputUrl.endsWith('/tickets')) {
		inputUrl = inputUrl.replace(/\/+$/, '') + '/tickets';
	}

	const result = { gig: null };
	const requestQueue = await RequestQueue.open();

	await requestQueue.addRequest({
		url: inputUrl,
		uniqueKey: `${inputUrl}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			const scriptWithNonce = $('script[nonce]')
				.filter((_, el) => {
					const code = $(el).html();
					return code.includes('__sveltekit_') && code.includes('kit.start');
				})
				.first();

			if (!scriptWithNonce.length) {
				console.warn('❌ No matching nonce script found on:', request.url);
				return;
			}

			const jsCode = scriptWithNonce.html().trim();
			const match = jsCode.match(/kit\.start\(\s*app\s*,\s*element\s*,\s*({[\s\S]*?})\s*\)/);

			if (!match) {
				console.warn('❌ kit.start(...) block not matched');
				return;
			}

			const objectLiteral = match[1];
			try {
				const context = {};
				vm.createContext(context);
				vm.runInContext('result = ' + objectLiteral, context);

				const gig = humanitixToOztix(context.result);
				result.gig = gig;
			} catch (err) {
				console.error('❌ Error evaluating data object:', err.message);
			}
		}
	});

	await crawler.run();
	return result.gig;
}

// === GET version ===
export async function GET({ url }) {
	const inputUrl = url.searchParams.get('url');
	if (!inputUrl) {
		return json({ error: 'Missing ?url= parameter' }, { status: 400 });
	}

	try {
		const gig = await scrapeHumanitixPage(inputUrl);
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
			const gig = await scrapeHumanitixPage(inputUrl);
			results.push({ url: inputUrl, gig });
		} catch (err) {
			console.error(`❌ Failed to scrape ${inputUrl}:`, err.message);
			results.push({ url: inputUrl, error: true, message: err.message });
		}
	}

	return json(results);
}

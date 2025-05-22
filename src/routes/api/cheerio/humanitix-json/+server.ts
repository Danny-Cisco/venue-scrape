import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import vm from 'node:vm';
import { humanitixToOztix } from '$lib/utils/gigConvertors.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	let inputUrl = url.searchParams.get('url');

	if (!inputUrl) {
		return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Normalize to the `/tickets` subpage
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

				// ✅ Convert
				const gig = humanitixToOztix(context.result);
				result.gig = gig;
			} catch (err) {
				console.error('❌ Error evaluating data object:', err.message);
			}
		}
	});

	try {
		await crawler.run();
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (err) {
		console.error('❌ Scraper error:', err);
		return new Response(JSON.stringify({ error: 'Scraping failed', details: err.message }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

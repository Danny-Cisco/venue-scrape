import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import vm from 'node:vm';
import { humanitixToOztix } from '$lib/utils/gigConvertors.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const result = {
		gig: null
	};

	const requestQueue = await RequestQueue.open();

	await requestQueue.addRequest({
		url: targetUrl,
		uniqueKey: `${targetUrl}#${uuidv4()}`
	});

	const crawler = new CheerioCrawler({
		requestQueue,
		async requestHandler({ $, request }) {
			const scriptWithNonce = $('script[nonce]')
				.filter((i, el) => {
					const code = $(el).html();
					return code.includes('__sveltekit_') && code.includes('kit.start');
				})
				.first();

			if (scriptWithNonce.length === 0) return;

			const jsCode = scriptWithNonce.html().trim();

			const match = jsCode.match(/kit\.start\(\s*app\s*,\s*element\s*,\s*({[\s\S]*?})\s*\)/);
			if (!match) return;

			const objectLiteral = match[1];

			try {
				const context = {};
				vm.createContext(context);
				const parsed = vm.runInContext('result = ' + objectLiteral, context);
				// 🔥 Convert to simplified gig format
				const gig = humanitixToOztix(parsed);
				result.gig = gig;
			} catch (err) {
				console.error('❌ Failed to evaluate or convert data object:', err.message);
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

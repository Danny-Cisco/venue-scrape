import { CheerioCrawler, RequestQueue } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import { json } from '@sveltejs/kit';

async function runProfilePicScraper(targets: string[]) {
	const results: any[] = [];
	const requestQueue = await RequestQueue.open();

	for (const target of targets) {
		await requestQueue.addRequest({
			url: target,
			uniqueKey: `${target}#${uuidv4()}`
		});
	}

	const crawler = new CheerioCrawler({
		requestQueue,
		maxConcurrency: 1, // 👈 Limit concurrency to 1

		async requestHandler({ $, request, body }) {
			const scrapedData = { source: request.url };

			console.log(`🧪 Raw HTML body:\n${body.slice(0, 1000)}`);

			const img = $('#profile-picture img');
			const src = img.attr('src');

			if (src) {
				scrapedData.image = src;
			} else {
				scrapedData.error = 'Profile image not found';
			}

			results.push(scrapedData);
		}
	});

	await crawler.run();
	return results;
}

export async function GET({ url }) {
	const singleUrl = url.searchParams.get('url');

	if (!singleUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	try {
		const result = await runProfilePicScraper([singleUrl]);
		return json(result[0]);
	} catch (err) {
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

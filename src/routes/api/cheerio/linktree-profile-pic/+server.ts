// src/routes/api/cheerio/linktree-profile-pic/+server.ts

import { CheerioCrawler } from 'crawlee';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const linktreeUrl = url.searchParams.get('url');

	if (!linktreeUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	let result = { source: linktreeUrl };

	const crawler = new CheerioCrawler({
		requestHandler: async ({ $, request }) => {
			const img = $('#profile-picture img');
			const src = img.attr('src');

			if (src) {
				result.image = src;
			} else {
				result.error = 'Profile image not found';
			}
		}
	});

	try {
		await crawler.run([{ url: linktreeUrl }]);
		return json(result);
	} catch (err) {
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

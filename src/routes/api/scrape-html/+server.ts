// src/routes/scrape/+server.ts
import { error, json } from '@sveltejs/kit';

export async function GET({ url }) {
	const target = url.searchParams.get('target');

	if (!target) {
		throw error(400, 'Missing target URL');
	}

	try {
		const response = await fetch(target);

		if (!response.ok) {
			throw error(response.status, `Failed to fetch: ${response.statusText}`);
		}

		const html = await response.text();

		return json({ html });
	} catch (err) {
		throw error(500, `Scrape failed: ${err.message}`);
	}
}

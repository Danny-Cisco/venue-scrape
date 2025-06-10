import { gotScraping } from 'crawlee';
import * as cheerio from 'cheerio';
import { json } from '@sveltejs/kit';

async function scrapeLinktreeLinks(url) {
	try {
		const response = await gotScraping({ url });

		const $ = cheerio.load(response.body);

		// Find the <script type="application/ld+json"> that contains profile data
		const ldJsonScript = $('script[type="application/ld+json"]').html();

		if (!ldJsonScript) {
			return { source: url, error: 'No ld+json data found.' };
		}

		const data = JSON.parse(ldJsonScript);

		const sameAs = data?.mainEntity?.sameAs;
		if (!sameAs || !Array.isArray(sameAs)) {
			return { source: url, error: '"sameAs" links not found in ld+json.' };
		}

		return {
			source: url,
			links: sameAs
		};
	} catch (error) {
		console.error(`❌ Failed to scrape ${url}:`, error);
		throw new Error(`Scraping failed for ${url}: ${error.message}`);
	}
}

export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	try {
		const result = await scrapeLinktreeLinks(targetUrl);
		return json(result);
	} catch (err) {
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

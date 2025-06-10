import { gotScraping } from 'crawlee';
import * as cheerio from 'cheerio';
import { json } from '@sveltejs/kit';

async function scrapeAllLinktreeUrls(url) {
	try {
		const response = await gotScraping({ url });
		const $ = cheerio.load(response.body);

		const rawJson = $('#__NEXT_DATA__').html();
		if (!rawJson) {
			return { source: url, error: 'No __NEXT_DATA__ script tag found.' };
		}

		const parsed = JSON.parse(rawJson);
		const linkObjects = parsed?.props?.pageProps?.account?.links;

		if (!Array.isArray(linkObjects)) {
			return { source: url, error: 'No links array found in Linktree data.' };
		}

		const urls = linkObjects.map((link) => link.url).filter(Boolean);
		const uniqueUrls = Array.from(new Set([...urls, url]));

		return {
			source: url,
			links: uniqueUrls
		};
	} catch (err) {
		console.error(`❌ Failed to scrape ${url}:`, err);
		throw new Error(`Scraping failed for ${url}: ${err.message}`);
	}
}

export async function GET({ url }) {
	const inputUrl = url.searchParams.get('url');
	if (!inputUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	try {
		const result = await scrapeAllLinktreeUrls(inputUrl);
		return json(result);
	} catch (err) {
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

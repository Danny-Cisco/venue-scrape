import { gotScraping } from 'crawlee';
import * as cheerio from 'cheerio';
import { json } from '@sveltejs/kit';

async function scrapeAllPageLinks(url) {
	try {
		const response = await gotScraping({ url });
		const $ = cheerio.load(response.body);

		const hrefs = $('a')
			.map((_, el) => $(el).attr('href'))
			.get()
			.filter(Boolean);

		// Convert relative URLs to absolute using the original page URL
		const absoluteUrls = hrefs
			.map((href) => {
				try {
					return new URL(href, url).href;
				} catch {
					return null;
				}
			})
			.filter(Boolean);

		const uniqueUrls = Array.from(new Set([...absoluteUrls]));

		return {
			source: url,
			total: uniqueUrls.length,
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
		const result = await scrapeAllPageLinks(inputUrl);
		return json(result);
	} catch (err) {
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

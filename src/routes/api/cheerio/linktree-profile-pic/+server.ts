// src/routes/api/scrape/+server.js (or wherever your endpoint is)

import { gotScraping } from 'crawlee';
import * as cheerio from 'cheerio';
import { json } from '@sveltejs/kit';

// No need for global configuration or crawler setup here.

async function scrapeSingleProfile(url: string) {
	try {
		// Use got-scraping to fetch the page. It mimics a real browser's headers.
		const response = await gotScraping({ url });

		// Load the HTML into Cheerio for parsing.
		const $ = cheerio.load(response.body);

		// Your scraping logic remains the same.
		const img = $('#profile-picture img'); // More specific selector for Linktree
		const src = img.attr('src');

		if (src) {
			return { source: url, image: src };
		} else {
			return { source: url, error: 'Profile image not found.' };
		}
	} catch (error) {
		console.error(`❌ Failed to scrape ${url}:`, error);
		// Re-throw or handle the error as needed. Here we pass it up.
		throw new Error(`Scraping failed for ${url}: ${error.message}`);
	}
}

export async function GET({ url }) {
	const singleUrl = url.searchParams.get('url');

	if (!singleUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	try {
		const result = await scrapeSingleProfile(singleUrl);
		return json(result);
	} catch (err) {
		return json({ error: 'Scraping failed', details: err.message }, { status: 500 });
	}
}

// src/routes/api/scrape/+server.js
import { gotScraping } from 'crawlee';
import * as cheerio from 'cheerio';
import { json } from '@sveltejs/kit';

async function scrapeSingleProfile(url) {
	try {
		const response = await gotScraping({ url });
		const $ = cheerio.load(response.body);

		// Get the profile picture from DOM
		const profilePic = $('#profile-picture img').attr('src');

		// Try to find customAvatar from embedded JSON
		let customAvatar;
		$('script[type="application/json"]').each((_, el) => {
			try {
				const data = JSON.parse($(el).text());
				const avatar = data?.props?.pageProps?.account?.customAvatar;
				if (avatar) {
					customAvatar = avatar;
				}
			} catch (e) {
				// Silent fail on JSON parse error
			}
		});

		const image = customAvatar || profilePic;

		if (image) {
			return { source: url, image, profilePic, customAvatar };
		} else {
			return { source: url, error: 'No image found in DOM or embedded JSON.' };
		}
	} catch (error) {
		console.error(`❌ Failed to scrape ${url}:`, error);
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

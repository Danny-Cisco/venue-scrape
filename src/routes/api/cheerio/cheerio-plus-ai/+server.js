import { gotScraping } from 'crawlee';
import * as cheerio from 'cheerio';
import { json } from '@sveltejs/kit';

async function sendQuestion(question, systemPrompt, fetch) {
	const parsedBody = JSON.stringify({ question, systemPrompt });

	const response = await fetch('/api/openai/qabot', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: parsedBody
	});

	const data = await response.json();
	return data.answer;
}

async function scrapeAllPageLinks(url) {
	const response = await gotScraping({ url });
	const $ = cheerio.load(response.body);

	const hrefs = $('a')
		.map((_, el) => $(el).attr('href'))
		.get()
		.filter(Boolean);

	const absoluteUrls = hrefs
		.map((href) => {
			try {
				return new URL(href, url).href;
			} catch {
				return null;
			}
		})
		.filter(Boolean);

	const uniqueUrls = Array.from(new Set(absoluteUrls));

	return {
		source: url,
		total: uniqueUrls.length,
		links: uniqueUrls
	};
}

export async function GET({ url, fetch }) {
	const inputUrl = url.searchParams.get('url');
	const ai = url.searchParams.get('ai');

	if (!inputUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	try {
		const result = await scrapeAllPageLinks(inputUrl);

		// If no AI query, just return raw data
		if (!ai) {
			return json(result);
		}

		const prompt = `Here are the links found on the page ${inputUrl}:\n\n${result.links
			.slice(0, 25)
			.map((link, i) => `${i + 1}. ${link}`)
			.join('\n')}\n\n${ai}`;

		const systemPrompt = `You are a web analysis tool. You'll receive a list of links extracted from a web page, followed by a user query. Be concise, specific, and helpful. If the user asks for a link, return the URL only, with no extra commentary.`;

		const answer = await sendQuestion(prompt, systemPrompt, fetch);

		return json({ source: inputUrl, total: result.total, answer });
	} catch (err) {
		console.error(`❌ Error in cheerio-plus-ai:`, err);
		return json({ error: 'Failed to scrape or analyze', details: err.message }, { status: 500 });
	}
}

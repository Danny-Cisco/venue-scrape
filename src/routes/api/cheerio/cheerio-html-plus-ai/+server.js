import { gotScraping } from 'crawlee';
import { json } from '@sveltejs/kit';

async function sendQuestion(content, systemPrompt, fetch) {
	const parsedBody = JSON.stringify({ question: content, systemPrompt });

	const response = await fetch('/api/openai/qabot', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: parsedBody
	});

	const data = await response.json();
	return data.answer;
}

export async function GET({ url, fetch }) {
	const inputUrl = url.searchParams.get('url');
	const ai = url.searchParams.get('ai');

	if (!inputUrl) {
		return json({ error: 'Missing ?url parameter' }, { status: 400 });
	}

	try {
		const response = await gotScraping({ url: inputUrl });

		if (!ai) {
			// Just return the raw HTML if no AI prompt
			return json({ source: inputUrl, html: response.body });
		}

		// Prompt sent to the AI model
		const prompt = `The following is the full HTML content of the web page at ${inputUrl}:\n\n${response.body}\n\n${ai}`;

		const systemPrompt = `You are a helpful AI tool that reads full HTML pages. Answer the user’s query based on the raw HTML content provided. Be specific. If the user asks for a URL, return only that.`;

		const answer = await sendQuestion(prompt, systemPrompt, fetch);

		return json({ source: inputUrl, answer });
	} catch (err) {
		console.error('❌ Error in full-html-ai:', err);
		return json(
			{ error: 'Failed to fetch or analyze page', details: err.message },
			{ status: 500 }
		);
	}
}

import { GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID } from '$env/static/private';
import { json } from '@sveltejs/kit';

async function sendQuestion(question, systemPrompt, fetch) {
	const parsedBody = JSON.stringify({ question, systemPrompt });

	const response = await fetch('/api/openai/qabot', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: parsedBody
	});

	const data = await response.json();
	return data.answer;
}

export async function GET({ url, fetch }) {
	const band = url.searchParams.get('band');

	const google = `${band} + band instagram`;
	const ai = `what is the url for ${band} + band instagram profile. If unsure, prioritise Melbourne Bands. If no band seems like the correct band, reply NULL`;

	if (!google) {
		return json({ error: 'Missing search google' }, { status: 400 });
	}

	try {
		// First API call - Google Search
		const endpoint = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(google)}`;
		const response = await fetch(endpoint);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return json({ error: errorData.error || 'Search failed' }, { status: response.status });
		}

		const data = await response.text();

		const prompt = data + ai;

		const systemPrompt =
			'You are to act as a data cleaning tool. you will recieve a list of 10 google search results, plus one question regarding the results. please be as concise and accurate as possible. If you are asked for a link, simply state the url and nothing more.';

		// Second API call - OpenAI processing
		const answer = await sendQuestion(prompt, systemPrompt, fetch);

		// Return a proper Response object using json helper
		return json({
			answer
		});
	} catch (error) {
		console.error('Error processing request:', error);
		return json(
			{
				error: 'Failed to process search request',
				details: error.message
			},
			{ status: 500 }
		);
	}
}

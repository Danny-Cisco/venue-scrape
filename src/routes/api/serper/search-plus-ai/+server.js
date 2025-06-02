import { PRIVATE_SERPER_API_KEY } from '$env/static/private';
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
	const google = url.searchParams.get('google');
	const ai = url.searchParams.get('ai');

	if (!google) {
		return json({ error: 'Missing search google' }, { status: 400 });
	}

	try {
		// 🔍 First API call - Serper Search
		const serperRes = await fetch('https://google.serper.dev/search', {
			method: 'POST',
			headers: {
				'X-API-KEY': PRIVATE_SERPER_API_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ q: google })
		});

		if (!serperRes.ok) {
			const errData = await serperRes.json().catch(() => ({}));
			return json({ error: errData.error || 'Serper search failed' }, { status: serperRes.status });
		}

		const serperData = await serperRes.json();

		const organicResults = serperData.organic ?? [];

		const formattedResults = organicResults
			.map((item, i) => `${i + 1}. ${item.title}\n${item.link}\n${item.snippet}`)
			.join('\n\n');

		const prompt = `${formattedResults}\n\n${ai}`;

		const systemPrompt = `You are to act as a data cleaning tool. You will receive a list of 10 Google search results, plus one question regarding the results. Please be as concise and accurate as possible. If you are asked for a link, simply state the URL and nothing more.`;

		// 🧠 Second API call - OpenAI Processing
		const answer = await sendQuestion(prompt, systemPrompt, fetch);

		return json({ answer });
	} catch (error) {
		console.error('❌ Error processing request:', error);
		return json(
			{
				error: 'Failed to process search request',
				details: error.message
			},
			{ status: 500 }
		);
	}
}

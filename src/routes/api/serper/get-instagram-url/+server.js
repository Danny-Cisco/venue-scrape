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
	const band = url.searchParams.get('band');

	if (!band) {
		return json({ error: 'Missing band parameter' }, { status: 400 });
	}

	const searchQuery = `${band} band instagram`;
	const ai = `What is the URL for ${band} band Instagram profile? Return only the base profile URL, stopping at the username. If unsure, prioritise Melbourne bands. If no band seems like the correct one, reply NULL.`;

	try {
		// 🔍 Serper API call
		const serperRes = await fetch('https://google.serper.dev/search', {
			method: 'POST',
			headers: {
				'X-API-KEY': PRIVATE_SERPER_API_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ q: searchQuery })
		});

		if (!serperRes.ok) {
			const errData = await serperRes.json().catch(() => ({}));
			return json({ error: errData.error || 'Serper search failed' }, { status: serperRes.status });
		}

		const serperData = await serperRes.json();
		const organicResults = serperData.organic ?? [];

		// 🧼 Format results into a plain-text prompt
		const formattedResults = organicResults
			.slice(0, 3) // limit to first 3 results
			.map((item, i) => `${i + 1}. ${item.title}\n${item.link}\n${item.snippet}`)
			.join('\n\n');
		const prompt = `${formattedResults}\n\n${ai}`;

		const systemPrompt =
			'You are to act as a data cleaning tool. You will receive a list of 10 Google search results, plus one question regarding the results. Please be as concise and accurate as possible. If you are asked for a link, simply state the URL and nothing more.';

		// 🧠 AI answer
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

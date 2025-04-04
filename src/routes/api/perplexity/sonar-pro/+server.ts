import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const body = await request.json();

	const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`
		},
		body: JSON.stringify({
			model: 'sonar-pro',
			messages: [
				{
					role: 'system',
					content: 'Be precise and concise.'
				},
				{
					role: 'user',
					content: body.prompt // dynamic user input
				}
			]
		})
	});

	if (!perplexityRes.ok) {
		const errorText = await perplexityRes.text();
		return json({ error: errorText }, { status: perplexityRes.status });
	}

	const result = await perplexityRes.json();
	return json(result);
}

import { json } from '@sveltejs/kit';

import { PERPLEXITY_API_KEY } from '$env/static/private';

export async function POST({ request }) {
	const body = await request.json();

	const systemPrompt = body.systemPrompt || 'Be precise and concise.';

	const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			Authorization: `Bearer ${PERPLEXITY_API_KEY}`
		},
		body: JSON.stringify({
			model: 'sonar-pro',
			messages: [
				{
					role: 'system',
					content: systemPrompt
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
	const message = result.choices?.[0]?.message?.content || 'No response';

	return json({ message });
}

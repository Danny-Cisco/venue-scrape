import { json } from '@sveltejs/kit';
import { PERPLEXITY_API_KEY } from '$env/static/private';

const fetchPerplexityResponse = async (systemPrompt: string, userPrompt: string) => {
	const res = await fetch('https://api.perplexity.ai/chat/completions', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			Authorization: `Bearer ${PERPLEXITY_API_KEY}`
		},
		body: JSON.stringify({
			model: 'sonar-pro',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			]
		})
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Perplexity API error: ${res.status} - ${errorText}`);
	}

	const jsonRes = await res.json();
	const content = jsonRes.choices?.[0]?.message?.content;

	if (!content) {
		throw new Error('Missing message content from Perplexity');
	}

	return content;
};

export async function POST({ request }) {
	try {
		const body = await request.json();
		const systemPrompt = body.systemPrompt || 'Be precise and concise.';
		const userPrompt = body.prompt;

		// Run 3 requests in parallel
		const responses = await Promise.allSettled([
			fetchPerplexityResponse(systemPrompt, userPrompt),
			fetchPerplexityResponse(systemPrompt, userPrompt),
			fetchPerplexityResponse(systemPrompt, userPrompt)
		]);

		// Use a Set for deduplication
		const urlSet = new Set<string>();

		for (const [i, result] of responses.entries()) {
			if (result.status === 'fulfilled') {
				const raw = result.value;
				console.log(`[Response ${i}] Raw:`, raw);

				try {
					const parsed = JSON.parse(raw);
					if (Array.isArray(parsed.socialUrls)) {
						for (const url of parsed.socialUrls) {
							urlSet.add(url);
						}
					} else {
						console.warn(`[Response ${i}] No socialUrls found.`);
					}
				} catch (err) {
					console.error(`[Response ${i}] JSON parse error`, err);
				}
			} else {
				console.error(`[Response ${i}] Failed:`, result.reason);
			}
		}

		const uniqueUrls = Array.from(urlSet);
		const final = JSON.stringify({ socialUrls: uniqueUrls });

		return json({ message: final });
	} catch (err) {
		console.error('[Fatal Error in POST handler]', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

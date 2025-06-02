import { PRIVATE_SERPER_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const query = url.searchParams.get('query');

	if (!query) {
		return json({ error: 'Missing search query' }, { status: 400 });
	}

	const requestBody = JSON.stringify({
		q: query
	});

	try {
		const response = await fetch('https://google.serper.dev/search', {
			method: 'POST',
			headers: {
				'X-API-KEY': PRIVATE_SERPER_API_KEY,
				'Content-Type': 'application/json'
			},
			body: requestBody
		});

		const fullData = await response.json();

		if (!response.ok) {
			return json({ error: fullData.error || 'Search failed' }, { status: response.status });
		}

		// Only return the `organic` results
		return json(fullData.organic ?? []);
	} catch (err) {
		console.error('❌ Serper API error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

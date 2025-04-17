import { GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const query = url.searchParams.get('q');

	if (!query) {
		return json({ error: 'Missing search query' }, { status: 400 });
	}

	const endpoint = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;

	const response = await fetch(endpoint);
	const data = await response.json();

	if (!response.ok) {
		return json({ error: data.error || 'Search failed' }, { status: response.status });
	}

	return json(data);
}

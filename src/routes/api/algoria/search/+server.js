import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const venue = url.searchParams.get('venue');
	if (!venue) {
		return json({ error: 'Missing venue parameter' }, { status: 400 });
	}

	const ALGOLIA_APP_ID = 'ICGFYQWGTD';
	const ALGOLIA_API_KEY = 'bc11adffff267d354ad0a04aedebb5b5';
	const ALGOLIA_URL = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/*/queries`;

	// Build query safely with URLSearchParams to escape ampersand
	const queryParams = new URLSearchParams({
		maxValuesPerFacet: '150',
		highlightPreTag: '__ais-highlight__',
		highlightPostTag: '__/ais-highlight__',
		page: '0',
		query: '',
		facets: '["Venue.State","Categories","Bands","Venue.Name"]',
		tagFilters: '',
		facetFilters: JSON.stringify([[`Venue.Name:${venue}`]])
	}).toString();

	const facetDiscoveryParams = new URLSearchParams({
		maxValuesPerFacet: '150',
		highlightPreTag: '__ais-highlight__',
		highlightPostTag: '__/ais-highlight__',
		page: '0',
		query: '',
		hitsPerPage: '1',
		attributesToRetrieve: '[]',
		attributesToHighlight: '[]',
		attributesToSnippet: '[]',
		tagFilters: '',
		analytics: 'false',
		clickAnalytics: 'false',
		facets: 'Venue.Name'
	}).toString();

	const requestBody = {
		requests: [
			{
				indexName: 'prod_oztix_eventguide',
				params: queryParams
			},
			{
				indexName: 'prod_oztix_eventguide',
				params: facetDiscoveryParams
			}
		]
	};

	const response = await fetch(ALGOLIA_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Algolia-Application-Id': ALGOLIA_APP_ID,
			'X-Algolia-API-Key': ALGOLIA_API_KEY
		},
		body: JSON.stringify(requestBody)
	});

	const data = await response.json();

	if (!response.ok) {
		return json({ error: data.message || 'Search failed' }, { status: response.status });
	}

	return json(data.results?.[0] ?? {});
}

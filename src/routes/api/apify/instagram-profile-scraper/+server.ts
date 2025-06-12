import { json } from '@sveltejs/kit';
import { ApifyClient } from 'apify-client';
import { APIFY_TOKEN } from '$env/static/private';

// Initialize the ApifyClient with API token
const client = new ApifyClient({
	token: APIFY_TOKEN
});

export async function POST({ url }) {
	const username = url.searchParams.get('username');

	if (!username) {
		return json({ error: 'Missing username parameter' }, { status: 400 });
	}

	// Prepare Actor input
	const input = {
		usernames: [username]
	};

	try {
		// Run the Actor and wait for it to finish
		const run = await client.actor('dSCLg0C3YEZ83HzYX').call(input);

		// Fetch results from the Actor's dataset
		const { items } = await client.dataset(run.defaultDatasetId).listItems();

		// Log for debugging, optional
		// console.log('✅ Results from dataset:', items);

		// Respond with the scraped data
		return json({ data: items }, { status: 200 });
	} catch (error) {
		console.error('❌ Error calling Apify Actor:', error);
		return json({ error: 'Apify Actor call failed', details: error.message }, { status: 500 });
	}
}

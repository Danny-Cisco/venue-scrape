// src/routes/api/openai/embeddings/+server.js
import { json } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { input, model } = await request.json();

		const response = await fetch('https://api.openai.com/v1/embeddings', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENAI_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				input,
				model: model || 'text-embedding-3-small'
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error?.message || 'Failed to get embedding');
		}

		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('Error in embeddings endpoint:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export async function POST({ request }) {
	try {
		// Parse the incoming request to get the question
		const { question, systemPrompt } = await request.json();

		if (!question) {
			return new Response(JSON.stringify({ error: 'Question is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Format the single message into the chat completions format
		const messages = [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: question }
		];

		// Send the formatted messages to OpenAI API
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages
		});

		// Extract the assistant's reply
		const reply = response.choices[0]?.message?.content || '';

		// Return just the text response for simplicity
		return new Response(JSON.stringify({ answer: reply }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('❌ Error:', error);

		return new Response(
			JSON.stringify({ error: 'An error occurred while processing the request.' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}

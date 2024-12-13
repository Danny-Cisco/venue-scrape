import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export async function POST({ request }) {
	try {
		// Parse the incoming request
		const { messages } = await request.json();

		// Log the incoming messages
		// console.log('🚀 ~ Received messages:', JSON.stringify(messages, null, 2));
		// console.log('🚀 ~ Received messages:';

		// Send the messages to OpenAI API as-is
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages
		});

		// Extract and log the assistant's reply
		const reply = response.choices[0]?.message || {};
		// console.log('✅ ~ Assistant reply:', JSON.stringify(reply, null, 2));
		// console.log('✅ ~ Assistant reply:');

		// Return the assistant's reply
		return new Response(JSON.stringify({ reply }), {
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

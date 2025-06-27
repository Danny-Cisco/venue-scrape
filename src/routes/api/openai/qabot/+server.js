import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST({ request }) {
	try {
		const { systemPrompt = '', question = '', imageBase64 = '' } = await request.json();

		if (!systemPrompt || (!question && !imageBase64)) {
			return new Response(
				JSON.stringify({
					error: 'You must provide a systemPrompt and either a question or imageBase64.'
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		const messages = [{ role: 'system', content: systemPrompt }];

		if (imageBase64) {
			// Append image input and optional question
			messages.push({
				role: 'user',
				content: [
					...(question ? [{ type: 'text', text: question }] : []),
					{ type: 'image_url', image_url: { url: imageBase64 } }
				]
			});
		} else {
			// Only question, no image
			messages.push({ role: 'user', content: question });
		}

		const model = imageBase64 ? 'gpt-4o' : 'gpt-4.1-mini';
		// const model = 'gpt-4o-mini';

		const response = await openai.chat.completions.create({
			model,
			messages
		});

		const reply = response.choices[0]?.message?.content || '';

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

import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST({ request }) {
	try {
		const {
			systemPrompt = '',
			question = '',
			imageBase64 = '',
			imageUrl = ''
		} = await request.json();

		if (!systemPrompt || (!question && !imageBase64 && !imageUrl)) {
			return new Response(
				JSON.stringify({
					error:
						'You must provide a systemPrompt and at least one of question, imageBase64, or imageUrl.'
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		const messages = [{ role: 'system', content: systemPrompt }];

		if (imageBase64 || imageUrl) {
			// Append image input and optional question
			const imageContent = {
				type: 'image_url',
				image_url: {
					url: imageBase64 || imageUrl
				}
			};

			const userContent = [];
			if (question) {
				userContent.push({ type: 'text', text: question });
			}
			userContent.push(imageContent);

			messages.push({ role: 'user', content: userContent });
		} else {
			// Only question, no image
			messages.push({ role: 'user', content: question });
		}

		const model = imageBase64 || imageUrl ? 'gpt-4o' : 'gpt-4.1-mini';

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

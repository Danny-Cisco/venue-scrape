import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

// Define the system prompt as a constant
const SYSTEM_PROMPT = {
	role: 'system',
	content:
		"you are to function as a system for extracting the deeper underlying topics and ideas and themes emotions from a text: analyse the following response and output json formatted file containing the following fields 'topics', 'ideas', 'themes', 'wikipedia', 'emotions'. The 'wikipedia' field is to output a few related topics that would be found on wikipedia. The Emotions field should choose the most relavant emotion from this list Adoration/Joy, Amusement, Anger, Awe/Surprise, Calmness, Confusion, Contempt/Pride, Contentment, Craving, Desire/Love, Disappointment/Shame, Distress/Disgust, Fear, Interest, Pain/Sadness. DO NOT USE backticks place in a codeblock, just output the pure json"
};

export async function POST({ request }) {
	try {
		// Parse the incoming request
		const { messages } = await request.json();

		// Create a new array with the system prompt followed by user messages
		const messagesWithSystem = [SYSTEM_PROMPT, ...messages];

		// Send the messages to OpenAI API
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: messagesWithSystem
		});

		// Extract the assistant's reply
		const reply = response.choices[0]?.message || {};
		console.log('🚀 get-concepts chatreply:', reply);

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

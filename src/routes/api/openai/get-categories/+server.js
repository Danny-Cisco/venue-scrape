import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

const SYSTEM_PROMPT = {
	role: 'system',
	content:
		'you are to function as a system for tagging a list of topics in json format: First step is to decide on a handful of categories that will collect most of the provided topics. Then create a json in the following format {Thinking: <use this feild to decide on which categories might be suitable>; NumberOfCategories: <Number of Categories>; CategoryNames: [<Names of all the Categories as an array>] ; <Category1Name>:[<insert an array off all the topics for category 1>];<Category2Name>:[<insert an array off all the topics for category 2>]; continue for all categories.  DO NOT USE backticks place in a codeblock, just output the pure json'
};

export async function POST({ request }) {
	try {
		// Parse the incoming request
		const { messages } = await request.json();

		// Ensure messages are formatted correctly
		const formattedMessages = messages.map((msg) => ({
			role: msg.role,
			content: [{ type: 'text', text: msg.content }]
		}));

		// Create a new array with the system prompt followed by user messages
		const messagesWithSystem = [SYSTEM_PROMPT, ...formattedMessages];

		// Send the messages to OpenAI API
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: messagesWithSystem
		});

		// Extract the assistant's reply
		const reply = response.choices[0]?.message || {};
		console.log('🚀 get-categories chatreply:', reply);

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

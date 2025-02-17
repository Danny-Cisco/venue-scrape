import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export async function POST({ request }) {
	try {
		// Get the JSON data from the request
		const { audio } = await request.json();

		if (!audio) {
			return new Response(JSON.stringify({ error: 'No audio data provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Convert base64 to buffer
		const buffer = Buffer.from(audio, 'base64');

		// Create a file from the buffer
		const file = new File([buffer], 'audio.wav', { type: 'audio/wav' });

		// Send to OpenAI's Whisper API
		const transcription = await openai.audio.transcriptions.create({
			file: file,
			model: 'whisper-1'
		});

		// Return the transcription
		return new Response(
			JSON.stringify({
				transcription: transcription.text
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		console.error('❌ Error:', error);

		return new Response(
			JSON.stringify({
				error: 'An error occurred while transcribing the audio.'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}

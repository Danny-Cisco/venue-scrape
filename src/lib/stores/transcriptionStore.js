// transcriptionStore.js
import { writable } from 'svelte/store';

// Create the transcriptions store
export const transcriptionStore = writable([]);

// Function to get embeddings from OpenAI API
async function getEmbedding(text) {
	try {
		const response = await fetch('api/openai/embeddings', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				input: text,
				model: 'text-embedding-3-small'
			})
		});

		if (!response.ok) {
			throw new Error('Failed to get embedding');
		}

		const data = await response.json();
		return data.data[0].embedding;
	} catch (error) {
		console.error('Error getting embedding:', error);
		return null;
	}
}

// Function to add a new transcription with embedding
export async function addTranscription(transcription) {
	const embedding = await getEmbedding(transcription.text);

	const transcriptionWithEmbedding = {
		...transcription,
		embedding,
		id: crypto.randomUUID() // Add a unique ID for each transcription
	};

	transcriptionStore.update((currentTranscriptions) => [
		...currentTranscriptions,
		transcriptionWithEmbedding
	]);

	return transcriptionWithEmbedding;
}

// Function to remove a transcription
export function removeTranscription(id) {
	transcriptionStore.update((currentTranscriptions) =>
		currentTranscriptions.filter((t) => t.id !== id)
	);
}

// Function to get all transcriptions
export function getTranscriptions() {
	let transcriptions;
	transcriptionStore.subscribe((value) => {
		transcriptions = value;
	})();
	return transcriptions;
}

// Optional: Function to search similar transcriptions using cosine similarity
export function findSimilarTranscriptions(embedding, threshold = 0.8) {
	let transcriptions;
	transcriptionStore.subscribe((value) => {
		transcriptions = value;
	})();

	return transcriptions
		.map((t) => ({
			...t,
			similarity: cosineSimilarity(embedding, t.embedding)
		}))
		.filter((t) => t.similarity >= threshold)
		.sort((a, b) => b.similarity - a.similarity);
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vectorA, vectorB) {
	if (!vectorA || !vectorB || vectorA.length !== vectorB.length) return 0;

	const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
	const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
	const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

	return dotProduct / (magnitudeA * magnitudeB);
}

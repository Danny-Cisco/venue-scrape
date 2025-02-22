import { writable, derived } from 'svelte/store';

// Create the transcriptions store
export const transcriptionStore = writable([]);
export const searchTermStore = writable('');

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

// Function to search transcriptions by text
export async function searchTranscriptions(searchText, limit = 10) {
	const searchEmbedding = await getEmbedding(searchText);
	if (!searchEmbedding) return [];

	let transcriptions;
	const unsubscribe = transcriptionStore.subscribe((value) => {
		transcriptions = value;
	});
	unsubscribe();

	const results = transcriptions
		.map((t) => ({
			...t,
			similarity: cosineSimilarity(searchEmbedding, t.embedding)
		}))
		.sort((a, b) => b.similarity - a.similarity)
		.slice(0, limit);

	return results;
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
	const unsubscribe = transcriptionStore.subscribe((value) => {
		transcriptions = value;
	});
	unsubscribe();
	return transcriptions;
}

// Optional: Function to search similar transcriptions using cosine similarity
export function findSimilarTranscriptions(embedding, threshold = 0.8) {
	let transcriptions;
	const unsubscribe = transcriptionStore.subscribe((value) => {
		transcriptions = value;
	});
	unsubscribe();

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

// Create a custom store for handling async similarity updates
function createSimilarityStore() {
	const { subscribe, set } = writable([]);

	let currentSearchTerm = '';
	let currentTranscriptions = [];

	// Subscribe to both stores
	transcriptionStore.subscribe((transcriptions) => {
		currentTranscriptions = transcriptions;
		updateSimilarities();
	});

	searchTermStore.subscribe((searchTerm) => {
		currentSearchTerm = searchTerm;
		updateSimilarities();
	});

	async function updateSimilarities() {
		if (!currentSearchTerm.trim()) {
			set(currentTranscriptions.map((t) => ({ ...t, similarity: 0 })));
			return;
		}

		const searchEmbedding = await getEmbedding(currentSearchTerm);
		if (!searchEmbedding) {
			set(currentTranscriptions.map((t) => ({ ...t, similarity: 0 })));
			return;
		}

		const transcriptionsWithSimilarity = currentTranscriptions.map((t) => ({
			...t,
			similarity: cosineSimilarity(searchEmbedding, t.embedding)
		}));

		set(transcriptionsWithSimilarity);
	}

	return {
		subscribe
	};
}

// Export the similarity store
export const transcriptionSimilarityStore = createSimilarityStore();

// Baseline text for general conversation
const BASELINE_TEXT =
	'Hi, welcome, nice to meet you. Lets begin. This is a general conversation about everyday topics. It includes common subjects like weather, work, and daily activities.';

// Store for the baseline embedding
const baselineStore = writable(null);

// Initialize the baseline embedding when the module loads
(async () => {
	const embedding = await getEmbedding(BASELINE_TEXT);
	baselineStore.set(embedding);
})();

// Create a derived store for surprise values that depends on both stores
export const transcriptionSurpriseStore = derived(
	[transcriptionStore, baselineStore],
	([$transcriptionStore, $baselineEmbedding]) => {
		// If baseline isn't loaded yet, return transcriptions without surprise values
		if (!$baselineEmbedding) {
			return $transcriptionStore.map((t) => ({ ...t, surprise: 0 }));
		}

		return $transcriptionStore.map((transcription, index) => {
			let surprise;

			if (index === 0) {
				// For first transcription, compare with baseline
				surprise = 1 - cosineSimilarity(transcription.embedding, $baselineEmbedding);
			} else {
				// Compare with previous transcription
				const previousTranscription = $transcriptionStore[index - 1];
				surprise = 1 - cosineSimilarity(transcription.embedding, previousTranscription.embedding);
			}

			return {
				...transcription,
				surprise: parseFloat(surprise.toFixed(4))
			};
		});
	}
);

// Optional: Export function to manually update baseline if needed
export async function updateBaseline(newBaselineText = BASELINE_TEXT) {
	const embedding = await getEmbedding(newBaselineText);
	baselineStore.set(embedding);
}

<!-- DualRecorder.svelte -->
<script>
	import AudioRecorder from './AudioRecorder.svelte';
	import { writable, derived } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import {
		transcriptionStore,
		addTranscription,
		searchTranscriptions,
		searchTermStore
	} from '$lib/stores/transcriptionStore.js';
	import { categoryStore } from '$lib/stores/categoryStore.js';
	import SearchBox from '$lib/components/outputs/SearchBox.svelte';

	export let recordChunk = 10;
	export let recordOverlap = 2;

	import Button from '$lib/components/ui/Button.svelte';

	import { isRecording, start, stop } from '$lib/stores/isRecordingStore.js';

	$: $isRecording;

	$: $searchTermStore;

	$: if ($start) {
		startRecording();
	}
	$: if ($stop) {
		stopRecording();
	}

	// Recording state variables
	let stream = null;
	let recorder1Active = false;
	let recorder2Active = false;
	let error = '';
	let RECORD_DURATION = recordChunk * 1000;
	let OVERLAP_DURATION = recordOverlap * 1000;
	const SWITCH_INTERVAL = RECORD_DURATION - OVERLAP_DURATION;

	// Emotion categorization
	const emotionCategories = {
		positive: ['Adoration/Joy', 'Amusement', 'Awe/Surprise', 'Desire/Love', 'Interest', 'Joy'],
		neutral: ['Neutral', 'Contentment', 'Calmness', 'Confusion', 'Contempt/Pride', 'Craving'],
		negative: ['Anger', 'Disappointment/Shame', 'Distress/Disgust', 'Fear', 'Pain/Sadness']
	};

	// Create stores
	const topicsStore = writable([]);
	const ideasStore = writable([]);
	const themesStore = writable([]);
	const wikiEmotionsStore = writable([]);
	const selectedEmotions = writable(new Set());

	// Filtered Wikipedia entries based on selected emotions
	const filteredWikis = derived(
		[wikiEmotionsStore, selectedEmotions],
		([$wikiEmotionsStore, $selectedEmotions]) => {
			if ($selectedEmotions.size === 0) {
				return [...new Set($wikiEmotionsStore.map((item) => item.wiki))];
			}

			return [
				...new Set(
					$wikiEmotionsStore
						.filter((item) => {
							if (!Array.isArray(item.emotions)) {
								return false;
							}
							return item.emotions.some((emotion) => $selectedEmotions.has(emotion));
						})
						.map((item) => item.wiki)
				)
			];
		}
	);

	// Store variables
	let topics = [];
	let ideas = [];
	let themes = [];
	let wikiEmotions = [];
	let filteredWikisList = [];
	let selectedEmotionsList = new Set();

	let startTime = new Date();

	// Subscribe to stores
	topicsStore.subscribe((value) => (topics = value));
	ideasStore.subscribe((value) => (ideas = value));
	themesStore.subscribe((value) => (themes = value));
	wikiEmotionsStore.subscribe((value) => (wikiEmotions = value));
	filteredWikis.subscribe((value) => (filteredWikisList = value));
	selectedEmotions.subscribe((value) => (selectedEmotionsList = value));

	// Reactive declarations
	$: categories = $categoryStore;
	$: transcriptions = $transcriptionStore;
	$: uniqueEmotions = [...new Set(wikiEmotions.flatMap((item) => item.emotions))];
	$: if ($wikiEmotionsStore.length > 0) getCategories($wikiEmotionsStore);

	$: console.log('transcriptionStore: ', transcriptions);

	function getEmotionStyle(emotion) {
		if (emotionCategories.positive.includes(emotion)) {
			return {
				category: 'positive',
				bgColor: 'bg-green-100',
				textColor: 'text-green-800',
				borderColor: 'border-green-200'
			};
		} else if (emotionCategories.neutral.includes(emotion)) {
			return {
				category: 'neutral',
				bgColor: 'bg-amber-100',
				textColor: 'text-amber-800',
				borderColor: 'border-amber-200'
			};
		} else {
			return {
				category: 'negative',
				bgColor: 'bg-red-100',
				textColor: 'text-red-800',
				borderColor: 'border-red-200'
			};
		}
	}

	async function startRecording() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			$isRecording = true;
			startRecordingCycle();
		} catch (err) {
			error = 'Error accessing microphone: ' + err.message;
			console.error('Microphone access error:', err);
		}
	}

	function startRecordingCycle() {
		recorder1Active = true;

		startTime = new Date();

		function scheduleNextSwitch() {
			if (!$isRecording) return;

			setTimeout(() => {
				if (!$isRecording) return;

				if (recorder1Active) {
					recorder2Active = true;
					setTimeout(() => (recorder1Active = false), OVERLAP_DURATION);
				} else {
					recorder1Active = true;
					setTimeout(() => (recorder2Active = false), OVERLAP_DURATION);
				}

				scheduleNextSwitch();
			}, SWITCH_INTERVAL);
		}

		scheduleNextSwitch();
	}

	function stopRecording() {
		$isRecording = false;
		recorder1Active = false;
		recorder2Active = false;

		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	}

	async function analyzeTranscription(transcription) {
		try {
			const messages = [
				{
					role: 'user',
					content: transcription
				}
			];

			const response = await fetch('api/openai/get-concepts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ messages })
			});

			if (!response.ok) {
				throw new Error('Analysis request failed');
			}

			const data = await response.json();
			return JSON.parse(data.reply.content);
		} catch (err) {
			console.error('Error analyzing transcription:', err);
			return null;
		}
	}

	async function handleTranscriptionComplete(event) {
		const { transcription, recorderId } = event.detail;
		const currentTime = new Date();
		const durationMs = currentTime - startTime;
		const seconds = Math.floor((durationMs / 1000) % 60);
		const minutes = Math.floor((durationMs / 1000 / 60) % 60);
		const hours = Math.floor(durationMs / 1000 / 60 / 60);
		const time = `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`;

		const newTranscription = {
			recorder: recorderId,
			text: transcription,
			timestamp: time
		};

		const isDuplicate = transcriptions.some(
			(t) => t.recorder === recorderId && t.text === transcription
		);

		if (!isDuplicate) {
			// Add transcription with embedding to the store
			const transcriptionWithEmbedding = await addTranscription(newTranscription);

			// Get analysis and update stores
			const analysis = await analyzeTranscription(transcription);
			if (analysis) {
				const emotions = Array.isArray(analysis.emotions) ? analysis.emotions : [analysis.emotions];
				const capitalizedWikis = analysis.wikipedia.map(
					(wiki) => wiki.charAt(0).toUpperCase() + wiki.slice(1)
				);

				addWikiEmotions(capitalizedWikis, emotions, time);
				topicsStore.update((current) => [...current, { items: analysis.topics, time }]);
				ideasStore.update((current) => [...current, { items: analysis.ideas, time }]);
				themesStore.update((current) => [...current, { items: analysis.themes, time }]);
			}
		}
	}

	async function getCategories(topics) {
		try {
			const messages = [
				{
					role: 'user',
					content: `The wiki topics are as follows: ${JSON.stringify(topics, null, 2)}`
				}
			];

			const response = await fetch('api/openai/get-categories', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ messages })
			});

			if (!response.ok) {
				throw new Error('Get category request failed');
			}

			const data = await response.json();
			const categories = JSON.parse(data.reply.content);
			console.log('🚀 ~ getCategories ~ categories:', categories);

			// Update the store with the new categories
			categoryStore.set(categories);

			return categories;
		} catch (err) {
			console.error('Error getting categories:', err);
			// You might want to set the store to an empty array or null in case of error
			categoryStore.set([]);
			return null;
		}
	}

	// Helper function to add wiki entries with emotions
	function addWikiEmotions(wikiItems, emotions, timestamp) {
		wikiEmotionsStore.update((currentItems) => {
			const newEntries = wikiItems.map((wiki) => ({
				wiki,
				emotions: Array.isArray(emotions) ? emotions : [emotions],
				timestamp
			}));
			return [...currentItems, ...newEntries];
		});
	}

	// Add this function after addWikiEmotions
	function removeWikiEntry(wikiToRemove) {
		wikiEmotionsStore.update((currentItems) =>
			currentItems.filter((item) => item.wiki !== wikiToRemove)
		);
	}

	// Helper function to get the dominant emotion category for a wiki entry
	function getWikiEmotionCategory(wiki, wikiEmotions) {
		const entry = wikiEmotions.find((item) => item.wiki === wiki);
		if (!entry || !entry.emotions) return 'neutral';

		const categories = entry.emotions.map((emotion) => {
			if (emotionCategories.positive.includes(emotion)) return 'positive';
			if (emotionCategories.neutral.includes(emotion)) return 'neutral';
			return 'negative';
		});

		// Return most frequent category
		return categories.reduce((a, b) =>
			categories.filter((v) => v === a).length >= categories.filter((v) => v === b).length ? a : b
		);
	}

	// Toggle emotion selection
	function toggleEmotion(emotion) {
		selectedEmotions.update((current) => {
			const updated = new Set(current);
			if (updated.has(emotion)) {
				updated.delete(emotion);
			} else {
				updated.add(emotion);
			}
			return updated;
		});
	}
</script>

<div class="w-full mx-auto">
	{#if error}
		<div class="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
			{error}
		</div>
	{/if}

	<div class="flex hidden w-full gap-4 mb-4">
		<div class="flex-1">
			<AudioRecorder
				id="1"
				duration={RECORD_DURATION}
				bind:stream
				isActive={recorder1Active}
				on:transcriptionComplete={handleTranscriptionComplete}
			/>
		</div>
		<div class="flex-1">
			<AudioRecorder
				id="2"
				duration={RECORD_DURATION}
				bind:stream
				isActive={recorder2Active}
				on:transcriptionComplete={handleTranscriptionComplete}
			/>
		</div>
	</div>

	{#if transcriptions.length > 0}
		<div class="space-y-8">
			<div class="w-full p-6">
				<div class="flex flex-col gap-6">
					<!-- Emotions -->
					<div class="flex-1 space-y-4">
						<!-- <h3 class="text-lg font-semibold">Emotions</h3> -->
						<div class="flex flex-wrap gap-2">
							{#each uniqueEmotions as emotion}
								{@const style = getEmotionStyle(emotion)}
								<button
									class="px-4 py-2 text-sm transition-transform border rounded-full cursor-pointer hover:scale-105 {style.bgColor} {style.textColor} {style.borderColor} {selectedEmotionsList.has(
										emotion
									)
										? 'ring-2 ring-offset-2'
										: ''}"
									on:click={() => toggleEmotion(emotion)}
									transition:fly
								>
									{emotion}
								</button>
							{/each}
						</div>
					</div>

					<div class="border-t border-dashed border-black/10" />

					<!-- Wikipedia -->
					<div class="flex-1 space-y-4">
						<div class="flex flex-wrap gap-2">
							{#each filteredWikisList as wiki}
								{@const category = getWikiEmotionCategory(wiki, wikiEmotions)}
								<div class="flex items-center gap-1" transition:fly>
									<button
										on:click={() => ($searchTermStore = wiki)}
										class="flex items-center gap-2 px-4 py-2 text-sm text-purple-800 no-underline transition-transform bg-purple-100 border border-purple-200 rounded-full cursor-pointer hover:scale-105"
									>
										<span
											class="w-2 h-2 rounded-full {category === 'positive'
												? 'bg-green-500'
												: category === 'neutral'
													? 'bg-amber-500'
													: 'bg-red-500'}"
										></span>
										{wiki}
									</button>
									<button
										on:click={() => removeWikiEntry(wiki)}
										class="flex items-center justify-center w-6 h-6 text-gray-500 transition-colors rounded-full hover:bg-red-100 hover:text-red-500"
										aria-label="Remove {wiki}"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="w-4 h-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<line x1="18" y1="6" x2="6" y2="18" />
											<line x1="6" y1="6" x2="18" y2="18" />
										</svg>
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

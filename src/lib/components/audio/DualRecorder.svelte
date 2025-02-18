<!-- DualRecorder.svelte -->
<script>
	import AudioRecorder from './AudioRecorder.svelte';
	import { writable, derived } from 'svelte/store';
	import { fly } from 'svelte/transition';

	export let recordChunk = 10;
	export let recordOverlap = 2;
	let stream = null;
	let isRecording = false;
	let recorder1Active = false;
	let recorder2Active = false;
	let transcriptions = [];
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
			// console.log('Store contents:', $wikiEmotionsStore);
			// console.log('Selected emotions:', $selectedEmotions);

			if ($selectedEmotions.size === 0) {
				return [...new Set($wikiEmotionsStore.map((item) => item.wiki))];
			}

			return [
				...new Set(
					$wikiEmotionsStore
						.filter((item) => {
							if (!Array.isArray(item.emotions)) {
								// console.warn('Item emotions is not an array:', item);
								return false;
							}
							return item.emotions.some((emotion) => $selectedEmotions.has(emotion));
						})
						.map((item) => item.wiki)
				)
			];
		}
	);

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

	async function startRecording() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			isRecording = true;
			startRecordingCycle();
		} catch (err) {
			error = 'Error accessing microphone: ' + err.message;
			console.error('Microphone access error:', err);
		}
	}

	function startRecordingCycle() {
		recorder1Active = true;

		function scheduleNextSwitch() {
			if (!isRecording) return;

			setTimeout(() => {
				if (!isRecording) return;

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
		isRecording = false;
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
		// console.log(`Received transcription from recorder ${recorderId}`);

		const timestamp = new Date().toISOString();
		const newTranscription = {
			recorder: recorderId,
			text: transcription,
			timestamp: timestamp
		};

		const isDuplicate = transcriptions.some(
			(t) =>
				t.recorder === recorderId &&
				t.text === transcription &&
				Math.abs(new Date(t.timestamp) - new Date(timestamp)) < 1000
		);

		if (!isDuplicate) {
			// console.log(`Adding new transcription from recorder ${recorderId}`);
			transcriptions = [...transcriptions, newTranscription];

			// Get analysis and update stores
			const analysis = await analyzeTranscription(transcription);
			if (analysis) {
				// Ensure emotions is an array
				const emotions = Array.isArray(analysis.emotions) ? analysis.emotions : [analysis.emotions];

				// Capitalize first letter of each Wikipedia entry
				const capitalizedWikis = analysis.wikipedia.map(
					(wiki) => wiki.charAt(0).toUpperCase() + wiki.slice(1)
				);

				addWikiEmotions(capitalizedWikis, emotions, timestamp);
				topicsStore.update((current) => [...current, { items: analysis.topics, timestamp }]);
				ideasStore.update((current) => [...current, { items: analysis.ideas, timestamp }]);
				themesStore.update((current) => [...current, { items: analysis.themes, timestamp }]);
			}
		} else {
			// console.log(`Skipping duplicate transcription from recorder ${recorderId}`);
		}
	}

	// Subscribe to stores
	let topics = [];
	let ideas = [];
	let themes = [];
	let wikiEmotions = [];
	let filteredWikisList = [];
	let selectedEmotionsList = new Set();

	topicsStore.subscribe((value) => (topics = value));
	ideasStore.subscribe((value) => (ideas = value));
	themesStore.subscribe((value) => (themes = value));
	wikiEmotionsStore.subscribe((value) => (wikiEmotions = value));
	filteredWikis.subscribe((value) => (filteredWikisList = value));
	selectedEmotions.subscribe((value) => (selectedEmotionsList = value));

	// Get all unique emotions from the store
	$: uniqueEmotions = [...new Set(wikiEmotions.flatMap((item) => item.emotions))];

	// Add this function after addWikiEmotions
	function removeWikiEntry(wikiToRemove) {
		wikiEmotionsStore.update((currentItems) =>
			currentItems.filter((item) => item.wiki !== wikiToRemove)
		);
	}
</script>

<div class="w-full mx-auto">
	<div class="flex flex-col w-full mb-6">
		{#if !isRecording}
			<button
				on:click={startRecording}
				class="w-full mx-auto font-bold text-black/50 rounded-3xl hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<defs>
						<path
							id="wave1"
							d="M0,160 C180,100 360,220 540,160 C720,100 900,220 1080,160 C1260,100 1440,220 1620,160"
						>
							<animate
								attributeName="d"
								dur="7.3s"
								repeatCount="indefinite"
								values="
          M0,160 C180,100 360,220 540,160 C720,100 900,220 1080,160 C1260,100 1440,220 1620,160;
          M0,160 C180,220 360,100 540,160 C720,220 900,100 1080,160 C1260,220 1440,100 1620,160;
          M0,160 C180,100 360,220 540,160 C720,100 900,220 1080,160 C1260,100 1440,220 1620,160"
							/>
						</path>

						<path
							id="wave2"
							d="M-120,160 C120,60 360,260 600,160 C840,60 1080,260 1320,160 C1560,60 1800,260 2040,160"
						>
							<animate
								attributeName="d"
								dur="8.7s"
								repeatCount="indefinite"
								values="
          M-120,160 C120,60 360,260 600,160 C840,60 1080,260 1320,160 C1560,60 1800,260 2040,160;
          M-120,160 C120,260 360,60 600,160 C840,260 1080,60 1320,160 C1560,260 1800,60 2040,160;
          M-120,160 C120,60 360,260 600,160 C840,60 1080,260 1320,160 C1560,60 1800,260 2040,160"
							/>
						</path>

						<path
							id="wave3"
							d="M-240,160 C60,140 360,180 660,160 C960,140 1260,180 1560,160 C1860,140 2160,180 2460,160"
						>
							<animate
								attributeName="d"
								dur="11.5s"
								repeatCount="indefinite"
								values="
          M-240,160 C60,140 360,180 660,160 C960,140 1260,180 1560,160 C1860,140 2160,180 2460,160;
          M-240,160 C60,180 360,140 660,160 C960,180 1260,140 1560,160 C1860,180 2160,140 2460,160;
          M-240,160 C60,140 360,180 660,160 C960,140 1260,180 1560,160 C1860,140 2160,180 2460,160"
							/>
						</path>
					</defs>

					<use href="#wave1" stroke="#4287f5" fill="none" stroke-width="2" />
					<use href="#wave2" stroke="#4287f5" fill="none" stroke-width="2" opacity="0.7" />
					<use href="#wave3" stroke="#4287f5" fill="none" stroke-width="2" opacity="0.5" />
				</svg>
				<div class="border rounded-full btn">Start</div>
			</button>
		{:else}
			<button
				on:click={stopRecording}
				class="w-full px-4 mx-auto font-bold text-black/50 rounded-3xl hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<defs>
						<path
							id="wave1"
							d="M0,160 C180,40 360,280 540,160 C720,40 900,280 1080,160 C1260,40 1440,280 1620,160"
						>
							<animate
								attributeName="d"
								dur="3.1s"
								repeatCount="indefinite"
								values="
          M0,160 C180,40 360,280 540,160 C720,40 900,280 1080,160 C1260,40 1440,280 1620,160;
          M0,160 C180,280 360,40 540,160 C720,280 900,40 1080,160 C1260,280 1440,40 1620,160;
          M0,160 C180,40 360,280 540,160 C720,40 900,280 1080,160 C1260,40 1440,280 1620,160"
							/>
						</path>

						<path
							id="wave2"
							d="M-120,160 C120,20 360,300 600,160 C840,20 1080,300 1320,160 C1560,20 1800,300 2040,160"
						>
							<animate
								attributeName="d"
								dur="2.7s"
								repeatCount="indefinite"
								values="
          M-120,160 C120,20 360,300 600,160 C840,20 1080,300 1320,160 C1560,20 1800,300 2040,160;
          M-120,160 C120,300 360,20 600,160 C840,300 1080,20 1320,160 C1560,300 1800,20 2040,160;
          M-120,160 C120,20 360,300 600,160 C840,20 1080,300 1320,160 C1560,20 1800,300 2040,160"
							/>
						</path>

						<path
							id="wave3"
							d="M-240,160 C60,60 360,260 660,160 C960,60 1260,260 1560,160 C1860,60 2160,260 2460,160"
						>
							<animate
								attributeName="d"
								dur="3.9s"
								repeatCount="indefinite"
								values="
          M-240,160 C60,60 360,260 660,160 C960,60 1260,260 1560,160 C1860,60 2160,260 2460,160;
          M-240,160 C60,260 360,60 660,160 C960,260 1260,60 1560,160 C1860,260 2160,60 2460,160;
          M-240,160 C60,60 360,260 660,160 C960,60 1260,260 1560,160 C1860,60 2160,260 2460,160"
							/>
						</path>
					</defs>

					<use href="#wave1" stroke="#4287f5" fill="none" stroke-width="2" />
					<use href="#wave2" stroke="#4287f5" fill="none" stroke-width="2" opacity="0.7" />
					<use href="#wave3" stroke="#4287f5" fill="none" stroke-width="2" opacity="0.5" />
				</svg>
				<div class="border rounded-full btn">Stop</div>
			</button>
		{/if}
	</div>

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
		<div class="mt-6 space-y-8">
			<div class="w-full p-6">
				<div class="flex gap-6">
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

					<!-- Wikipedia -->
					<div class="flex-1 space-y-4">
						<!-- <h3 class="text-lg font-semibold text-purple-600">Wikipedia</h3> -->
						<div class="flex flex-wrap gap-2">
							{#each filteredWikisList as wiki}
								{@const category = getWikiEmotionCategory(wiki, wikiEmotions)}
								<div class="flex items-center gap-1" transition:fly>
									<a
										href={`https://en.wikipedia.org/wiki/${encodeURIComponent(wiki)}`}
										target="_blank"
										rel="noopener noreferrer"
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
									</a>
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
											<line x1="18" y1="6" x2="6" y2="18"></line>
											<line x1="6" y1="6" x2="18" y2="18"></line>
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

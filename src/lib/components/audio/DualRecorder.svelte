<!-- DualRecorder.svelte -->
<script>
	import AudioRecorder from './AudioRecorder.svelte';
	import { writable, derived } from 'svelte/store';

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

	// Create stores for each category
	const topicsStore = writable([]);
	const ideasStore = writable([]);
	const themesStore = writable([]);
	const emotionsStore = writable([]);
	const wikipediaStore = writable([]);

	// Helper function to add items to a store with timestamps
	function addToStore(store, items, timestamp) {
		store.update((currentItems) => [
			...currentItems,
			{
				items,
				timestamp
			}
		]);
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
		console.log(`Received transcription from recorder ${recorderId}`);

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
			console.log(`Adding new transcription from recorder ${recorderId}`);
			transcriptions = [...transcriptions, newTranscription];

			// Get analysis and update stores
			const analysis = await analyzeTranscription(transcription);
			if (analysis) {
				addToStore(topicsStore, analysis.topics, timestamp);
				addToStore(ideasStore, analysis.ideas, timestamp);
				addToStore(themesStore, analysis.themes, timestamp);
				addToStore(emotionsStore, analysis.emotions, timestamp);
				addToStore(wikipediaStore, analysis.wikipedia, timestamp);
			}
		} else {
			console.log(`Skipping duplicate transcription from recorder ${recorderId}`);
		}
	}

	// Subscribe to stores to get latest values
	let topics = [];
	let ideas = [];
	let themes = [];
	let emotions = [];
	let wikipedia = [];

	topicsStore.subscribe((value) => (topics = value));
	ideasStore.subscribe((value) => (ideas = value));
	themesStore.subscribe((value) => (themes = value));
	emotionsStore.subscribe((value) => (emotions = value));
	wikipediaStore.subscribe((value) => (wikipedia = value));

	// Add this helper function to flatten arrays while removing duplicates
	function uniqueItems(arrays) {
		return [...new Set(arrays.flatMap((arr) => arr.items))];
	}
</script>

<div class="w-full p-4 mx-auto">
	<div class="flex flex-col w-full mb-6">
		{#if !isRecording}
			<button
				on:click={startRecording}
				class="w-48 h-48 px-4 mx-auto font-bold text-white bg-blue-400 rounded-3xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M11.9998 3C10.3429 3 8.99976 4.34315 8.99976 6V10C8.99976 11.6569 10.3429 13 11.9998 13C13.6566 13 14.9998 11.6569 14.9998 10V6C14.9998 4.34315 13.6566 3 11.9998 3ZM11.9998 1C14.7612 1 16.9998 3.23858 16.9998 6V10C16.9998 12.7614 14.7612 15 11.9998 15C9.23833 15 6.99976 12.7614 6.99976 10V6C6.99976 3.23858 9.23833 1 11.9998 1ZM3.05469 11H5.07065C5.55588 14.3923 8.47329 17 11.9998 17C15.5262 17 18.4436 14.3923 18.9289 11H20.9448C20.4837 15.1716 17.1714 18.4839 12.9998 18.9451V23H10.9998V18.9451C6.82814 18.4839 3.51584 15.1716 3.05469 11Z"
					></path></svg
				>
				Start Recording
			</button>
		{:else}
			<button
				on:click={stopRecording}
				class="w-48 h-48 px-4 mx-auto font-bold text-white bg-blue-400 rounded-3xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M16.4249 17.839L21.1925 22.6066L22.6068 21.1924L2.80777 1.3934L1.39355 2.80761L7.00016 8.41421V10C7.00016 12.7614 9.23873 15 12.0002 15C12.4825 15 12.9489 14.9317 13.3902 14.8042L14.9404 16.3544C14.0464 16.7688 13.0503 17 12.0002 17C8.47368 17 5.55627 14.3923 5.07105 11H3.05509C3.51623 15.1716 6.82854 18.4839 11.0002 18.9451V23H13.0002V18.9451C14.2341 18.8087 15.3929 18.4228 16.4249 17.839ZM11.5528 12.9669C10.2541 12.7727 9.22745 11.7461 9.03328 10.4473L11.5528 12.9669ZM19.3747 15.1604L17.9323 13.7179C18.4407 12.9084 18.788 11.9874 18.9293 11H20.9452C20.7754 12.5366 20.2187 13.9565 19.3747 15.1604ZM16.4658 12.2514L14.9173 10.703C14.9715 10.4775 15.0002 10.2421 15.0002 10V6C15.0002 4.34315 13.657 3 12.0002 3C10.7059 3 9.6031 3.81956 9.18237 4.96802L7.68575 3.47139C8.55427 1.99268 10.1613 1 12.0002 1C14.7616 1 17.0002 3.23858 17.0002 6V10C17.0002 10.8099 16.8076 11.5748 16.4658 12.2514Z"
					></path></svg
				>
				Stop Recording
			</button>
		{/if}
	</div>

	{#if error}
		<div class="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
			{error}
		</div>
	{/if}

	<div class="flex w-full gap-4 mb-4">
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
			<!-- Analysis Results -->
			<div class="w-full p-6">
				<div class="grid grid-cols-4 gap-6">
					<!-- Topics -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-blue-600">Topics</h3>
						<div class="flex flex-wrap gap-2">
							{#each uniqueItems(topics) as topic}
								<div
									class="px-4 py-2 text-sm text-blue-800 transition-transform bg-blue-100 border border-blue-200 rounded-full cursor-pointer hover:scale-105"
								>
									{topic}
								</div>
							{/each}
						</div>
					</div>

					<!-- Ideas -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-green-600">Ideas</h3>
						<div class="flex flex-wrap gap-2">
							{#each uniqueItems(ideas) as idea}
								<div
									class="px-4 py-2 text-sm text-green-800 transition-transform bg-green-100 border border-green-200 rounded-full cursor-pointer hover:scale-105"
								>
									{idea}
								</div>
							{/each}
						</div>
					</div>

					<!-- Themes -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-purple-600">Themes</h3>
						<div class="flex flex-wrap gap-2">
							{#each uniqueItems(themes) as theme}
								<div
									class="px-4 py-2 text-sm text-purple-800 transition-transform bg-purple-100 border border-purple-200 rounded-full cursor-pointer hover:scale-105"
								>
									{theme}
								</div>
							{/each}
						</div>
					</div>

					<!-- Wikipedia -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-purple-600">Wikipedia</h3>
						<div class="flex flex-wrap gap-2">
							{#each uniqueItems(wikipedia) as wiki}
								<div
									class="px-4 py-2 text-sm text-purple-800 transition-transform bg-purple-100 border border-purple-200 rounded-full cursor-pointer hover:scale-105"
								>
									{wiki}
								</div>
							{/each}
						</div>
					</div>

					<!-- Emotions -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-red-600">Emotions</h3>
						<div class="flex flex-wrap gap-2">
							{#each uniqueItems(emotions) as emotion}
								<div
									class="px-4 py-2 text-sm text-red-800 transition-transform bg-red-100 border border-red-200 rounded-full cursor-pointer hover:scale-105"
								>
									{emotion}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

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

	topicsStore.subscribe((value) => (topics = value));
	ideasStore.subscribe((value) => (ideas = value));
	themesStore.subscribe((value) => (themes = value));
	emotionsStore.subscribe((value) => (emotions = value));
</script>

<div class="p-4 mx-auto">
	<h1 class="mb-4 text-2xl font-bold">Dual Audio Recorder with Overlap</h1>

	<div class="flex flex-col w-full mb-6">
		{#if !isRecording}
			<button
				on:click={startRecording}
				class="px-4 py-2 mr-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Start Recording
			</button>
		{:else}
			<button
				on:click={stopRecording}
				class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
		<AudioRecorder
			id="1"
			duration={RECORD_DURATION}
			bind:stream
			isActive={recorder1Active}
			on:transcriptionComplete={handleTranscriptionComplete}
		/>
		<AudioRecorder
			id="2"
			duration={RECORD_DURATION}
			bind:stream
			isActive={recorder2Active}
			on:transcriptionComplete={handleTranscriptionComplete}
		/>
	</div>

	{#if transcriptions.length > 0}
		<div class="mt-6 space-y-8">
			<!-- Original Transcriptions -->
			<!-- <div>
				<h2 class="mb-4 text-xl font-semibold">Transcriptions:</h2>
				<div class="space-y-4">
					{#each transcriptions as { text, timestamp }}
						<div class="p-4 bg-gray-100 rounded-lg">
							<div class="mb-2 text-sm font-semibold text-gray-600">
								{new Date(timestamp).toLocaleTimeString()}
							</div>
							<div class="text-gray-800">{text}</div>
						</div>
					{/each}
				</div>
			</div> -->

			<!-- Analysis Results -->
			<div class="flex w-full gap-6">
				<!-- Topics Section -->
				<div class="p-6 rounded-lg bg-blue-50">
					<h3 class="mb-4 text-lg font-semibold text-blue-600">All Topics</h3>
					<div class="space-y-2">
						{#each topics as { items, timestamp }}
							{#if items.length > 0}
								<div class="p-4 bg-white rounded-md">
									<div class="mb-2 text-sm text-gray-600">
										{new Date(timestamp).toLocaleTimeString()}
									</div>
									<ul class="pl-4 list-disc">
										{#each items as topic}
											<li>{topic}</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Ideas Section -->
				<div class="p-6 rounded-lg bg-green-50">
					<h3 class="mb-4 text-lg font-semibold text-green-600">All Ideas</h3>
					<div class="space-y-2">
						{#each ideas as { items, timestamp }}
							{#if items.length > 0}
								<div class="p-4 bg-white rounded-md">
									<div class="mb-2 text-sm text-gray-600">
										{new Date(timestamp).toLocaleTimeString()}
									</div>
									<ul class="pl-4 list-disc">
										{#each items as idea}
											<li>{idea}</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Themes Section -->
				<div class="p-6 rounded-lg bg-purple-50">
					<h3 class="mb-4 text-lg font-semibold text-purple-600">All Themes</h3>
					<div class="space-y-2">
						{#each themes as { items, timestamp }}
							{#if items.length > 0}
								<div class="p-4 bg-white rounded-md">
									<div class="mb-2 text-sm text-gray-600">
										{new Date(timestamp).toLocaleTimeString()}
									</div>
									<ul class="pl-4 list-disc">
										{#each items as theme}
											<li>{theme}</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Emotions Section -->
				<div class="p-6 rounded-lg bg-red-50">
					<h3 class="mb-4 text-lg font-semibold text-red-600">All Emotions</h3>
					<div class="space-y-2">
						{#each emotions as { items, timestamp }}
							{#if items.length > 0}
								<div class="p-4 bg-white rounded-md">
									<div class="mb-2 text-sm text-gray-600">
										{new Date(timestamp).toLocaleTimeString()}
									</div>
									<ul class="pl-4 list-disc">
										{#each items as emotion}
											<li>{emotion}</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

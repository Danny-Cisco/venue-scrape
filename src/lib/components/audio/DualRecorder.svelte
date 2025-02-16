<!-- DualRecorder.svelte -->
<script>
	import AudioRecorder from './AudioRecorder.svelte';

	export let recordChunk = 10;
	export let recordOverlap = 2;
	let stream = null;
	let isRecording = false;
	let recorder1Active = false;
	let recorder2Active = false;
	let transcriptions = [];
	let analysisResults = []; // Store analysis results
	let error = '';
	let RECORD_DURATION = recordChunk * 1000; // milliseconds
	let OVERLAP_DURATION = recordOverlap * 1000; // milliseconds
	const SWITCH_INTERVAL = RECORD_DURATION - OVERLAP_DURATION; // 8 seconds

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
			return JSON.parse(data.reply.content); // Parse the JSON string from the content
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

			// Get analysis for the new transcription
			const analysis = await analyzeTranscription(transcription);
			if (analysis) {
				analysisResults = [
					...analysisResults,
					{
						...analysis,
						timestamp,
						transcription
					}
				];
			}
		} else {
			console.log(`Skipping duplicate transcription from recorder ${recorderId}`);
		}
	}
</script>

<div class="container max-w-4xl p-4 mx-auto">
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
		<div class="mt-6">
			<h2 class="mb-2 text-xl font-semibold">Transcriptions and Analysis:</h2>
			<div class="space-y-6">
				{#each analysisResults as { topics, ideas, themes, emotions, timestamp, transcription }}
					<div class="p-6 bg-gray-100 rounded-lg">
						<div class="mb-2 text-sm font-semibold text-gray-600">
							{new Date(timestamp).toLocaleTimeString()}
						</div>
						<div class="mb-4 text-gray-800">{transcription}</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="p-4 bg-white rounded-md">
								<h3 class="mb-2 font-semibold text-blue-600">Topics</h3>
								<ul class="pl-4 list-disc">
									{#each topics as topic}
										<li>{topic}</li>
									{/each}
								</ul>
							</div>

							<div class="p-4 bg-white rounded-md">
								<h3 class="mb-2 font-semibold text-green-600">Ideas</h3>
								<ul class="pl-4 list-disc">
									{#each ideas as idea}
										<li>{idea}</li>
									{/each}
								</ul>
							</div>

							<div class="p-4 bg-white rounded-md">
								<h3 class="mb-2 font-semibold text-purple-600">Themes</h3>
								<ul class="pl-4 list-disc">
									{#each themes as theme}
										<li>{theme}</li>
									{/each}
								</ul>
							</div>

							<div class="p-4 bg-white rounded-md">
								<h3 class="mb-2 font-semibold text-red-600">Emotions</h3>
								<ul class="pl-4 list-disc">
									{#each emotions as emotion}
										<li>{emotion}</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

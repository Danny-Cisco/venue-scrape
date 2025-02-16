<!-- DualRecorder.svelte -->
<script>
	import AudioRecorder from './AudioRecorder.svelte';

	let stream = null;
	let isRecording = false;
	let recorder1Active = false;
	let recorder2Active = false;
	let transcriptions = [];
	let error = '';

	async function startRecording() {
		try {
			// Get microphone access once and share it
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			isRecording = true;
			startRecordingCycle();
		} catch (err) {
			error = 'Error accessing microphone: ' + err.message;
			console.error('Microphone access error:', err);
		}
	}

	function startRecordingCycle() {
		const RECORD_DURATION = 10000; // 10 seconds
		const OVERLAP_DURATION = 2000; // 2 seconds
		const SWITCH_INTERVAL = RECORD_DURATION - OVERLAP_DURATION; // 8 seconds

		// Start first recorder
		recorder1Active = true;

		// Schedule the alternating recordings
		function scheduleNextSwitch() {
			if (!isRecording) return;

			setTimeout(() => {
				if (!isRecording) return;

				// Start the next recorder
				if (recorder1Active) {
					recorder2Active = true;
					// Stop recorder1 after overlap
					setTimeout(() => (recorder1Active = false), OVERLAP_DURATION);
				} else {
					recorder1Active = true;
					// Stop recorder2 after overlap
					setTimeout(() => (recorder2Active = false), OVERLAP_DURATION);
				}

				// Schedule the next switch
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

	function handleTranscriptionComplete(event) {
		const { transcription, recorderId } = event.detail;
		console.log(`Received transcription from recorder ${recorderId}`);

		// Add transcription only if it's not a duplicate
		const timestamp = new Date().toISOString();
		const newTranscription = {
			recorder: recorderId,
			text: transcription,
			timestamp: timestamp
		};

		// Check if this exact transcription is already in the array
		const isDuplicate = transcriptions.some(
			(t) =>
				t.recorder === recorderId &&
				t.text === transcription &&
				// Check if timestamps are within 1 second of each other
				Math.abs(new Date(t.timestamp) - new Date(timestamp)) < 1000
		);

		if (!isDuplicate) {
			console.log(`Adding new transcription from recorder ${recorderId}`);
			transcriptions = [...transcriptions, newTranscription];
		} else {
			console.log(`Skipping duplicate transcription from recorder ${recorderId}`);
		}
	}
</script>

<div class="container max-w-4xl p-4 mx-auto">
	<h1 class="mb-4 text-2xl font-bold">Dual Audio Recorder with Overlap</h1>

	<div class="mb-6">
		<button
			on:click={startRecording}
			disabled={isRecording}
			class="px-4 py-2 mr-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Start Recording
		</button>

		<button
			on:click={stopRecording}
			disabled={!isRecording}
			class="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Stop Recording
		</button>
	</div>

	{#if error}
		<div class="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
			{error}
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-4 mb-4">
		<AudioRecorder
			id="1"
			bind:stream
			isActive={recorder1Active}
			on:transcriptionComplete={handleTranscriptionComplete}
		/>
		<AudioRecorder
			id="2"
			bind:stream
			isActive={recorder2Active}
			on:transcriptionComplete={handleTranscriptionComplete}
		/>
	</div>

	{#if transcriptions.length > 0}
		<div class="mt-6">
			<h2 class="mb-2 text-xl font-semibold">Transcriptions:</h2>
			<div class="space-y-4">
				{#each transcriptions as { recorder, text, timestamp }}
					<div class="p-4 bg-gray-100 rounded">
						<div class="mb-1 text-sm font-semibold text-gray-600">
							Recorder {recorder} - {new Date(timestamp).toLocaleTimeString()}
						</div>
						<div>{text}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

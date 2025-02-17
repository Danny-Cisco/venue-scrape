<!-- AudioRecorder.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Props
	export let id = '1'; // Identifier for this recorder instance
	export let stream = null; // Shared audio stream passed from parent
	export let isActive = false; // Whether this recorder should be recording
	export let transcription = '';
	export let duration = '10000';

	let durationSeconds = duration / 1000;

	// Local state
	let mediaRecorder;
	let audioChunks = [];
	let isRecording = false;
	let error = '';
	let countdown = durationSeconds;
	let countdownInterval;

	$: if (isActive && stream && !isRecording) {
		startRecording();
	} else if (!isActive && isRecording) {
		stopRecording();
	}

	async function startRecording() {
		try {
			error = '';
			audioChunks = [];

			// Use the provided stream
			if (!stream) {
				throw new Error('No audio stream provided');
			}

			mediaRecorder = new MediaRecorder(stream);

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
				// console.log(`Recorder ${id}: Got data chunk of size ${event.data.size}`);
			};

			mediaRecorder.onstop = async () => {
				// console.log(`Recorder ${id}: Stopped recording, processing chunks...`);
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				await sendForTranscription(audioBlob);
			};

			// console.log(`Recorder ${id}: Starting recording`);
			mediaRecorder.start();
			isRecording = true;
			countdown = durationSeconds;

			countdownInterval = setInterval(() => {
				countdown--;
			}, 1000);
		} catch (err) {
			error = 'Error starting recorder: ' + err.message;
			// console.error(`Recorder ${id} error:`, err);
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			// console.log(`Recorder ${id}: Stopping recording`);
			mediaRecorder.stop();
			isRecording = false;
			clearInterval(countdownInterval);
			dispatch('recordingComplete');
		}
	}

	async function sendForTranscription(audioBlob) {
		try {
			// console.log(`Recorder ${id}: Starting transcription...`);

			const buffer = await audioBlob.arrayBuffer();
			const base64Audio = btoa(
				new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
			);

			const response = await fetch('/api/openai/whisper', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					audio: base64Audio
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			transcription = data.transcription;

			// Only dispatch if we have actual transcription text
			if (data.transcription?.trim()) {
				// console.log(
				// 	`Recorder ${id}: Dispatching transcription:`,
				// 	data.transcription.slice(0, 50) + '...'
				// );
				dispatch('transcriptionComplete', {
					transcription: data.transcription,
					recorderId: id
				});
			}
		} catch (err) {
			error = 'Error during transcription: ' + err.message;
			// console.error(`Recorder ${id} transcription error:`, err);
		}
	}
</script>

<div class="p-4 border rounded-lg bg-gray-50">
	<h3 class="mb-2 font-semibold">Recorder {id}</h3>

	<div class="space-y-2">
		<div class="flex items-center space-x-2">
			<div
				class="w-3 h-3 rounded-full {isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}"
			></div>
			<span>{isRecording ? 'Recording' : 'Idle'}</span>
		</div>

		{#if isRecording}
			<div class="text-red-500">Time remaining: {countdown}s</div>
			<div class="h-2 bg-blue-200 rounded-full">
				<div
					class="h-full transition-all duration-1000 bg-blue-500 rounded-full"
					style="width: {((durationSeconds - countdown) / durationSeconds) * 100}%"
				/>
			</div>
		{/if}

		{#if error}
			<div class="p-2 text-sm text-red-700 bg-red-100 rounded">
				{error}
			</div>
		{/if}
	</div>
</div>

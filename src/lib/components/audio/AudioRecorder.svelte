<!-- AudioRecorder.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Props
	export let id = '1';
	export let stream = null;
	export let isActive = false;
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
	let recordingStartTime;

	$: if (isActive && stream && !isRecording) {
		startRecording();
	} else if (!isActive && isRecording) {
		stopRecording();
	}

	async function checkAudioLevel(audioBlob) {
		try {
			const audioContext = new AudioContext();
			const arrayBuffer = await audioBlob.arrayBuffer();
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

			// Get the raw audio data
			const channelData = audioBuffer.getChannelData(0); // Get first channel

			// Calculate RMS (Root Mean Square) value
			const sum = channelData.reduce((acc, val) => acc + val * val, 0);
			const rms = Math.sqrt(sum / channelData.length);

			// Convert to dB
			const db = 20 * Math.log10(rms);

			audioContext.close();
			return db;
		} catch (err) {
			console.error('Error analyzing audio level:', err);
			return -Infinity;
		}
	}

	async function startRecording() {
		try {
			error = '';
			audioChunks = [];

			if (!stream) {
				throw new Error('No audio stream provided');
			}

			mediaRecorder = new MediaRecorder(stream);

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

				// Check audio level
				const dbLevel = await checkAudioLevel(audioBlob);
				const SILENCE_THRESHOLD_DB = -50; // Adjust this threshold as needed

				if (dbLevel < SILENCE_THRESHOLD_DB) {
					console.log(
						`Recorder ${id}: Audio level too low (${dbLevel.toFixed(2)} dB), transcription aborted`
					);
					dispatch('recordingComplete');
					return;
				}

				await sendForTranscription(audioBlob);
			};

			recordingStartTime = Date.now();
			mediaRecorder.start();
			isRecording = true;
			countdown = durationSeconds;

			countdownInterval = setInterval(() => {
				countdown--;
			}, 1000);
		} catch (err) {
			error = 'Error starting recorder: ' + err.message;
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
			clearInterval(countdownInterval);
		}
	}

	async function sendForTranscription(audioBlob) {
		try {
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

			if (data.transcription?.trim()) {
				dispatch('transcriptionComplete', {
					transcription: data.transcription,
					recorderId: id
				});
			}
		} catch (err) {
			error = 'Error during transcription: ' + err.message;
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

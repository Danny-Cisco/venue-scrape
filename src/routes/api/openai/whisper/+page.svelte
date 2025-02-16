<script>
	let mediaRecorder;
	let audioChunks = [];
	let isRecording = false;
	let transcription = '';
	let error = '';
	let countdown = 10;
	let countdownInterval;

	async function startRecording() {
		try {
			error = '';
			transcription = '';
			audioChunks = [];

			// Get microphone access
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);

			// Set up event handlers
			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				await sendForTranscription(audioBlob);

				// Stop all tracks to release microphone
				stream.getTracks().forEach((track) => track.stop());
			};

			// Start recording
			mediaRecorder.start();
			isRecording = true;
			countdown = 10;

			// Set up countdown
			countdownInterval = setInterval(() => {
				countdown--;
				if (countdown === 0) {
					stopRecording();
				}
			}, 1000);

			// Automatically stop after 10 seconds
			setTimeout(() => {
				if (isRecording) {
					stopRecording();
				}
			}, 10000);
		} catch (err) {
			error = 'Error accessing microphone: ' + err.message;
			console.error('Error:', err);
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
			// Convert blob to base64
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
		} catch (err) {
			error = 'Error during transcription: ' + err.message;
			console.error('Error:', err);
		}
	}
</script>

<div class="container max-w-2xl p-4 mx-auto">
	<h1 class="mb-4 text-2xl font-bold">Audio Recorder & Transcriber</h1>

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

	{#if isRecording}
		<div class="mb-4">
			<div class="text-lg font-semibold">Recording in progress...</div>
			<div class="text-red-500">Time remaining: {countdown} seconds</div>
		</div>
	{/if}

	{#if error}
		<div class="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
			{error}
		</div>
	{/if}

	{#if transcription}
		<div class="mt-6">
			<h2 class="mb-2 text-xl font-semibold">Transcription:</h2>
			<div class="p-4 bg-gray-100 rounded">
				{transcription}
			</div>
		</div>
	{/if}
</div>

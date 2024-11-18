<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let videoElement;
	let selectedDeviceId = '';
	let devices = writable([]);

	// Function to enumerate video input devices
	async function getVideoDevices() {
		try {
			const allDevices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');
			devices.set(videoDevices);
		} catch (error) {
			console.error('Error enumerating devices:', error);
		}
	}

	// Function to start video stream with selected device and resolution
	async function startStream() {
		if (!selectedDeviceId) return;

		// Stop any existing video stream
		if (videoElement.srcObject) {
			videoElement.srcObject.getTracks().forEach((track) => track.stop());
		}

		try {
			const constraints = {
				video: {
					deviceId: { exact: selectedDeviceId },
					width: { ideal: 1280 }, // Set desired width
					height: { ideal: 720 } // Set desired height
				}
			};
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			videoElement.srcObject = stream;
		} catch (error) {
			console.error('Error accessing webcam:', error);
		}
	}

	// Update selected device and start stream
	function handleDeviceChange(event) {
		selectedDeviceId = event.target.value;
		startStream();
	}

	onMount(() => {
		getVideoDevices();
	});
</script>

<main class="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gray-100">
	<h1 class="mb-6 text-2xl font-bold">Select Camera and View Live Feed</h1>
	<div class="w-full max-w-md mb-6">
		<label for="camera-select" class="block mb-2 text-sm font-medium text-gray-700">
			Choose Camera:
		</label>
		<select
			id="camera-select"
			class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
			on:change={handleDeviceChange}
		>
			<option value="" disabled selected>Select a camera</option>
			{#each $devices as device}
				<option value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
			{/each}
		</select>
	</div>
	<video
		bind:this={videoElement}
		autoplay
		playsinline
		class="w-full max-w-3xl border-4 border-indigo-600 rounded-lg shadow-lg"
	>
	</video>
</main>

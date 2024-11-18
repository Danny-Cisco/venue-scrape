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

	// Function to start video stream with the selected device and preferred resolution
	async function startStream() {
		if (!selectedDeviceId) return;

		// Stop any existing video stream
		if (videoElement.srcObject) {
			videoElement.srcObject.getTracks().forEach((track) => track.stop());
		}

		// Constraints for 1280x720 resolution, or fallback to available resolution
		const constraints = {
			video: {
				deviceId: { exact: selectedDeviceId },
				width: { ideal: 1280 }, // Request 1280px width if available
				height: { ideal: 720 } // Request 720px height if available
			}
		};

		try {
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			videoElement.srcObject = stream;

			// Log the actual resolution used
			const settings = stream.getVideoTracks()[0].getSettings();
			console.log('Actual Resolution:', settings.width, 'x', settings.height);
		} catch (error) {
			console.error('Error accessing webcam:', error);
		}
	}

	// Handle device change
	function handleDeviceChange(event) {
		selectedDeviceId = event.target.value;
		startStream();
	}

	onMount(() => {
		getVideoDevices();
	});
</script>

<main class="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gray-100">
	<h1 class="mb-6 text-2xl font-bold">Select Camera</h1>

	<!-- Camera Selector -->
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

	<!-- Video Feed -->
	<video
		bind:this={videoElement}
		autoplay
		playsinline
		class="w-full max-w-3xl border-4 border-indigo-600 rounded-lg shadow-lg"
	>
	</video>
</main>

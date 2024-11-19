<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let videoElement;
	let selectedDeviceId = '';
	let devices = writable([]);
	let capturedImage = ''; // Base64 string to hold the captured image
	let permissionStatus = writable('pending'); // Track permission status

	// Function to request camera permissions
	async function requestCameraPermission() {
		try {
			// First check if permissions are already granted
			const result = await navigator.permissions.query({ name: 'camera' });

			if (result.state === 'granted') {
				permissionStatus.set('granted');
				await getVideoDevices();
			} else if (result.state === 'prompt') {
				// If permission hasn't been granted yet, request it
				try {
					// Request access to just video to get initial permission
					await navigator.mediaDevices.getUserMedia({ video: true });
					permissionStatus.set('granted');
					await getVideoDevices();
				} catch (error) {
					console.error('Permission denied or error occurred:', error);
					permissionStatus.set('denied');
				}
			} else {
				// Permission was denied previously
				permissionStatus.set('denied');
				console.error('Camera permission denied');
			}

			// Listen for permission changes
			result.addEventListener('change', (e) => {
				permissionStatus.set(e.target.state);
				if (e.target.state === 'granted') {
					getVideoDevices();
				}
			});
		} catch (error) {
			console.error('Error checking camera permissions:', error);
			permissionStatus.set('error');
		}
	}

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

	// Function to handle device change
	function handleDeviceChange(event) {
		selectedDeviceId = event.target.value;
		startStream();
	}

	// Function to capture a still picture from the video feed
	function captureImage() {
		// Create a canvas to draw the video frame
		const canvas = document.createElement('canvas');
		canvas.width = videoElement.videoWidth;
		canvas.height = videoElement.videoHeight;

		// Draw the current frame of the video onto the canvas
		const context = canvas.getContext('2d');
		context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

		// Convert the canvas to a Base64 image
		capturedImage = canvas.toDataURL('image/png');
	}

	// Add event listener for the hotkey Alt + Shift + Y
	function handleHotkey(event) {
		// Check if the full hotkey combination is detected
		if (event.altKey && event.shiftKey && event.code === 'KeyY') {
			console.log('Hotkey Alt + Shift + Y detected!');
			captureImage(); // Trigger the image capture
		}
	}

	// Add and remove event listener on component lifecycle
	onMount(() => {
		requestCameraPermission(); // Request camera permissions on mount
		window.addEventListener('keydown', handleHotkey);

		return () => {
			// Clean up event listener and stop any active streams when component unmounts
			window.removeEventListener('keydown', handleHotkey);
			if (videoElement?.srcObject) {
				videoElement.srcObject.getTracks().forEach((track) => track.stop());
			}
		};
	});
</script>

<main class="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gray-100">
	<h1 class="mb-6 text-2xl font-bold">Select Camera</h1>

	{#if $permissionStatus === 'denied'}
		<div class="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
			Copy this link to a new tab to enable camera: chrome://settings/content/camera
		</div>
	{:else if $permissionStatus === 'error'}
		<div class="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
			An error occurred while accessing the camera. Please try again.
		</div>
	{/if}

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
		class="w-full max-w-[250px] h-[144px] absolute top-[70px] right-[30px] border-4 border-indigo-600 rounded-lg shadow-lg"
	></video>

	<!-- Capture Button -->
	<button
		on:click={captureImage}
		class="px-4 py-2 mt-4 text-white bg-indigo-600 rounded-md shadow hover:bg-indigo-700"
	>
		Capture Image
	</button>

	<!-- Display Captured Image -->
	{#if capturedImage}
		<div class="mt-6">
			<h2 class="mb-4 text-lg font-bold">Captured Image:</h2>
			<img
				src={capturedImage}
				alt="Captured Frame"
				class="max-w-full border rounded-lg shadow-md"
			/>
		</div>
	{/if}
</main>

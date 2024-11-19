<script>
	import { createEventDispatcher } from 'svelte';
	export let videoElement;
	export let triggerStartStream = false;
	export let selectedDeviceId = '';
	export let capturedImage;

	let dispatch = createEventDispatcher();

	function dispatchOpen() {
		dispatch('openModal');
	}

	function dispatchCaptureImage() {
		dispatch('captureImage');
	}

	$: if (triggerStartStream) {
		startStream();
		triggerStartStream = false;
	}

	// Function to start video stream with the selected device and preferred resolution
	async function startStream() {
		triggerStartStream = false;
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
</script>

<div
	class="w-full max-w-[250px] h-[144px] absolute top-[70px] right-[30px] border-4 border-indigo-600 rounded-lg shadow-lg"
>
	<div class="h-[144px]">
		<video on:click={dispatchOpen} bind:this={videoElement} autoplay playsinline></video>
	</div>
	<!-- Capture Button -->
	<button
		on:click={dispatchCaptureImage}
		class="w-full px-4 py-2 text-white bg-indigo-600 rounded-full shadow hover:bg-indigo-700"
	>
		Capture Image
	</button>
</div>

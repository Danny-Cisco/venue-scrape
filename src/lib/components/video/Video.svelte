<script>
	export let videoElement;
	export let triggerStartStream = false;
	export let selectedDeviceId = '';

	$: if (triggerStartStream) {
		startStream();
		triggerStartStream = false;
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
</script>

<video
	bind:this={videoElement}
	autoplay
	playsinline
	class="w-full max-w-[250px] h-[144px] absolute top-[70px] right-[30px] border-4 border-indigo-600 rounded-lg shadow-lg"
></video>

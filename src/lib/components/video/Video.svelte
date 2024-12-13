<script>
	import { createEventDispatcher } from 'svelte';
	export let videoElement;
	import { triggerStartStream, triggerStopStream } from '$lib/stores/video';

	export let selectedDeviceId = '';
	import { selectedDevice } from '$lib/stores/camera';

	let dispatch = createEventDispatcher();
	let hover = false;

	// Track if the stream is active
	let isStreamActive = false;

	selectedDeviceId = $selectedDevice;

	function showTips() {
		hover = true;
	}

	function dispatchOpen() {
		dispatch('openModal');
	}

	function dispatchCaptureImage() {
		dispatch('captureImage');
	}

	// Explicitly handle starting the video stream
	async function startStream() {
		if (isStreamActive) {
			console.log('Stream already active.');
			return;
		}

		if (!selectedDeviceId || !videoElement) {
			console.error('No selected device or video element.');
			return;
		}

		// Stop any existing video stream to ensure only one is active
		stopStream();

		const constraints = {
			video: {
				deviceId: { exact: selectedDeviceId },
				width: { ideal: 1280 },
				height: { ideal: 720 }
			}
		};

		try {
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			videoElement.srcObject = stream;
			isStreamActive = true;

			// Log actual resolution
			const settings = stream.getVideoTracks()[0].getSettings();
			console.log('Actual Resolution:', settings.width, 'x', settings.height);
		} catch (error) {
			console.error('Error accessing webcam:', error);
		}
	}

	// Explicitly handle stopping the video stream
	function stopStream() {
		if (!isStreamActive || !videoElement?.srcObject) {
			console.log('No active stream to stop.');
			return;
		}

		videoElement.srcObject.getTracks().forEach((track) => track.stop());
		videoElement.srcObject = null;
		isStreamActive = false;
	}

	// Handle trigger reactivity
	$: if ($triggerStartStream && videoElement) {
		triggerStartStream.set(false); // Reset the trigger
		startStream();
	}

	$: if ($triggerStopStream) {
		triggerStopStream.set(false); // Reset the trigger
		stopStream();
	}
</script>

<div class="w-full max-w-[250px] h-[144px] bg-gray-100 border-2 border-[magenta] rounded-lg shadow">
	<div class="h-[144px] relative" on:click={dispatchOpen} on:hover={showTips}>
		<video bind:this={videoElement} autoplay playsinline></video>
		{#if !selectedDeviceId || hover}
			<div class="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
				click to select camera
			</div>
		{/if}
	</div>
</div>

<!-- Capture Button -->
<button
	on:click={dispatchCaptureImage}
	class="flex w-full gap-1 items-center my-4 px-4 py-2 text-[magenta] bg-white rounded-full shadow btn hover:relative hover:top-[-1px] hover:shadow-md"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 424 500"
		width="18pt"
		height="18pt"
		fill="none"
		stroke="magenta"
		stroke-width="2"
		><circle cx="17" cy="407" r="15" /><circle cx="32" cy="392" r="30" /><circle
			cx="47"
			cy="377"
			r="45"
		/><circle cx="62" cy="362" r="60" /><circle cx="77" cy="347" r="75" /><circle
			cx="92"
			cy="332"
			r="90"
		/><circle cx="107" cy="317" r="105" /><circle cx="122" cy="302" r="120" /><circle
			cx="137"
			cy="287"
			r="135"
		/><circle cx="152" cy="272" r="150" /><circle cx="167" cy="257" r="165" /><circle
			cx="182"
			cy="242"
			r="180"
		/></svg
	>
	Action
</button>

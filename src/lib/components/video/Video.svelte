<script>
	import { createEventDispatcher } from 'svelte';
	export let videoElement;
	export let triggerStartStream = false;
	export let selectedDeviceId = '';

	let dispatch = createEventDispatcher();
	let hover = false;

	function showTips() {
		hover = true;
	}

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
	class="w-full max-w-[250px] h-[144px] bg-gray-400 absolute top-[70px] right-[30px] border-4 border-indigo-600 rounded-lg shadow-lg"
>
	<div class="h-[144px] relative" on:click={dispatchOpen} on:hover={showTips}>
		<video bind:this={videoElement} autoplay playsinline></video>
		{#if !selectedDeviceId || hover}
			<div class="absolute inset-0 flex flex-col items-center justify-center text-gray-200">
				click to select camera
			</div>
		{/if}
	</div>

	<!-- Capture Button -->
	<button
		on:click={dispatchCaptureImage}
		class="flex w-full gap-2 px-4 py-2 text-white bg-indigo-600 rounded-full shadow btn hover:bg-indigo-700"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
			/>
		</svg>
		Action
	</button>
</div>

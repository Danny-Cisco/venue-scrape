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
	class="w-full max-w-[250px] h-[144px] bg-gray-100 absolute top-[70px] right-[30px] border-2 border-[magenta] rounded-lg shadow-lg"
>
	<div class="h-[144px] relative" on:click={dispatchOpen} on:hover={showTips}>
		<video bind:this={videoElement} autoplay playsinline></video>
		{#if !selectedDeviceId || hover}
			<div class="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
				click to select camera
			</div>
		{/if}
	</div>

	<!-- Capture Button -->
	<button
		on:click={dispatchCaptureImage}
		class="flex w-full gap-1 items-center px-4 py-2 text-[magenta] bg-white rounded-full shadow btn hover:bg-gray-200"
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
</div>

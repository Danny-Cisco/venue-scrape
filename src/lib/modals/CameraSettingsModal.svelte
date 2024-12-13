<script>
	import { devices, selectedDevice, permissionStatus } from '$lib/stores/camera';
	import { showCameraSettingsModal } from '$lib/stores/ui';
	import { triggerStartStream, triggerStopStream } from '$lib/stores/video';

	function startStream() {
		triggerStartStream.set(true);
	}
	function stopStream() {
		triggerStopStream.set(true);
	}

	let modalBox;

	// Function to handle device change
	function handleDeviceChange(event) {
		const selectedValue = event.target.value;

		if (selectedValue === 'no-camera') {
			clearDevice();
		} else {
			if (selectedValue === $selectedDevice) {
				handleCloseModal();
				return;
			}

			$selectedDevice = null; // first clear the device selection
			// then wait a moment before switching devices
			setTimeout(
				() => {
					$selectedDevice = selectedValue;
				},

				100
			);
			startStream();
		}

		handleCloseModal();
	}

	// Clear the selection
	function clearDevice() {
		$selectedDevice = null;
		stopStream();
	}

	function handleCloseModal() {
		showCameraSettingsModal.set(false);
	}

	function handleClickOutside(event) {
		if (!modalBox.contains(event.target)) {
			handleCloseModal();
		}
	}
</script>

<!-- Camera Selector -->
{#if $showCameraSettingsModal}
	<div
		on:click={handleClickOutside}
		class="absolute inset-0 flex flex-col items-center justify-center text-gray-700 h-full mx-auto z-[99] bg-black/50"
	>
		<div bind:this={modalBox} class="w-full max-w-md p-4 pb-6 bg-white rounded-xl">
			<h2 class="mb-2 text-center">Camera Settings</h2>
			<select
				id="camera-select"
				class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
				on:change={handleDeviceChange}
			>
				<option value="" disabled selected>Select a camera</option>
				<option value="no-camera">No Camera</option>
				{#each $devices as device}
					<option value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
				{/each}
			</select>
		</div>
	</div>
{/if}

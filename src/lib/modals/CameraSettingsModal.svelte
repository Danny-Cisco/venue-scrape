<script>
	import { devices, selectedDevice, permissionStatus } from '$lib/stores/camera';
	import { showCameraSettingsModal } from '$lib/stores/ui';
	import { triggerStartStream, triggerStopStream } from '$lib/stores/video';
	import { fade } from 'svelte/transition';

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
			$selectedDevice = selectedValue;
			dispatch('startStream');
		}

		handleCloseModal();
	}

	// Clear the selection
	function clearDevice() {
		$selectedDevice = null;
		dispatch('stopStream');
	}

	function handleCloseModal() {
		showCameraSettingsModal = false;
	}

	function handleClickOutside(event) {
		if (!modalBox.contains(event.target)) {
			handleCloseModal();
		}
	}
</script>

<!-- Camera Selector -->
{#if showCameraSettingsModal}
	<div
		on:click={handleClickOutside}
		transition:fade
		class="absolute inset-0 flex flex-col items-center justify-center text-gray-700 h-full mx-auto z-[99] bg-gray-600/80"
	>
		<div
			bind:this={modalBox}
			class="w-full max-w-md p-4 pb-6 relative shadow-md bg-white z-[20] rounded-xl"
		>
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

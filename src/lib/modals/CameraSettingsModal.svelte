<script>
	export let devices;
	export let selectedDeviceId;
	// export let triggerStartStream;
	export let showCameraSettingsModal = false;

	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();

	let modalBox;

	// Function to handle device change
	function handleDeviceChange(event) {
		selectedDeviceId = event.target.value;
		// triggerStartStream = true;
		dispatch('startStream');
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
		class="absolute inset-0 flex flex-col items-center justify-center h-full mx-auto bg-black/50"
	>
		<div bind:this={modalBox} class="w-full max-w-md p-4 mb-6 bg-white rounded-xl">
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
	</div>
{/if}

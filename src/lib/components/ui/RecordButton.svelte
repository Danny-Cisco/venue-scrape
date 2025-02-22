<script>
	import Button from '$lib/components/ui/Button.svelte';

	import { isRecording, start, stop } from '$lib/stores/isRecordingStore.js';

	let buttonText = 'Listen';

	$: $isRecording;

	$: if ($isRecording) {
		buttonText = 'Stop';
	} else buttonText = 'Listen';
</script>

<div
	class="flex relative whitespace-nowrap hover:shadow hover:top-[-2px] hover:cursor-pointer justify-center items-center w-[180px] mx-auto h-[74px] rounded-3xl bg-white mx-auto mb-6"
	on:click={() => {
		if ($isRecording) {
			$isRecording = false;
			$start = false;
			$stop = true;
		} else {
			$isRecording = true;
			$start = true;
			$stop = false;
		}
	}}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="absolute left-4 size-6"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
		/>
	</svg>
	{buttonText}
</div>

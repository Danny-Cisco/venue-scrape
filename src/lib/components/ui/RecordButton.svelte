<script>
	import Button from '$lib/components/ui/Button.svelte';

	import { isRecording, start, stop } from '$lib/stores/isRecordingStore.js';

	let buttonText = 'Listen';

	$: $isRecording;

	$: if ($isRecording) {
		buttonText = 'Stop';
	} else buttonText = 'Listen';
</script>

<div class="flex flex-col w-[150px] mx-auto mb-6">
	<Button
		text={buttonText}
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
	/>
</div>

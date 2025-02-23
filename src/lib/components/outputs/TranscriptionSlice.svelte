<script>
	import { fly } from 'svelte/transition';
	import SimilarityBarVertical from '../ui/SimilarityBarVertical.svelte';
	import TranscriptionContainerLarge from './TranscriptionContainerLarge.svelte';
	import { tick, onMount, onDestroy } from 'svelte';

	let showTranscription = false;
	let transcriptionContainer;

	export let result;
	export let closeAll = false;

	// Handle closeAll changes
	$: if (closeAll) {
		handleCloseAll();
	}

	async function handleCloseAll() {
		showTranscription = false;
		await tick();
	}

	async function handleOpen() {
		closeAll = true;
		await tick();
		closeAll = false;
		showTranscription = true;
	}

	function handleClose() {
		showTranscription = false;
	}

	// Handle clicks outside the component
	function handleClickOutside(event) {
		if (
			showTranscription &&
			transcriptionContainer &&
			!transcriptionContainer.contains(event.target)
		) {
			handleClose();
		}
	}

	// Handle escape key
	function handleKeydown(event) {
		if (event.key === 'Escape' && showTranscription) {
			handleClose();
		}
	}

	// Lifecycle management
	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
		document.removeEventListener('keydown', handleKeydown);
	});
</script>

<div
	class="relative transition-shadow h-20 w-[10px] bg-white border shadow-sm hover:top-[-1px] hover:shadow-md"
	transition:fly={{ y: 20 }}
	on:click|stopPropagation={handleOpen}
>
	<div class="absolute inset-0 top-0 bottom-0 flex text-xs">
		<SimilarityBarVertical similarity={result.similarity} />
	</div>
</div>

{#if showTranscription}
	<div
		class="absolute z-[99] left-4 right-4 -mt-[100px]"
		bind:this={transcriptionContainer}
		on:click|stopPropagation
	>
		<TranscriptionContainerLarge {result} />
		<button
			class="absolute w-8 h-8 bg-white rounded-full -top-4 -right-4 hover:shadow hover:mt-[-2px]"
			on:click|stopPropagation={handleClose}
		>
			<div class="flex flex-col items-center justify-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</div>
		</button>
	</div>
{/if}

<script>
	import { fly } from 'svelte/transition';
	import SimilarityBarVertical from '../ui/SimilarityBarVertical.svelte';
	import TranscriptionContainerLarge from './TranscriptionContainerLarge.svelte';
	let showTrancription = false;

	export let result;
</script>

<div
	class="relative transition-shadow h-20 w-[10px] bg-white border shadow-sm hover:top-[-1px] hover:shadow-md"
	transition:fly={{ y: 20 }}
	on:click={() => (showTrancription = true)}
>
	<!-- <div class="flex items-end justify-between w-full">
		<span class="flex items-center justify-center w-4 h-20 text-sm text-black/40">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
			{result.timestamp}
		</span>
	</div> -->
	<div class="absolute inset-0 top-0 bottom-0 flex text-xs">
		<SimilarityBarVertical similarity={result.similarity} />
	</div>
	<!-- <p class="font-sans text-gray-800">"...{result.text}..."</p> -->
</div>

{#if showTrancription}
	<div class="absolute z-[99] left-4 right-4">
		<TranscriptionContainerLarge {result} />
		<button
			class="absolute w-8 h-8 bg-white rounded-full -top-4 -right-4 hover:shadow hover:mt-[-2px]"
			on:click={() => (showTrancription = false)}
			><div class="flex flex-col items-center justify-center">
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

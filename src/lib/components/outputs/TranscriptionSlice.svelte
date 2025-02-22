<script>
	import { fly } from 'svelte/transition';
	import SimilarityBarVertical from '../ui/SimilarityBarVertical.svelte';

	export let result;
</script>

<div
	class="relative transition-shadow h-20 w-[10px] bg-white border shadow-sm hover:top-[-1px] hover:shadow-md"
	transition:fly={{ y: 20 }}
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

<script>
	import { fly } from 'svelte/transition';
	import SimilarityBarVertical from '../ui/SimilarityBarVertical.svelte';

	export let result;
</script>

<div
	class="relative p-4 pl-8 transition-shadow bg-white border rounded-lg shadow-sm hover:top-[-1px] hover:shadow-md"
	transition:fly={{ y: 20 }}
>
	<div class="flex items-end justify-between w-full">
		<div></div>
		<span class="flex items-center gap-1 mb-4 text-sm text-black/40">
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

		<div></div>
	</div>
	<div class="absolute top-0 bottom-0 flex text-xs left-3">
		<SimilarityBarVertical similarity={result.similarity} />
	</div>
	<p class="font-sans text-gray-800">"...{result.text}..."</p>
</div>

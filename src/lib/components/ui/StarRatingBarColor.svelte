<script>
	import { getStarCount } from '$lib/utils/stars.js';

	export let bandObject;

	export let small = false;
	export let darkMode = false;

	const levelColors = [
		'bg-lime-400 border-lime-500',
		'bg-green-400 border-green-500',
		'bg-yellow-400 border-yellow-500',
		'bg-orange-400 border-orange-500',
		'bg-red-400 border-red-500'
	];

	$: level = getStarCount(bandObject?.instagram?.followersCount);
	$: filledColor = level > 0 ? levelColors[level - 1] : 'bg-gray-300 border-gray-400';
	$: emptyColor = darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200';
</script>

<!-- Uniform Color Based on Max Level -->
<div class="flex items-center">
	{#each Array(5) as _, i}
		{#if small}
			<div class={`w-2 h-2 rounded-sm border ${i < level ? filledColor : emptyColor}`}></div>
		{:else}
			<div class={`w-4 h-4 rounded-sm border ${i < level ? filledColor : emptyColor}`}></div>
		{/if}
	{/each}
</div>

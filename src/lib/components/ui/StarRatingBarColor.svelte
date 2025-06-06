<script>
	import { getStarCount } from '$lib/utils/stars.js';

	export let bandObject;

	const levelColors = [
		'bg-red-400 border-red-500',
		'bg-orange-400 border-orange-500',
		'bg-yellow-400 border-yellow-500',
		'bg-lime-400 border-lime-500',
		'bg-green-400 border-green-500'
	];

	$: level = getStarCount(bandObject?.instagram?.followersCount);
	$: filledColor = level > 0 ? levelColors[level - 1] : 'bg-gray-300 border-gray-400';
</script>

<!-- Uniform Color Based on Max Level -->
<div class="flex items-center">
	{#each Array(5) as _, i}
		<div
			class={`w-4 h-4 rounded-sm border ${i < level ? filledColor : 'bg-gray-50 border-gray-200'}`}
		></div>
	{/each}
</div>

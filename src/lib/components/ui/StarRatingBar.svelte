<script>
	import { getStarCount } from '$lib/utils/stars.js';

	export let bandObject;
</script>

<!-- Digital Bar Graph -->
<div class="flex items-center">
	{#each Array(5) as _, i}
		<div
			class={`w-4 h-4 rounded-sm border border-gray-200 ${
				i < getStarCount(bandObject.instagram.followersCount)
					? 'bg-yellow-400 border-yellow-500'
					: 'bg-gray-50'
			}`}
		></div>
	{/each}
</div>

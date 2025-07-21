<script>
	import { gigsStoreFiltered } from '$lib/stores/gigsStore.js';
	import { fade } from 'svelte/transition';
</script>

<h2
	class="mb-0 font-mono w-fit border-[1px] rounded-full px-4 py-1 text-3xl"
	in:fade={{ duration: 1000 }}
>
	{$gigsStoreFiltered.length} <span class="w-8 -ml-4 text-xs font-thin font-body">gigs</span>
</h2>

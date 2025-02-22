<!-- SearchBox.svelte -->
<script>
	import { searchTranscriptions, searchTermStore } from '$lib/stores/transcriptionStore';
	import { fly } from 'svelte/transition';
	import SimilarityBar from '../ui/SimilarityBarVertical.svelte';
	let searchTerm = '';
	let searchResults = [];
	let isSearching = false;

	$: searchTerm = $searchTermStore;

	$: if ($searchTermStore.length > 1) handleSearch($searchTermStore);
	$: if (searchTerm.length > 1) handleSearch(searchTerm);

	async function handleSearch(searchTerm) {
		// exit early if empty
		if (!searchTerm.trim()) {
			searchResults = [];
			return;
		}
		$searchTermStore = searchTerm;

		isSearching = true;
		try {
			searchResults = await searchTranscriptions(searchTerm);
		} catch (error) {
			console.error('Search error:', error);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	function formatTimestamp(isoString) {
		const date = new Date(isoString);
		return date.toLocaleTimeString();
	}

	function formatSimilarity(similarity) {
		return (similarity * 100).toFixed(1) + '%';
	}
</script>

<div
	class="absolute bottom-[70px] top-[0px] left-0 right-0 flex flex-col w-full max-w-2xl gap-2 mx-auto space-y-4"
>
	<div class="h-[100px]"></div>

	{#if searchResults.length > 0}
		<div class="inset-0 flex flex-col-reverse gap-2 overflow-y-auto">
			<div class="h-[200px]"></div>

			{#each searchResults as result}
				<div
					class="relative p-4 pl-8 transition-shadow bg-white border rounded-lg shadow-sm hover:top-[-1px] hover:shadow-md"
					transition:fly={{ y: 20 }}
				>
					<div class="flex items-start justify-between">
						<span class="mb-4 text-sm text-gray-500">
							{result.timestamp}
						</span>
						<!-- <span class="text-sm font-medium text-blue-500">
							{formatSimilarity(result.similarity)}
						</span> -->
						<div class="absolute top-0 bottom-0 flex text-xs left-3">
							<!-- <p>vibe</p> -->
							<SimilarityBar similarity={result.similarity} />
						</div>
					</div>
					<p class="font-sans text-gray-800">"...{result.text}..."</p>
				</div>
			{/each}
			<div class="h-[200px]"></div>
		</div>
	{/if}
</div>

<div class="absolute bottom-0 left-0 right-0 flex gap-2">
	<input
		type="text"
		bind:value={searchTerm}
		on:keydown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
		on:click={() => ($searchTermStore = '')}
		placeholder="Search transcriptions..."
		class="flex-1 px-4 py-2 border-0 rounded ring-none focus:ring-1 focus:ring-black/20"
	/>
</div>

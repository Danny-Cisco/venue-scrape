<!-- SearchBox.svelte -->
<script>
	import { searchTranscriptions, searchTermStore } from '$lib/stores/transcriptionStore';
	import { fly } from 'svelte/transition';
	let searchTerm = '';
	$: $searchTermStore = searchTerm;
	let searchResults = [];
	let isSearching = false;

	$: if ($searchTermStore.length > 1) handleSearch();

	async function handleSearch() {
		if (!$searchTermStore.trim()) {
			searchResults = [];
			return;
		}

		isSearching = true;
		try {
			searchResults = await searchTranscriptions($searchTermStore);
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
			{#each searchResults as result}
				<div
					class="p-4 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md"
					transition:fly={{ y: 20 }}
				>
					<div class="flex items-start justify-between">
						<span class="text-sm text-gray-500">
							{formatTimestamp(result.timestamp)}
						</span>
						<span class="text-sm font-medium text-blue-500">
							{formatSimilarity(result.similarity)}
						</span>
					</div>
					<p class="text-gray-800">{result.text}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>

<div class="absolute bottom-0 left-0 right-0 flex gap-2">
	<input
		type="text"
		bind:value={searchTerm}
		on:keydown={(e) => e.key === 'Enter' && handleSearch()}
		on:click={() => ($searchTermStore = '')}
		placeholder="Search transcriptions..."
		class="flex-1 px-4 py-2 border-0 rounded ring-none focus:ring-1 focus:ring-black/20"
	/>
</div>

<!-- SearchBox.svelte -->
<script>
	import { searchTranscriptions } from '$lib/stores/transcriptionStore';
	import { fly } from 'svelte/transition';

	let searchQuery = '';
	let searchResults = [];
	let isSearching = false;

	async function handleSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		isSearching = true;
		try {
			searchResults = await searchTranscriptions(searchQuery);
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

<div class="w-full max-w-2xl mx-auto space-y-4">
	<div class="flex gap-2">
		<input
			type="text"
			bind:value={searchQuery}
			on:keydown={(e) => e.key === 'Enter' && handleSearch()}
			placeholder="Search transcriptions..."
			class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button
			on:click={handleSearch}
			class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
			disabled={isSearching}
		>
			{isSearching ? 'Searching...' : 'Search'}
		</button>
	</div>

	{#if searchResults.length > 0}
		<div class="space-y-2">
			{#each searchResults as result}
				<div
					class="p-4 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md"
					transition:fly={{ y: 20 }}
				>
					<div class="flex items-start justify-between mb-2">
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

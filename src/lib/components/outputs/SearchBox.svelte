<!-- SearchBox.svelte -->
<script>
	import TranscriptionContainerLarge from './TranscriptionContainerLarge.svelte';
	import {
		searchTranscriptions,
		searchTermStore,
		transcriptionStore
	} from '$lib/stores/transcriptionStore';
	import { fly } from 'svelte/transition';
	import SimilarityBarVertical from '../ui/SimilarityBarVertical.svelte';
	import { get } from 'svelte/store';
	let searchTerm = '';
	let searchResults = [];
	let isSearching = false;
	let focusClass = '';

	$: searchTerm = $searchTermStore;

	$: if ($searchTermStore.length > 1) handleSearch($searchTermStore);
	$: if (searchTerm.length > 1) handleSearch(searchTerm);

	$: if ($transcriptionStore) handleSearch(searchTerm);

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
	class="absolute bottom-[7px] top-[0px] left-4 right-4 flex flex-col max-w-2xl gap-2 mx-auto space-y-4"
>
	<div class="h-[150px]"></div>

	{#if searchResults.length > 0}
		<div class="inset-0 flex flex-col-reverse gap-2 pt-48 pb-10 overflow-y-auto hide-scrollbar">
			<div class="h-[200px]"></div>

			{#each searchResults as result}
				<TranscriptionContainerLarge {result} />
			{/each}
			<div class="h-[300px]"></div>
		</div>
		<div class="h-4"></div>
	{/if}
</div>

<div class="absolute left-0 right-0 flex gap-2 bottom-1">
	<div class="flex items-center {focusClass} justify-center w-full p-4 bg-white rounded-3xl">
		<button
			type="button"
			on:click={() => {
				document.getElementById('searchField').focus();
				$searchTermStore = '';
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="ml-1 mr-4 size-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
				/>
			</svg>
		</button>
		<input
			type="text"
			id="searchField"
			autocomplete="off"
			bind:value={searchTerm}
			on:keydown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
			on:click={() => {
				$searchTermStore = '';
			}}
			on:focus={() => {
				focusClass = 'shadow relative top-[-1px] h-[74px]';
			}}
			on:blur={() => {
				focusClass = '';
			}}
			placeholder="Search for quotes..."
			class="flex-1 px-4 py-2 border-0 rounded ring-none focus:ring-1 focus:ring-black/20"
		/>
	</div>
</div>

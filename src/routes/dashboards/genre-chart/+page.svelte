<script>
	import { fade } from 'svelte/transition';
	import GigsBandsTable from '$lib/components/tables/GigsBandsTable.svelte';
	// Ensure this path points to your styled UpsetPlot component file
	import UpsetPlot from '$lib/components/outputs/UpsetPlot.svelte';
	import { gigsStore, gigsGenreStore, gigsStoreFiltered } from '$lib/stores/gigsStore.js';

	let gigs = {}; // Placeholder
	let bands = {}; // Placeholder

	let gigsRecords;

	export let data;

	$: ({ gigsData, profile, session } = data);

	$: if (gigsData.success) gigsRecords = gigsData.records;

	$: $gigsStore = gigsRecords;
	$: $gigsStoreFiltered;

	$: console.log('data on the page...', data);
	$: console.log('gigsRecords on the page...', gigsRecords);
	$: console.log('gigsStore...', $gigsStore);

	// --- Define MOVIE data for the Upset Plot ---
	// Structure: { name: Genre, values: [Movie Titles] }
	// This is a sample dataset, replace with your actual data source/loading.
	const movieGenreData = [
		{
			name: 'Action',
			values: [
				'The Dark Knight',
				'Mad Max: Fury Road',
				'John Wick',
				'Gladiator',
				'Die Hard',
				'Mission: Impossible',
				'Inception',
				'Avengers: Endgame',
				'Extraction'
			]
		},
		{
			name: 'Adventure',
			values: [
				'Mad Max: Fury Road',
				'Gladiator',
				'Mission: Impossible',
				'Inception',
				'Avengers: Endgame',
				'Indiana Jones',
				'Pirates of the Caribbean',
				'Lord of the Rings'
			]
		},
		{
			name: 'Sci-Fi',
			values: [
				'The Dark Knight',
				'Mad Max: Fury Road',
				'Inception',
				'Avengers: Endgame',
				'Blade Runner 2049',
				'Arrival',
				'Interstellar',
				'Extraction',
				'Star Wars'
			]
		},
		{
			name: 'Thriller',
			values: [
				'The Dark Knight',
				'John Wick',
				'Inception',
				'Blade Runner 2049',
				'Parasite',
				'Gone Girl',
				'Prisoners',
				'Extraction',
				'Star Wars'
			]
		},
		{
			name: 'Comedy',
			values: [
				'Parasite',
				'The Grand Budapest Hotel',
				'Superbad',
				'Booksmart',
				'Paddington 2',
				'Deadpool'
			]
		},
		{
			name: 'Drama',
			values: [
				'The Dark Knight',
				'Gladiator',
				'Inception',
				'Blade Runner 2049',
				'Arrival',
				'Interstellar',
				'Parasite',
				'Gone Girl',
				'Prisoners',
				'The Grand Budapest Hotel',
				'Forrest Gump'
			]
		},
		{
			name: 'Romance',
			values: [
				'Gone Girl',
				'The Grand Budapest Hotel',
				'Forrest Gump',
				'La La Land',
				'Pride & Prejudice'
			]
		},
		{ name: 'Horror', values: ['Get Out', 'Hereditary', 'A Quiet Place', 'It Follows'] },
		// {
		// 	name: 'Animation',
		// 	values: ['Spider-Man: Into the Spider-Verse', 'Spirited Away', 'Your Name']
		// }
		{
			name: 'Animation',
			values: [] // checking that zero values will display
		}
	];

	let upsetPlotData;
	$: upsetPlotData = $gigsGenreStore; // Assign the data
</script>

<div class="page isolate" in:fade>
	<!-- header with gradient -->
	<div class="w-screen text-center">
		<h1 class="mt-4 mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-300">
			Genre Chart - All Gigs
		</h1>
	</div>

	<!-- Main content area -->
	<div class="flex flex-col w-screen gap-6 p-4 lg:flex-row">
		<!-- Upset Plot Area -->
		<div class="flex-grow overflow-hidden">
			<UpsetPlot data={upsetPlotData} />
		</div>
	</div>

	<!-- Table Area (Optional) -->
	<div class="p-4 mt-4">
		<!-- <h2 class="mb-2 text-xl font-semibold text-gray-700">Gigs & Bands Data</h2> -->
		{#if Object.keys($gigsStore).length === 0 && Object.keys(bands).length === 0}
			<p class="italic text-gray-500">No gigs or bands data loaded.</p>
		{:else}
			<GigsBandsTable gigs={$gigsStoreFiltered} {bands} />
		{/if}
	</div>
</div>

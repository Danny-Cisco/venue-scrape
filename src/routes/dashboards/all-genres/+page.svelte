<script>
	import { fade } from 'svelte/transition';
	import D3Donut from '$lib/components/outputs/D3Donut.svelte';

	export let donutData = [
		{ category: 'Rock', value: 30 },
		{ category: 'Pop', value: 25 },
		{ category: 'Hip Hop', value: 15 },
		{ category: 'Jazz', value: 10 },
		{ category: 'Electronic', value: 20 }
	];

	let missingGenres = ['Punk', 'Rave', 'Rockerbilly'];

	function handleMissingGenreClick(genre) {
		console.log('Missing Genre Click = ', genre);
	}
</script>

<div class="page isolate" in:fade>
	<!-- header with gradient -->
	<div class="w-screen text-center bg-gradient-to-br from-purple-500 to-pink-500">
		<h1
			class="mt-4 mb-4 text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl"
		>
			All Genres
		</h1>
	</div>
	<div class="flex w-screen p-4">
		<D3Donut {donutData} />
		<div class="flex flex-col w-xs">
			<div class="border-white mb-4 whitespace-nowrap border-b-[1px]">MISSING GENRES</div>
			{#each missingGenres as missingGenre}
				<div class="row">
					-
					<div
						class="hover:cursor-pointer hover:underline"
						on:click={() => handleMissingGenreClick(missingGenre)}
					>
						{missingGenre}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

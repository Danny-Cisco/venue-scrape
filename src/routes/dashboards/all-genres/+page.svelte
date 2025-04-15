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

	<D3Donut {donutData} />
</div>

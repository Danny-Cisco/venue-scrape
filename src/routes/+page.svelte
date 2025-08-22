<script lang="ts">
	import { fade } from 'svelte/transition';

	import { onMount } from 'svelte';

	onMount(() => {});
</script>

<div class="absolute inset-0 bg-black">
	<div class="page-center" in:fade>
		<div class="flex flex-col items-stretch items-start justify-start">
			<div class="relative">
				<img
					src="http://musicnaarm.com/images/musicnaarm-poster.png"
					alt="colorful graphic of electricity moving between 4 coloured rectangles"
					class="object-cover w-full mx-auto mb-8"
				/>
			</div>

			<!-- <div class="flex flex-wrap gap-8">
				<h1 class="font-black text-left uppercase text-cream text-8xl font-fancy2">Music</h1>
				<h1 class="font-black text-left uppercase text-cream text-8xl font-fancy2">Naarm</h1>
			</div> -->
			<a
				href="/dashboards/genre-chart"
				class="inline-flex items-center justify-center w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg bg-naarmpink-500 hover:bg-purple-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
			>
				Go to Gig Guide
				<svg
					class="w-5 h-5 ms-2 rtl:rotate-180"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 14 10"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M1 5h12m0 0L9 1m4 4L9 9"
					/>
				</svg>
			</a>
			<p class="w-full mt-10 mr-auto font-sans font-medium text-center text-7xl text-cream">
				FIND YOUR CROWD.
			</p>
		</div>
	</div>
</div>

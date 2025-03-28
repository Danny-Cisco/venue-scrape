<script lang="ts">
	import { fade } from 'svelte/transition';

	import { onMount } from 'svelte';

	onMount(() => {});
</script>

<div class="page-center" in:fade>
	<h1 class="text-6xl text-transparent bg-clip-text bg-gradient-to-r to-emerald-400 from-sky-400">
		Venue Scrape
	</h1>
	<p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
		AI tools for Music booking
	</p>
	<a
		href="/learn-more"
		class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
	>
		Learn more
		<svg
			class="w-3.5 h-3.5 ms-2 rtl:rotate-180"
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
</div>

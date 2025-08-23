<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	onMount(() => {});
</script>

<div class="page-center" in:fade>
	<div class="absolute inset-0 h-full bg-black">
		<div class="flex flex-col items-stretch items-start justify-start max-w-4xl p-2 mx-auto">
			<img
				src="http://musicnaarm.com/images/musicnaarm-image.png"
				alt="colorful graphic of electricity moving between 4 coloured rectangles"
				class="object-cover w-full mx-auto mt-20 mb-4"
			/>
			<div class="flex flex-wrap justify-between">
				<h1 class="font-black text-left uppercase text-8xl text-cream sm:text-9xl font-fancy2">
					Music
				</h1>
				<h1 class="font-black text-left uppercase text-8xl text-cream sm:text-9xl font-fancy2">
					Naarm
				</h1>
			</div>
			<a
				href="/dashboards/genre-chart"
				class="inline-flex items-center justify-center w-full hover:mt-[-1px] hover:mb-[1px] px-5 py-4 text-lg font-medium text-center text-white border-4 border-pink-300 rounded-lg my-shadow cta-button bg-naarmpink-500 hover:bg-purple-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
			>
				Take me to the gig guide <svg
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
		</div>
		<div class="w-full pb-20 mx-auto mt-10 text-center bg-black">
			<p class="font-sans text-lg text-gray-300">
				Want early access to the beta?
				<a
					href="https://musicnaarm.com"
					class="underline transition-colors duration-200 text-naarmpink-500 hover:text-purple-400"
				>
					Join our mailing list
				</a>
				to sign up!
			</p>
		</div>
	</div>
</div>

<style>
	/* Existing styles are assumed to be in a global stylesheet or component scope */
	.cta-button {
		position: relative;
		overflow: hidden;
		z-index: 1;
	}

	.my-shadow:hover {
		box-shadow: rgba(255, 0, 128, 0) 0px 0px 40px;
	}

	.my-shadow {
		/* box-shadow: rgba(255, 0, 128, 0.4) 0px 10px 10px; */
	}

	@keyframes pulse {
		0% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.8;
		}
		100% {
			opacity: 0.4;
		}
	}
</style>

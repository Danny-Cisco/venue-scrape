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
					class="object-cover w-full mx-auto mb-12"
				/>
			</div>

			<a
				href="/dashboards/genre-chart"
				class="inline-flex items-center justify-center w-full px-5 py-4 text-base font-medium text-center text-white rounded-lg cta-button bg-naarmpink-500 hover:bg-purple-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
			>
				View Gig Guide
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
			<p class="w-full mt-10 mr-auto font-sans font-thin text-center text-7xl text-gray-500/50">
				FIND YOUR CROWD.
			</p>
			<div class="w-full mt-8 text-center">
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
</div>

<style>
	/* Existing styles are assumed to be in a global stylesheet or component scope */
	.cta-button {
		position: relative;
		overflow: hidden;
		z-index: 1;
	}

	/* Animated outline effect */
	.cta-button::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 0.5rem; /* Matches button's rounded-lg */
		padding: 1px; /* Thickness of the outline */
		background: linear-gradient(135deg, #ff00ff, #00ffff, #ff00ff);
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		animation: pulse 2s infinite;
		z-index: -1;
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

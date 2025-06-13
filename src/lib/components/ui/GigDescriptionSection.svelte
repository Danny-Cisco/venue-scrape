<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { htmlFormatter } from '$lib/utils/prompts.ts';

	export let showDescription = false;
	export let gig;

	let formatting = false;
	let question = gig.description;
	let systemPrompt = htmlFormatter;
	let htmlDescription;

	async function formatText() {
		formatting = true;
		const parsedBody = JSON.stringify({ question, systemPrompt });

		const response = await fetch('/api/openai/qabot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: parsedBody
		});

		const data = await response.json();
		console.log('🚀 ~ formatText ~ data:', data);
		formatting = false;
		return data.answer;
	}

	onMount(async () => {
		if (!gig.descriptionHtml) htmlDescription = await formatText();
	});
</script>

<!-- Description Container -->
<div class="">
	{#if htmlDescription}
		<!-- Formatted HTML Description -->
		<div class="min-w-full p-5 font-sans text-white bg-black description font-thin" in:fade>
			{@html htmlDescription}
		</div>
	{:else if formatting}
		<!-- Loading Animation -->
		<div class="relative pl-5 overflow-hidden text-xs text-gray-400 bg-black">
			<span
				class="wave-mask bg-gradient-to-r from-gray-500 via-white to-gray-500 bg-[length:200%_100%] bg-clip-text text-transparent"
			>
				A nice, formatted description is on its way...
			</span>
		</div>

		<!-- Fallback Raw Description with toggle -->
		<div class="max-w-full p-4 font-sans text-white bg-black font-thin">
			<!-- <p class={showDescription ? '' : 'line-clamp-3'}>
				{@html gig.descriptionHtml || gig.description}
			</p> -->

			<!-- Toggle Button -->
			<!-- <button
				class="mt-2 text-sm text-blue-400 hover:text-blue-300 hover:underline"
				on:click={() => (showDescription = !showDescription)}
			>
				{showDescription ? 'Show less ▲' : 'Show more ▼'}
			</button> -->
		</div>
	{/if}
</div>

<style>
	.wave-mask {
		animation: waveMove 2.5s linear infinite;
	}

	@keyframes waveMove {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	:global(.description p) {
		margin-bottom: 1rem;
		margin-top: 1rem;
		color: white;
		font-family: sans-serif;
		font-weight: 200; /* Tailwind: font-thin */
	}

	:global(.description h1),
	:global(.description h2),
	:global(.description h3) {
		color: white;
		font-family: sans-serif;
		font-weight: 900; /* Tailwind: font-black */
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	:global(.description h1) {
		font-size: 1.8rem;
		padding-bottom: 1rem;
	}

	:global(.description h2) {
		font-size: 1.3rem;
		padding-top: 1rem;
	}

	:global(.description h3) {
		font-size: 1.2rem;
		padding-top: 1rem;
	}

	:global(.description ul) {
		margin-left: 1.5rem;
		list-style-type: disc;
		margin-bottom: 1rem;
		color: white;
		font-family: sans-serif;
		font-weight: 200;
	}

	:global(.description li) {
		margin-bottom: 0.5rem;
	}

	:global(.description strong) {
		font-weight: bold;
		color: white;
	}

	:global(.description .footer-class),
	:global(.description .info-class) {
		font-size: 0.5rem;
		color: #ccc;
		font-family: sans-serif;
	}
</style>

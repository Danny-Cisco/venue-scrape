<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { htmlFormatter } from '$lib/utils/prompts.ts';
	import WaveText from '$lib/components/ui/WaveText.svelte';

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
<div class="pl-4 bg-black">
	{#if htmlDescription}
		<!-- Formatted HTML Description -->
		<div class="min-w-full p-5 font-sans font-thin text-white bg-black description" in:fade>
			{@html htmlDescription}
		</div>
	{:else if formatting}
		<!-- Loading Animation -->

		<WaveText text={'  A nice, formatted description is on its way...'} />
		<!-- Fallback Raw Description with toggle -->
		<div class="max-w-full p-4 font-sans font-thin text-white bg-black">
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

<script>
	import { slide, fade } from 'svelte/transition';
	import { dog, eventToJson } from '$lib/utils/prompts.ts';
	let question = '';
	let systemPrompt = eventToJson;
	let responseText = '';
	let loading = false;

	async function sendQuestion() {
		loading = true;
		const parsedBody = await JSON.stringify({ question, systemPrompt });
		const response = await fetch('/api/openai/qabot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: parsedBody
		});

		const data = await response.json();
		responseText = data.answer;
		loading = false;
	}

	async function upsertGig() {
		loading = true;
		const parsedBody = await JSON.stringify({ responseText });
		const response = await fetch('/api/supabase/upsert-gig', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: parsedBody
		});

		const data = await response.json();
		console.log('🚀 ~ upsertGig ~ data:', data);

		loading = false;
	}
</script>

<div class="gap-4 page-center">
	<h1 class="text-4xl">OpenAI QA Bot</h1>
	<p class="flex w-full">System Prompt:</p>
	<textarea
		name="systemPrompt"
		id="systemPrompt"
		class="w-full h-[150px]"
		on:keydown={(e) => {
			if (e.key === 'Enter' && e.metaKey) sendQuestion();
		}}
		bind:value={systemPrompt}
	/>

	<!-- <input type="text" bind:value={question} /> -->
	<p class="flex w-full">Question:</p>
	<textarea
		name="question"
		id="question"
		class="w-full"
		on:keydown={(e) => {
			if (e.key === 'Enter' && e.metaKey) sendQuestion();
		}}
		bind:value={question}
	/>
	<button on:click={sendQuestion} class="btn">Send Message</button>

	{#if loading}
		<div class="row">
			loading <img src="/pac-man.svg" alt="" class=" size-10" transition:slide />
		</div>
	{/if}
	{#if responseText}
		<p class="flex w-full">Answer:</p>
		<div class="rounded bg-white/5">
			<p class="p-4 rounded">{responseText}</p>
		</div>
	{/if}

	<button on:click={upsertGig} class="btn">Upsert Gig</button>
</div>

<script>
	import { dog, eventToJson } from '$lib/utils/prompts.ts';
	let question = '';
	let systemPrompt = eventToJson;
	let responseText = '';

	async function sendQuestion() {
		const parsedBody = await JSON.stringify({ question, systemPrompt });
		const response = await fetch('/api/openai/qabot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: parsedBody
		});

		const data = await response.json();
		console.log('🚀 ~ sendQuestion ~ data:', data);
		responseText = data.answer;
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
	<p>{responseText}</p>
</div>

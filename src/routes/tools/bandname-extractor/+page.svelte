<script>
	import { slide, fade } from 'svelte/transition';
	import { bandnameExtractor } from '$lib/utils/prompts.ts';
	let question = '';
	let systemPrompt = bandnameExtractor;
	let responseText = '';
	let loading = false;

	let bands = [];
	let thinking = '';
	let parsed = false;

	async function sendQuestion() {
		loading = true;
		bands = [];
		thinking = '';
		parsed = false;

		const parsedBody = JSON.stringify({ question, systemPrompt });
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

		// Try to parse the response if it's JSON
		try {
			const parsedJson = JSON.parse(responseText);
			bands = parsedJson.bands;
			thinking = parsedJson.thinking;
			parsed = true;
		} catch (e) {
			console.warn('Failed to parse responseText as JSON');
		}
	}
</script>

<div class="gap-4 page-center">
	<div class="py-[300px] w-full space-y-8 flex flex-col items-center">
		<h1 class="mb-4 text-4xl">Band Name Extractor</h1>

		<p class="w-full font-semibold">System Prompt:</p>
		<textarea
			class="w-full min-h-[150px] p-2 bg-white/15 border border-white/10 rounded"
			on:keydown={(e) => {
				if (e.key === 'Enter' && e.metaKey) sendQuestion();
			}}
			bind:value={systemPrompt}
		/>

		<p class="w-full mt-4 font-semibold">Question:</p>
		<textarea
			class="w-full min-h-[150px] p-2 bg-white/15 border border-white/10 rounded"
			on:keydown={(e) => {
				if (e.key === 'Enter' && e.metaKey) sendQuestion();
			}}
			bind:value={question}
		/>

		<button on:click={sendQuestion} class="mt-4 btn">Send Message</button>

		{#if loading}
			<div class="flex items-center gap-2 mt-4">
				<span>Loading</span>
				<img src="/pac-man.svg" alt="loading" class="size-8" />
			</div>
		{/if}

		{#if responseText}
			<p class="w-full mt-6 font-semibold">Raw Response:</p>
			<div class="p-4 text-sm whitespace-pre-wrap rounded bg-white/15">{responseText}</div>
		{/if}

		{#if parsed}
			{#if thinking}
				<p class="mt-6 italic text-white/80">🤔 {thinking}</p>
			{/if}

			<h2 class="mt-4 text-xl">🎵 Bands Found: {bands.length}</h2>
			<table class="w-full mt-2 border-collapse">
				<thead>
					<tr class="bg-white/10">
						<th class="p-2 text-left">Band Name</th>
						<th class="p-2 text-left">Instagram</th>
						<th class="p-2 text-left">DJ</th>
						<th class="p-2 text-left">MC</th>
						<th class="p-2 text-left">Country</th>
						<th class="p-2 text-left">Town</th>
					</tr>
				</thead>
				<tbody>
					{#each bands as band}
						<tr class="odd:bg-white/15 even:bg-white/0">
							<td class="p-2">{band.bandname}</td>
							<td class="p-2">{band.instagram ?? '—'}</td>
							<td class="p-2">
								{band.dj && band.dj === true ? '✅' : '—'}
							</td>
							<td class="p-2">
								{band.mc && band.mc === true ? '🎤' : '—'}
							</td>
							<td class="p-2">{band.homeCountry ?? '—'}</td>
							<td class="p-2">{band.homeTown ?? '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

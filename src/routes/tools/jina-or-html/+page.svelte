<script>
	import { fade } from 'svelte/transition';
	import CopyClipboard from '$lib/components/ui/CopyClipboard.svelte';
	let input;
	let output;

	let copied = false;

	let jinaString = 'https://r.jina.ai/';

	async function useJina() {
		copied = false;
		try {
			const res = await fetch(jinaString + input);

			if (!res.ok) {
				// Try to read error text or fall back to status
				const errText = await res.text();
				output = `Error ${res.status}: ${errText}`;
				return;
			}

			output = await res.text();
		} catch (err) {
			output = `Network error: ${err.message}`;
		}
	}

	async function useHtml() {
		copied = false;
		try {
			const res = await fetch(`/api/scrape-html?target=${input}`);

			if (res.ok) {
				const json = await res.json();
				output = json.html;
			} else {
				const errText = await res.text();
				output = `Error ${res.status}: ${errText}`;
			}
		} catch (err) {
			output = `Network error: ${err.message}`;
		}
	}

	async function useCheerio() {
		copied = false;
		try {
			const res = await fetch(`/api/cheerio/eventbrite-json?url=${input}`);

			if (res.ok) {
				const json = await res.json();
				output = JSON.stringify(json, null, 2);
			} else {
				const errText = await res.text();
				output = `Error ${res.status}: ${errText}`;
			}
		} catch (err) {
			output = `Network error: ${err.message}`;
		}
	}

	$: tokenCount = approximateTokenCount(output);

	function approximateTokenCount(text) {
		if (!text) return 0;
		// Estimate: average token = 4 characters
		return Math.ceil(text.length / 4);
	}
</script>

<div class="mb-4 space-y-4 page" in:fade>
	<h1>JINA or HTML</h1>

	<input type="text" class="w-full" bind:value={input} />
	<div class="flex gap-4">
		<button class="btn" on:click={useJina}>JINA</button>
		<button class="btn" on:click={useHtml}>HTML</button>
		<button class="btn" on:click={useCheerio}>Cheerio</button>
	</div>
</div>
<div class="w-full p-4 bg-white/15 rounded-xl">
	<div class="flex items-center justify-between mb-2">
		<h1>OUTPUT GOES HERE:</h1>
		<CopyClipboard text={output} {copied} />
	</div>
	<p class="text-sm italic text-right opacity-70">
		Approx. {(tokenCount / 1000).toFixed(1)}k tokens
	</p>
	{#if output}
		<div class="w-full my-8 border-t border-dashed"></div>

		<pre class="whitespace-pre-wrap">{output}</pre>
	{/if}
</div>

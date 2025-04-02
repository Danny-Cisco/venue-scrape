<script>
	let input;
	let output;

	let jinaString = 'https://r.jina.ai/';

	async function useJina() {
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
		try {
			const res = await fetch(`/api/scrape-html?target=${input}`);

			if (res.ok) {
				output = await res.text();
			} else {
				const errText = await res.text();
				output = `Error ${res.status}: ${errText}`;
			}
		} catch (err) {
			output = `Network error: ${err.message}`;
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(output);
			alert('Copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}
</script>

<div class="mb-4 space-y-4 page">
	<h1>JINA or HTML</h1>

	<input type="text" class="w-full" bind:value={input} />
	<div class="flex gap-4">
		<button class="btn" on:click={useJina}>JINA</button>
		<button class="btn" on:click={useHtml}>HTML</button>
	</div>
</div>
<div class="w-full p-4 border rounded">
	<div class="flex items-center justify-between mb-2">
		<h1>OUTPUT</h1>
		<button class="btn btn-sm" on:click={copyToClipboard}>Copy</button>
	</div>
	<pre class="whitespace-pre-wrap">{output}</pre>
</div>

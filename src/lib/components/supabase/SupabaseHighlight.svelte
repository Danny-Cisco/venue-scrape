<script>
	export let highlights;

	function parseHighlights(text) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, 'text/html');
		return doc.body;
	}
</script>

{#if highlights}
	<div class="mb-2">
		{#each Object.keys(highlights) as key}
			{#if highlights[key]}
				{#if key !== 'user_id'}
					<div class="highlight-section grid grid-cols-3">
						<h3 class="text-base font-bold">{key.toUpperCase()}</h3>
						<p class="col-span-2 mt-1 text-base text-gray-600">
							{#each Array.from(parseHighlights(highlights[key][0]).childNodes) as node}
								{#if node.nodeName === 'EM'}
									<em>{node.textContent}</em>
								{:else}
									{node.textContent}
								{/if}
							{/each}
						</p>
					</div>
				{/if}
			{/if}
		{/each}
	</div>
{/if}

<style>
	em {
		background-color: greenyellow;
		color: black;
		border-radius: 4px;
		font-weight: bold;
		font-style: italic;
	}
</style>

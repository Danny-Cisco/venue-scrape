<script>
	let urls = [
		'https://www.moshtix.com.au/v2/venues/bad-decisions-bar/8683',
		'https://www.moshtix.com.au/v2/venues/the-toff-in-town-melbourne/1007'
	];

	let loading = false;
	let result = null;
	let error = null;

	async function fetchTicketLinks() {
		loading = true;
		result = null;
		error = null;

		try {
			const res = await fetch('/api/cheerio/moshtix-venueUrls-to-gigs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ urls })
			});

			if (!res.ok) {
				throw new Error(`Error ${res.status}: ${await res.text()}`);
			}

			result = await res.json();
			console.log('🚀 ~ fetchTicketLinks ~ result:', result);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<h1 class="mb-4 text-xl font-bold">Test Moshtix venue batch to gigs</h1>

<textarea
	class="w-full h-32 p-2 mb-2 border rounded"
	bind:value={urls}
	on:change={() => {
		// Normalize textarea input to array
		if (typeof urls === 'string') {
			urls = urls
				.split('\n')
				.map((url) => url.trim())
				.filter(Boolean);
		}
	}}
></textarea>

<button on:click={fetchTicketLinks} class="px-4 py-2 mb-4 text-white bg-blue-600 rounded">
	{loading ? 'Loading…' : 'Fetch Ticket Links'}
</button>

{#if error}
	<p class="mb-4 font-mono text-red-600">❌ {error}</p>
{:else if result}
	<h2 class="mt-4 text-lg font-semibold">Results:</h2>
	<div class="mt-2 space-y-4">
		{#each Object.entries(result) as [platform, links]}
			<div>
				<h3 class="font-bold capitalize">{platform} ({links.length})</h3>
				<ul class="text-sm text-gray-800 list-disc list-inside">
					{#each links as link}
						<li><a href={link} class="hover:underline" target="_blank">{link}</a></li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
{/if}

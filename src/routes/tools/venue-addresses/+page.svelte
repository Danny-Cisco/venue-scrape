<script>
	let venues = [];
	let loading = true;
	let updatedCount = 0;

	async function getAllAddresses() {
		const res = await fetch('/api/supabase/get-all?table=venues');
		venues = await res.json();
		venues = venues.records;
		console.log('🚀 ~ Loaded venues:', venues);

		for (const venue of venues) {
			const query = `${venue.name} music venue Melbourne`;
			const prompt = 'return just a human readable street address string';
			const address = await getAddressFromSearch(query, prompt);
			console.log('📍 Found address:', address);

			if (address) {
				venue.address = address;
				await saveVenueAddress(venue.id, address);
				updatedCount += 1;
			}

			// await delay(1200); // Optional: throttle if needed
		}

		loading = false;
	}

	async function getAddressFromSearch(google, ai) {
		try {
			const res = await fetch(
				`/api/serper/search-plus-ai?google=${encodeURIComponent(google)}&ai=${encodeURIComponent(ai)}`
			);
			const data = await res.json();
			console.log('🤖 AI Response:', data);
			return data.answer?.trim() || null;
		} catch (err) {
			console.error(`❌ Search failed for "${google}":`, err);
			return null;
		}
	}

	async function saveVenueAddress(id, address) {
		try {
			const res = await fetch('/api/supabase/update?table=venues', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, address })
			});
			console.log('✅ Saved address:', res);
			if (!res.ok) throw new Error('Failed to update');
		} catch (err) {
			console.error(`❌ Failed to save address for venue ${id}:`, err);
		}
	}

	function delay(ms) {
		return new Promise((res) => setTimeout(res, ms));
	}
</script>

<div class="page">
	<button class="m-8 btn" on:click={getAllAddresses}>GET ADDRESSES</button>
</div>

{#if loading}
	<p>Updating venue addresses… {updatedCount} updated so far.</p>
{:else}
	<p>🎉 Done! {updatedCount} venues updated with addresses.</p>
	<ul>
		{#each venues as venue}
			<li>{venue.id} — {venue.address}</li>
		{/each}
	</ul>
{/if}

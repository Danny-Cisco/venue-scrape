<script>
	import { onMount } from 'svelte';

	let venues = [];
	let loading = true;
	let updatedCount = 0;

	async function getAllSuburbs() {
		const res = await fetch('/api/supabase/get-all?table=venues');
		venues = await res.json();
		venues = venues.records;
		console.log('🚀 ~ onMount ~ venues:', venues);

		for (const venue of venues) {
			if (venue.location?.coordinates) {
				const suburb = await getSuburbFromCoordinates(venue.location.coordinates);
				console.log('🚀 ~ suburb:', suburb);

				if (suburb) {
					venue.suburb = suburb;
					await saveVenueSuburb(venue.id, suburb);
					updatedCount += 1;
				}

				await delay(1100); // Respect Nominatim's 1 request/sec policy
			}
		}

		loading = false;
	}

	async function getSuburbFromCoordinates(coordinates) {
		if (!Array.isArray(coordinates) || coordinates.length !== 2) {
			console.warn('⚠️ Invalid coordinates:', coordinates);
			return null;
		}

		const [lon, lat] = coordinates; // GeoJSON format is [lng, lat]
		console.log('BOOOOP');
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
				{
					headers: {
						'User-Agent': 'YourAppName/1.0 (your@email.com)'
					}
				}
			);
			const json = await res.json();
			console.log('🚀 ~ getSuburbFromCoordinates ~ json:', json);
			const a = json.address;
			return a.suburb || a.city_district || a.town || a.village || a.locality || a.city || null;
		} catch (err) {
			console.error('❌ Nominatim error for', coordinates, err);
			return null;
		}
	}

	async function saveVenueSuburb(id, suburb) {
		console.log(suburb);
		try {
			const res = await fetch('/api/supabase/update?table=venues', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, suburb })
			});
			console.log('🚀 ~ saveVenueSuburb ~ res:', res);
			if (!res.ok) throw new Error('Failed to update');
		} catch (err) {
			console.error(`❌ Failed to save suburb for venue ${id}`, err);
		}
	}

	function delay(ms) {
		return new Promise((res) => setTimeout(res, ms));
	}
</script>

<div class="page">
	<button class="m-8 btn" on:click={getAllSuburbs}>GET SUBURBS</button>
</div>

{#if loading}
	<p>Updating venue suburbs… {updatedCount} updated so far.</p>
{:else}
	<p>🎉 Done! {updatedCount} venues updated with suburbs.</p>
	<ul>
		{#each venues as venue}
			<li>{venue.id} — {venue.suburb}</li>
		{/each}
	</ul>
{/if}

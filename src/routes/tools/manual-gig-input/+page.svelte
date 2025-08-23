<script lang="ts">
	let isLoading = false;
	let error = null;
	let success = false;

	let requiredFields = ['title', 'start_date'];

	let data: Record<string, any> = {
		title: '',
		description: '',
		start_date: '',
		bands: '',
		bios: '',
		image: '',
		genres: '',
		oztix: '',
		insta_captions: '',
		insta_hashtags: '',
		ticket_url: '',
		thinking: '',
		venue: '',
		date: '',
		time: '',
		user_id: '',
		price: '',
		band_objects: '',
		tickets: '',
		soldout: false,
		source: '',
		rating: '',
		followers: '',
		venue_id: '',
		address: '',
		latlong: '',
		tags: '',
		suburb: '',
		description_html: '',
		location: ''
	};

	let touchedFields: Set<string> = new Set();

	function isRequiredInvalid(key: string) {
		return requiredFields.includes(key) && !data[key];
	}

	function cleanBlankStrings(obj: Record<string, any>) {
		for (const key in obj) {
			if (obj[key] === '') obj[key] = null;
		}
		return obj;
	}

	function safeJsonParse(str: string) {
		if (!str) return [];
		try {
			const parsed = JSON.parse(str);
			return Array.isArray(parsed) ? parsed : [parsed];
		} catch (e) {
			console.warn('Invalid JSON:', str);
			return [];
		}
	}

	async function handleSubmit() {
		error = null;
		success = false;

		const invalidFields = requiredFields.filter((f) => !data[f]);
		if (invalidFields.length > 0) {
			error = `Missing required field(s): ${invalidFields.join(', ')}`;
			invalidFields.forEach((f) => touchedFields.add(f));
			return;
		}

		isLoading = true;

		const payload = {
			...data,
			bands: data.bands?.split(',').map((s) => s.trim()),
			bios: data.bios?.split(',').map((s) => s.trim()),
			genres: data.genres?.split(',').map((s) => s.trim()),
			insta_captions: data.insta_captions?.split(',').map((s) => s.trim()),
			insta_hashtags: data.insta_hashtags?.split(',').map((s) => s.trim()),
			tags: data.tags?.split(',').map((s) => s.trim()),
			oztix: safeJsonParse(data.oztix),
			band_objects: safeJsonParse(data.band_objects),
			tickets: safeJsonParse(data.tickets),
			location: data.location ? `SRID=4326;${data.location}` : null
		};

		cleanBlankStrings(payload);

		try {
			const response = await fetch('/api/supabase/create?table=gigs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to save data');
			}

			success = true;
			error = null;
		} catch (err) {
			console.error(err);
			error = err.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="max-w-4xl p-8 mx-auto space-y-6">
	<h1 class="text-3xl font-bold">Create New Gig</h1>

	<form on:submit|preventDefault={handleSubmit} class="grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each Object.entries(data) as [key, val]}
			<div class="flex flex-col">
				<label for={key} class={requiredFields.includes(key) ? 'required mb-1' : 'mb-1'}>
					{key.replaceAll('_', ' ')}
				</label>

				{#if key === 'soldout'}
					<input type="checkbox" bind:checked={data[key]} id={key} />
				{:else if key === 'start_date'}
					<input
						type="datetime-local"
						bind:value={data[key]}
						id={key}
						class="p-2 border rounded"
						on:blur={() => touchedFields.add(key)}
						class:border-red-500={isRequiredInvalid(key) && touchedFields.has(key)}
					/>
				{:else if ['oztix', 'band_objects', 'tickets'].includes(key)}
					<textarea
						rows="3"
						bind:value={data[key]}
						id={key}
						placeholder="Paste JSON array or object"
						class="p-2 border rounded"
						on:blur={() => touchedFields.add(key)}
						class:border-red-500={isRequiredInvalid(key) && touchedFields.has(key)}
					></textarea>
				{:else if key.endsWith('s') || Array.isArray(val)}
					<textarea
						rows="2"
						bind:value={data[key]}
						id={key}
						placeholder="Comma-separated values"
						class="p-2 border rounded"
						on:blur={() => touchedFields.add(key)}
						class:border-red-500={isRequiredInvalid(key) && touchedFields.has(key)}
					></textarea>
				{:else}
					<input
						type="text"
						bind:value={data[key]}
						id={key}
						class="p-2 border rounded"
						on:blur={() => touchedFields.add(key)}
						class:border-red-500={isRequiredInvalid(key) && touchedFields.has(key)}
					/>
				{/if}
			</div>
		{/each}

		<button
			type="submit"
			class="px-6 py-2 text-white bg-blue-600 rounded col-span-full hover:bg-blue-700 disabled:opacity-50"
			disabled={isLoading}
		>
			{isLoading ? 'Saving...' : 'Save Gig'}
		</button>

		{#if error}
			<p class="text-red-500 col-span-full">{error}</p>
		{/if}

		{#if success}
			<p class="text-green-600 col-span-full">Saved successfully!</p>
		{/if}
	</form>
</main>

<style>
	.required::after {
		content: ' *';
		color: red;
	}
</style>

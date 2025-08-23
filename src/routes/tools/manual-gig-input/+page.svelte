<script lang="ts">
	let isLoading = false;
	let error = null;
	let success = false;

	let requiredFields = ['title', 'start_date'];

	// 🖼 Image
	let imageData = {
		image: ''
	};

	// 📝 Descriptions
	let descriptionData = {
		start_date: '',
		title: '',
		description: '',
		description_html: '',
		tags: '',
		source: '',
		oztix: '',
		genres: ''
	};

	// 🎸 Bands
	let bandsData = {
		band_objects: '',
		bios: '',
		insta_captions: '',
		insta_hashtags: '',
		thinking: '',
		followers: ''
	};

	// 📍 Location
	let locationData = {
		venue: '',
		venue_id: '',
		address: '',
		latlong: '',
		suburb: '',
		location: ''
	};

	// 🎟 Tickets
	let ticketData = {
		tickets: '',
		ticket_url: ''
	};

	let touchedFields: Set<string> = new Set();

	function isRequiredInvalid(key: string, value: string) {
		return requiredFields.includes(key) && !value;
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

		const allData = {
			...imageData,
			...descriptionData,
			...bandsData,
			...locationData,
			...ticketData
		};

		const invalidFields = requiredFields.filter((f) => !allData[f]);
		if (invalidFields.length > 0) {
			error = `Missing required field(s): ${invalidFields.join(', ')}`;
			invalidFields.forEach((f) => touchedFields.add(f));
			return;
		}

		isLoading = true;

		const payload = {
			...allData,
			bands: bandsData.band_objects?.split(',').map((s) => s.trim()),
			bios: bandsData.bios?.split(',').map((s) => s.trim()),
			genres: descriptionData.genres?.split(',').map((s) => s.trim()),
			insta_captions: bandsData.insta_captions?.split(',').map((s) => s.trim()),
			insta_hashtags: bandsData.insta_hashtags?.split(',').map((s) => s.trim()),
			tags: descriptionData.tags?.split(',').map((s) => s.trim()),
			oztix: safeJsonParse(descriptionData.oztix),
			band_objects: safeJsonParse(bandsData.band_objects),
			tickets: safeJsonParse(ticketData.tickets),
			location: locationData.location ? `SRID=4326;${locationData.location}` : null
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
		<!-- 🖼 Image -->
		{#each Object.entries(imageData) as [key, val]}
			{#key key}
				<div class="flex flex-col">
					<label for={key} class={requiredFields.includes(key) ? 'required mb-1' : 'mb-1'}
						>{key.replaceAll('_', ' ')}</label
					>
					<input
						type="text"
						bind:value={imageData[key]}
						id={key}
						class="p-2 border rounded"
						on:blur={() => touchedFields.add(key)}
						class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
					/>
				</div>
			{/key}
		{/each}

		<hr class="mt-10 mb-10 border-t border-gray-500/20 col-span-full" />

		<!-- 📝 Descriptions -->
		{#each Object.entries(descriptionData) as [key, val]}
			{#key key}
				<div class="flex flex-col">
					<label for={key} class={requiredFields.includes(key) ? 'required mb-1' : 'mb-1'}
						>{key.replaceAll('_', ' ')}</label
					>
					{#if key === 'start_date'}
						<input
							type="datetime-local"
							bind:value={descriptionData[key]}
							id={key}
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						/>
					{:else if key === 'oztix'}
						<textarea
							rows="3"
							bind:value={descriptionData[key]}
							id={key}
							placeholder="Paste JSON array or object"
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						></textarea>
					{:else if key.endsWith('s')}
						<textarea
							rows="2"
							bind:value={descriptionData[key]}
							id={key}
							placeholder="Comma-separated values"
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						></textarea>
					{:else}
						<input
							type="text"
							bind:value={descriptionData[key]}
							id={key}
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						/>
					{/if}
				</div>
			{/key}
		{/each}

		<hr class="mt-10 mb-10 border-t border-gray-500/20 col-span-full" />

		<!-- 🎸 Bands -->
		{#each Object.entries(bandsData) as [key, val]}
			{#key key}
				<div class="flex flex-col">
					<label for={key} class={requiredFields.includes(key) ? 'required mb-1' : 'mb-1'}
						>{key.replaceAll('_', ' ')}</label
					>
					{#if key === 'band_objects'}
						<textarea
							rows="3"
							bind:value={bandsData[key]}
							id={key}
							placeholder="Paste JSON array or object"
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						></textarea>
					{:else if key.endsWith('s')}
						<textarea
							rows="2"
							bind:value={bandsData[key]}
							id={key}
							placeholder="Comma-separated values"
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						></textarea>
					{:else}
						<input
							type="text"
							bind:value={bandsData[key]}
							id={key}
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						/>
					{/if}
				</div>
			{/key}
		{/each}

		<hr class="mt-10 mb-10 border-t border-gray-500/20 col-span-full" />

		<!-- 📍 Location -->
		{#each Object.entries(locationData) as [key, val]}
			{#key key}
				<div class="flex flex-col">
					<label for={key} class={requiredFields.includes(key) ? 'required mb-1' : 'mb-1'}
						>{key.replaceAll('_', ' ')}</label
					>
					<input
						type="text"
						bind:value={locationData[key]}
						id={key}
						class="p-2 border rounded"
						on:blur={() => touchedFields.add(key)}
						class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
					/>
				</div>
			{/key}
		{/each}

		<hr class="mt-10 mb-10 border-t border-gray-500/20 col-span-full" />

		<!-- 🎟 Tickets -->
		{#each Object.entries(ticketData) as [key, val]}
			{#key key}
				<div class="flex flex-col">
					<label for={key} class={requiredFields.includes(key) ? 'required mb-1' : 'mb-1'}
						>{key.replaceAll('_', ' ')}</label
					>
					{#if key === 'soldout'}
						<input type="checkbox" bind:checked={ticketData[key]} id={key} />
					{:else if key === 'tickets'}
						<textarea
							rows="3"
							bind:value={ticketData[key]}
							id={key}
							placeholder="Paste JSON array or object"
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						></textarea>
					{:else}
						<input
							type="text"
							bind:value={ticketData[key]}
							id={key}
							class="p-2 border rounded"
							on:blur={() => touchedFields.add(key)}
							class:border-red-500={isRequiredInvalid(key, val) && touchedFields.has(key)}
						/>
					{/if}
				</div>
			{/key}
		{/each}
		{#if error}
			<p class="text-red-500 col-span-full">{error}</p>
		{/if}

		{#if success}
			<p class="text-green-600 col-span-full">Saved successfully!</p>
		{/if}
		<button
			type="submit"
			class="px-6 py-2 text-white bg-blue-600 rounded col-span-full hover:bg-blue-700 disabled:opacity-50"
			disabled={isLoading}
		>
			{isLoading ? 'Saving...' : 'Save Gig'}
		</button>
	</form>
</main>

<style>
	.required::after {
		content: ' *';
		color: red;
	}
</style>

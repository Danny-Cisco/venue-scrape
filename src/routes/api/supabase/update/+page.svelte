<script>
	let isLoading = false;
	let error = null;
	let success = false;

	let data = {
		key: '',
		content: ''
	};

	async function handleSubmit() {
		isLoading = true;
		error = null;
		success = false;

		if (!data.key.trim()) {
			error = 'Please enter a key';
			isLoading = false;
			return;
		}

		try {
			const response = await fetch(`/api/supabase/update?table=lenses`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to update data');
			}

			const result = await response.json();
			console.log('Updated:', result.updated_data);
			success = true;
		} catch (err) {
			console.error('Error updating:', err);
			error = err.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="max-w-2xl p-4 mx-auto">
	<h1 class="mb-4 text-2xl font-bold">Update Entry</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="key" class="block mb-1">Secret Key</label>
			<input
				id="key"
				type="text"
				bind:value={data.key}
				class="w-full p-2 border rounded"
				placeholder="Enter secret key..."
			/>
		</div>

		<div>
			<label for="content" class="block mb-1">Content</label>
			<textarea
				id="content"
				bind:value={data.content}
				rows="3"
				class="w-full p-2 border rounded"
				placeholder="Type your content..."
			></textarea>
		</div>

		<button
			type="submit"
			class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
			disabled={isLoading}
		>
			{isLoading ? 'Updating...' : 'Update'}
		</button>
	</form>

	{#if error}
		<p class="mt-4 text-red-500">{error}</p>
	{/if}

	{#if success}
		<p class="mt-4 text-green-500">Updated successfully!</p>
	{/if}
</main>

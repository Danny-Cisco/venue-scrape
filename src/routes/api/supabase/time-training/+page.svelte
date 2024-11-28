<script>
	import { onMount } from 'svelte';

	let formData = {
		input_user: '',
		output_when_group: ''
	};

	let isLoading = false;
	let error = null;
	let success = false;

	async function handleSubmit() {
		isLoading = true;
		error = null;
		success = false;

		const submitData = {
			...formData,
			time_now: new Date().toISOString(),
			output_datetime: new Date().toISOString()
		};

		try {
			const response = await fetch('/api/supabase/time-training', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(submitData)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create record');
			}

			const data = await response.json();
			console.log('Created record with ID:', data.id);
			success = true;
			formData = { input_user: '', output_when_group: '' }; // Reset form after successful submission
		} catch (err) {
			console.error('Error creating record:', err);
			error = err.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">Create New Record</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="input_user" class="mb-1 block">Input User</label>
			<input
				type="text"
				id="input_user"
				bind:value={formData.input_user}
				required
				class="w-full rounded border p-2"
			/>
		</div>

		<div>
			<label for="output_when_group" class="mb-1 block">Output When Group</label>
			<input
				type="text"
				id="output_when_group"
				bind:value={formData.output_when_group}
				required
				class="w-full rounded border p-2"
			/>
		</div>

		<button
			type="submit"
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			disabled={isLoading}
		>
			{isLoading ? 'Creating...' : 'Create Record'}
		</button>
	</form>

	{#if error}
		<p class="mt-4 text-red-500">{error}</p>
	{/if}

	{#if success}
		<p class="mt-4 text-green-500">Record created successfully!</p>
	{/if}
</main>

<style>
	/* Add any additional styles here if needed */
</style>

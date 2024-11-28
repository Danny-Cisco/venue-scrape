<!-- <script>
	import { onMount } from 'svelte';

	import FormDataPlusUiUpdater from '$lib/components/capture/FormDataPlusUiUpdater.svelte';

	let formData = {
		short: '',
		summary: '',
		type: '',
		outcome: '',
		archive: false,
		do: false,
		done: false,
		natural_when: '',
		to: '',
		from: '',
		who: '',
		user_full_name: '',
		owner: '',
		org: '',
		access: '',
		subject: '',
		email: '',
		long: ''
	};

	let recordId = '';
	let isLoading = false;
	let error = null;
	let success = false;

	function validateEmail(email) {
		const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return re.test(String(email).toLowerCase());
	}

	async function handleSubmit() {
		isLoading = true;
		error = null;
		success = false;

		if (formData.email && !validateEmail(formData.email)) {
			error = 'Please enter a valid email address';
			isLoading = false;
			return;
		}

		try {
			const response = await fetch(`/api/supabase/update?id=${recordId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to update record');
			}

			const data = await response.json();
			console.log('Updated record with ID:', data.id);
			success = true;
			formData = {}; // Reset form after successful submission
		} catch (err) {
			console.error('Error updating record:', err);
			error = err.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="max-w-2xl p-4 mx-auto">
	<h1 class="mb-4 text-2xl font-bold">Update a Record</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<input
			type="text"
			bind:value={recordId}
			placeholder="Enter record ID"
			class="flex-grow p-2 border rounded-l"
		/>
		<div>
			<label for="email" class="block mb-1">Email</label>
			<input
				type="email"
				id="email"
				bind:value={formData.email}
				class="w-full p-2 border rounded"
				on:blur={() => {
					if (formData.email && !validateEmail(formData.email)) {
						error = 'Please enter a valid email address';
					} else {
						error = null;
					}
				}}
			/>
		</div>

		<div>
			<label for="short" class="block mb-1">Short Title</label>
			<input
				type="text"
				id="short"
				bind:value={formData.short}
				required
				class="w-full p-2 border rounded"
			/>
		</div>

		<div>
			<label for="summary" class="block mb-1">Summary</label>
			<textarea
				id="summary"
				bind:value={formData.summary}
				rows="3"
				class="w-full p-2 border rounded"
			></textarea>
		</div>

		<div>
			<label for="type" class="block mb-1">Type</label>
			<input type="text" id="type" bind:value={formData.type} class="w-full p-2 border rounded" />
		</div>

		<div>
			<label for="outcome" class="block mb-1">Outcome</label>
			<input
				type="text"
				id="outcome"
				bind:value={formData.outcome}
				class="w-full p-2 border rounded"
			/>
		</div>

		<div class="flex space-x-4">
			<label class="flex items-center">
				<input type="checkbox" bind:checked={formData.archive} class="mr-2" />
				Archive
			</label>
			<label class="flex items-center">
				<input type="checkbox" bind:checked={formData.do} class="mr-2" />
				Do
			</label>
			<label class="flex items-center">
				<input type="checkbox" bind:checked={formData.done} class="mr-2" />
				Done
			</label>
		</div>

		<div>
			<label for="natural_when" class="block mb-1">Natural When</label>
			<input
				type="text"
				id="natural_when"
				bind:value={formData.natural_when}
				class="w-full p-2 border rounded"
			/>
		</div>

		<div>
			<label for="to" class="block mb-1">To</label>
			<input type="text" id="to" bind:value={formData.to} class="w-full p-2 border rounded" />
		</div>

		<div>
			<label for="from" class="block mb-1">From</label>
			<input type="text" id="from" bind:value={formData.from} class="w-full p-2 border rounded" />
		</div>

		<div>
			<label for="who" class="block mb-1">Who</label>
			<input type="text" id="who" bind:value={formData.who} class="w-full p-2 border rounded" />
		</div>

		<div>
			<label for="user_full_name" class="block mb-1">User Full Name</label>
			<input
				type="text"
				id="user_full_name"
				bind:value={formData.user_full_name}
				class="w-full p-2 border rounded"
			/>
		</div>

		<div>
			<label for="owner" class="block mb-1">Owner</label>
			<input type="text" id="owner" bind:value={formData.owner} class="w-full p-2 border rounded" />
		</div>

		<div>
			<label for="org" class="block mb-1">Organization</label>
			<input type="text" id="org" bind:value={formData.org} class="w-full p-2 border rounded" />
		</div>

		<div>
			<label for="access" class="block mb-1">Access</label>
			<input
				type="text"
				id="access"
				bind:value={formData.access}
				class="w-full p-2 border rounded"
			/>
		</div>

		<div>
			<label for="subject" class="block mb-1">Subject</label>
			<input
				type="text"
				id="subject"
				bind:value={formData.subject}
				class="w-full p-2 border rounded"
			/>
		</div>

		<button
			type="submit"
			class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
			disabled={isLoading || (formData.email && !validateEmail(formData.email))}
		>
			{isLoading ? 'Updating...' : 'Update Record'}
		</button>
	</form>

	{#if error}
		<p class="mt-4 text-red-500">{error}</p>
	{/if}

	{#if success}
		<p class="mt-4 text-green-500">Record updated successfully!</p>
	{/if}
</main>

<FormDataPlusUiUpdater {recordId} {formData} />

<style>
	/* Add any additional styles here if needed */
</style> -->

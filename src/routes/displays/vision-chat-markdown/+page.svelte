<script>
	import { fade } from 'svelte/transition';
	import { supabaseGetOneLens } from '$lib/supabase/supabaseHelpers.js';
	import { onMount, onDestroy } from 'svelte';
	import {
		SupabaseHeading,
		SupabaseError,
		SupabaseLoading,
		SupabaseTextInput
	} from '$lib/components/supabase';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	let isLoading = false;
	let secretKey = '';
	let markdown = '';
	let intervalId;
	let availableLenses = [];

	let result = { record: null, error: null };
	let error = '';
	let record = '';
	let pollingInterval = 1000; // Polling interval in milliseconds

	// Fetch available lenses on mount
	onMount(async () => {
		await fetchLenses();
	});

	async function fetchLenses() {
		try {
			const response = await fetch('/api/supabase/get-all?table=lenses');
			if (!response.ok) {
				throw new Error('Failed to fetch lenses');
			}
			const data = await response.json();
			availableLenses = data.records || [];
		} catch (err) {
			console.error('Error fetching lenses:', err);
			error = 'Failed to load available lenses';
		}
	}

	function handleLensSelect(event) {
		secretKey = event.target.value;
	}

	// Reactive statements
	$: error = result.error;
	$: record = result.record;
	$: markdown = record?.record.content;
	$: htmlContent = markdown ? DOMPurify.sanitize(marked(markdown)) : '';

	// Function to fetch the record
	async function fetchRecord() {
		if (!secretKey) {
			result = { record: null, error: 'Please select a lens to view.' };
			return;
		}
		isLoading = true;
		result = await supabaseGetOneLens(secretKey);
		isLoading = false;
	}

	// Start polling when the record ID is set
	$: {
		if (secretKey) {
			clearInterval(intervalId); // Clear any existing interval
			intervalId = setInterval(fetchRecord, pollingInterval); // Start polling
			console.log('start polling...');
		} else {
			clearInterval(intervalId); // Stop polling if no record ID
			console.log('end polling...');
		}
	}

	// Cleanup polling on component destruction
	onDestroy(() => {
		clearInterval(intervalId);
	});
</script>

<main class="max-w-2xl p-4 mx-auto space-y-4" in:fade>
	<!-- Lens Selector Dropdown -->
	<div class="w-full">
		<select
			class="w-full p-2 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			on:change={handleLensSelect}
			value={secretKey}
		>
			<option value="">Select a lens to view...</option>
			{#each availableLenses as lens}
				<option value={lens.key}>{lens.lens_name || 'Unnamed Lens'}</option>
			{/each}
		</select>
	</div>

	<!-- Content Display -->
	{#if htmlContent}
		<div class="p-4 prose bg-white shadow-md max-w-none rounded-xl" transition:fade>
			{@html htmlContent}
		</div>
	{/if}
	<SupabaseError {error} />
</main>

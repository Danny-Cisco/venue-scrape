<script>
	import { fade } from 'svelte/transition';
	import { supabaseGetOneLens } from '$lib/supabase/supabaseHelpers.js';
	import { onDestroy } from 'svelte';
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

	let result = { record: null, error: null };
	let error = '';
	let record = '';
	let pollingInterval = 1000; // Polling interval in milliseconds

	// Reactive statements
	$: error = result.error;
	$: record = result.record;
	$: markdown = record?.record.content;
	$: htmlContent = markdown ? DOMPurify.sanitize(marked(markdown)) : '';

	// Function to fetch the record
	async function fetchRecord() {
		if (!secretKey) {
			result = { record: null, error: 'Record ID is required for polling.' };
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
	<!-- <input-section> -->
	<SupabaseTextInput bind:value={secretKey} placeholder="Enter Secret Key..." />
	<!-- </input-section> -->

	<!-- <output-section> -->
	<!-- <SupabaseLoading {isLoading} /> -->
	<div class="p-4 prose bg-white shadow-md max-w-none rounded-xl">
		{@html htmlContent}
	</div>
	<SupabaseError {error} />
	<!-- </output-section> -->
</main>

<script>
	import { supabaseGetOne } from '$lib/supabase/supabaseHelpers.js';
	import {
		SupabaseRecord,
		SupabaseHeading,
		SupabaseError,
		SupabaseLoading,
		SupabaseTextInput,
		SupabaseSubmitButton
	} from '$lib/components/supabase';

	let isLoading = false;
	let recordId = '';

	let result = { record: null, error: null };
	let error = '';
	let record = '';

	$: error = result.error;
	$: record = result.record;

	async function handleSubmitButton() {
		isLoading = true;
		result = await supabaseGetOne(recordId);
		isLoading = false;
	}
</script>

<main class="max-w-2xl p-4 mx-auto space-y-4">
	<SupabaseHeading heading="Get One Record" />

	<!-- <input-section> -->
	<SupabaseTextInput bind:value={recordId} placeholder="Enter Record Id..." />
	<SupabaseSubmitButton on:click={handleSubmitButton} {isLoading} />
	<!-- </input-section> -->

	<!-- <output-section> -->
	<SupabaseLoading {isLoading} />
	<SupabaseRecord {record} />
	<SupabaseError {error} />
	<!-- </output-section> -->
</main>

<script>
	import { supabaseGetAll } from '$lib/supabase/supabaseHelpers.js';
	import {
		SupabaseRecord,
		SupabaseHeading,
		SupabaseError,
		SupabaseLoading,
		SupabaseButton
	} from '$lib/components/supabase';

	let result = { error: '', records: [] };
	let records = [];
	let error = '';
	let isLoading = false;

	$: error = result.error;
	$: records = result.records;

	$: console.log('result', result);

	async function fetchRecords() {
		isLoading = true;
		result = await supabaseGetAll();
		isLoading = false;
	}
</script>

<main class="mx-auto max-w-2xl p-4">
	<SupabaseHeading heading="Supabase Get-All (via cli client)" />

	<!-- Input Section -->
	<div class="mb-2">
		<SupabaseButton {isLoading} on:click={fetchRecords} labelA="Fetch Records" />
	</div>

	<!-- Output Section -->
	{#if records?.length > 0}
		<ul class="space-y-4 text-black">
			hello
			{#each records as record}
				<SupabaseRecord {record} />
			{/each}
		</ul>
	{/if}
	<SupabaseLoading {isLoading} />
	<SupabaseError {error} />
</main>

<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import GigsBandsTable from '$lib/components/tables/GigsBandsTable.svelte';
	import UpsetPlot from '$lib/components/outputs/UpsetPlot.svelte';

	import { dateRangePrompt } from '$lib/utils/prompts.ts';

	import {
		gigsStore,
		gigsGenreStore,
		gigsStoreFiltered,
		dateRangeStore,
		gigsStoreDateFiltered,
		filteredGigIds
	} from '$lib/stores/gigsStore.js';

	let gigs = {};
	let bands = {};
	let gigsRecords;
	export let data;

	let tableSectionRef;

	// Auto-scroll when `filteredGigIds` changes and has values
	$: if ($filteredGigIds?.length > 0 && tableSectionRef) {
		// Slight delay can help with reactivity
		setTimeout(() => {
			tableSectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 50);
	}

	// Handle data updates
	$: ({ gigsData, profile, session } = data);
	$: if (gigsData?.success) gigsRecords = gigsData.records;
	$: if (gigsRecords) $gigsStore = gigsRecords;

	// Debugging logs
	$: console.log('✅ data:', data);
	$: console.log('✅ gigsRecords:', gigsRecords);
	$: console.log('✅ gigsStore:', $gigsStore);
	$: console.log('✅ gigsStoreDateFiltered:', $gigsStoreDateFiltered);
	$: console.log('✅ dateRangeStore:', $dateRangeStore);

	// Format date as yyyy-mm-dd
	function formatDateForInput(date) {
		if (!(date instanceof Date) || isNaN(date.getTime())) {
			console.warn('Invalid date passed to formatDateForInput:', date);
			const today = new Date();
			return today.toISOString().split('T')[0];
		}
		const formattedDate = date.toISOString().split('T')[0];
		console.log('🚀 ~ formatDateForInput ~ formattedDate:', formattedDate);
		return formattedDate;
	}

	let startDateInput = '';
	let endDateInput = '';

	let timeRangePrompt = '';

	function updateDateRange(type, event) {
		$filteredGigIds = [];
		const newDateString = event.target.value;
		console.log(`🟡 updateDateRange: ${type} =`, newDateString);
		if (!newDateString) {
			console.warn(`⚠️ Tried to set ${type} date to an empty string.`);
			return;
		}

		try {
			const newDate = new Date(newDateString + 'T00:00:00Z');
			if (isNaN(newDate.getTime())) {
				console.error(`❌ Invalid ${type} date:`, newDateString);
				return;
			}

			const currentRange = $dateRangeStore || { start: null, end: null };
			let updatedRange = { ...currentRange };

			if (type === 'start') {
				if (currentRange.end && newDate > currentRange.end) {
					console.warn('Start date > end date. Syncing them.');
					updatedRange = { start: newDate, end: newDate };
				} else {
					updatedRange = { ...currentRange, start: newDate };
				}
			} else if (type === 'end') {
				if (currentRange.start && newDate < currentRange.start) {
					console.warn('End date < start date. Syncing them.');
					updatedRange = { start: newDate, end: newDate };
				} else {
					updatedRange = { ...currentRange, end: newDate };
				}
			}

			dateRangeStore.set(updatedRange);
		} catch (e) {
			console.error(`❌ Error processing ${type} date:`, e);
		}
	}

	async function getDateRange(timeRangePrompt) {
		const systemPrompt = `The current date, day and time is ${nowForChat}. ${dateRangePrompt} `;
		const question = timeRangePrompt;
		// fetch from openai qa endpoint

		// loading = true;

		const jsonBody = await JSON.stringify({ question, systemPrompt });
		const response = await fetch('/api/openai/qabot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application./json'
			},
			body: jsonBody
		});

		const data = await response.json();
		const answerJson = data.answer;
		const dateRangeJson = await JSON.parse(answerJson);
		console.log('🚀 ~ getDateRange ~ dateRangeJson:', dateRangeJson);

		dateRangeStore.set({ start: dateRangeJson.startDate, end: dateRangeJson.endDate });

		return;
	}

	let upsetPlotData;
	$: upsetPlotData = $gigsGenreStore;

	let nowForChat = '';

	onMount(() => {
		const now = new Date();
		const formatter = new Intl.DateTimeFormat('en-AU', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
			timeZoneName: 'short'
		});
		nowForChat = formatter.format(now);
		console.log('🕰️ nowForChat =', nowForChat);
	});
</script>

<!-- UI -->
<div class="page isolate" in:fade>
	<div class="w-screen text-center">
		<h1 class="mt-4 mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-300">
			Genre Chart
		</h1>
	</div>

	<!-- Date Range Inputs -->
	<div class="flex items-center justify-center gap-4 p-4 text-sm text-gray-300">
		<label for="startDate">Start Date:</label>
		<input
			type="date"
			id="startDate"
			bind:value={startDateInput}
			on:change={(e) => {
				console.log('🔁 Start date changed:', e.target.value);
				updateDateRange('start', e);
			}}
			class="px-2 py-1 text-white border border-gray-600 rounded"
		/>

		<label for="endDate">End Date:</label>
		<input
			type="date"
			id="endDate"
			bind:value={endDateInput}
			on:change={(e) => {
				console.log('🔁 End date changed:', e.target.value);
				updateDateRange('end', e);
			}}
			class="px-2 py-1 text-white border border-gray-600 rounded"
		/>
	</div>

	<!-- chat input -->
	<div class="flex items-center justify-center w-full gap-4 p-4 text-sm text-gray-300">
		<input
			type="text"
			bind:value={timeRangePrompt}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					getDateRange(timeRangePrompt);
				}
			}}
			placeholder="Enter a TimeRange..."
			class="w-full px-5 rounded-full"
		/>
	</div>

	<!-- Main content -->
	<div class="flex flex-col w-screen gap-6 p-4 lg:flex-row">
		<div class="flex-grow overflow-hidden">
			{#key upsetPlotData}
				<UpsetPlot data={upsetPlotData} />
			{/key}
		</div>
	</div>

	<!-- Filtered gigs -->

	<!-- Add this above your GigsBandsTable -->
	<div class="p-4 mt-4" bind:this={tableSectionRef}>
		{#if !$gigsStoreFiltered || $gigsStoreFiltered.length === 0}
			<p class="italic text-gray-500">No gigs match the current filters.</p>
		{:else}
			<GigsBandsTable gigs={$gigsStoreFiltered} bands={{}} />
		{/if}
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
	}
	input[type='date'] {
		color-scheme: dark;
	}
</style>

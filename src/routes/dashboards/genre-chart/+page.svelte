<script>
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import GigsBandsTable from '$lib/components/tables/GigsBandsTable.svelte';
	import UpsetPlot from '$lib/components/outputs/UpsetPlot.svelte';
	import GoogleMaps from '$lib/components/outputs/GoogleMaps.svelte';

	import { dateRangePrompt } from '$lib/utils/prompts.ts';

	import {
		gigsStore,
		gigsGenreStore,
		gigsStoreFiltered,
		dateRangeStore,
		gigsStoreDateFiltered,
		filteredGigIds,
		clickedGenres
	} from '$lib/stores/gigsStore.js';

	let gigs = {};
	let bands = {};
	let gigsRecords;
	export let data;

	let gigsData = [];

	let tableSectionRef;
	let chartSectionRef;

	let firstIsBlocked = false;

	let showDatePickerText = 'need an old-school date-picker';

	let showDatePicker = false;

	let nowForChat = '';
	let nowISO;
	let dateRangeEndISO;
	let dateRangeStartISO;

	let startDateInput = '';
	let endDateInput = '';

	let timeRangePrompt = '';
	let loading = false;

	// Auto-scroll when `filteredGigIds` changes and has values
	$: if ($filteredGigIds?.length > 0 && tableSectionRef) {
		// Slight delay can help with reactivity
		setTimeout(() => {
			tableSectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 50);
	}

	// Auto-scroll when `filteredGigIds` changes and has values
	$: if ($gigsStoreDateFiltered?.length > 0 && chartSectionRef) {
		if (!firstIsBlocked) firstIsBlocked = true;
		else
			// Slight delay can help with reactivity
			setTimeout(() => {
				chartSectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 50);
	}

	// Handle data updates
	$: ({ profile, session } = data);
	$: if (gigsData.length > 0) gigsRecords = gigsData.records;
	$: if (gigsRecords)
		$gigsStore = gigsRecords.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

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

		loading = true;

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
		loading = false;
		return;
	}

	let upsetPlotData;
	$: upsetPlotData = $gigsGenreStore;

	onMount(async () => {
		try {
			const now = new Date();

			// 🎤 Human-readable string for LLMs
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

			// 🕓 ISO strings for querying
			nowISO = now.toISOString();
			const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
			dateRangeEndISO = in7Days.toISOString();

			// 🛰️ Fetch gigs from filtered endpoint
			const params = new URLSearchParams({
				table: 'gigs',
				dateRangeStart: nowISO,
				dateRangeEnd: dateRangeEndISO
			});

			const res = await fetch(`/api/supabase/get-filtered-date?${params}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

			const json = await res.json();
			if (!json.success) throw new Error(json.message);

			gigsRecords = json.records; // 🎉 Success!
			console.log('🚀 ~ onMount ~ gigsData:', gigsData);
		} catch (err) {
			console.error('❌ Error loading gigs:', err);
			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<!-- UI -->
<div class="page isolate" in:fade>
	<!-- <div class="w-screen text-center">
		<h1 class="mt-4 mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-300">
			Genre Chart
		</h1>
	</div> -->

	<!-- Main content -->
	<div class="flex flex-col w-screen gap-6 p-4 pt-12 lg:flex-row" bind:this={chartSectionRef}>
		<div class="flex-grow overflow-hidden">
			{#key upsetPlotData}
				<UpsetPlot data={upsetPlotData} />
			{/key}
		</div>
	</div>

	<!-- TimeRange chatGpt input -->
	<div class="relative flex items-center justify-center w-full gap-4 p-4 text-sm text-gray-300">
		<input
			type="text"
			bind:value={timeRangePrompt}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					getDateRange(timeRangePrompt);
				}
			}}
			placeholder="Ask for a date range..."
			class="w-full px-5 rounded-full"
		/>

		<div class="absolute text-gray-500 right-10 row">
			{#if !loading}
				enter

				<svg
					fill="none"
					height="24"
					viewBox="0 0 20 20"
					width="24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						d="m3.76072 12 3.33197 3.136c.20108.1893.21067.5057.02141.7068s-.5057.2107-.70679.0214l-4.25-4c-.10039-.0945-.15731-.2263-.15731-.3641 0-.1379.05693-.2697.15732-.3641l4.25-3.99998c.20109-.18926.51753-.17967.70678.02142.18926.20109.17967.51753-.02142.70678l-3.33182 3.13578h11.23914c1.1046 0 2-.8954 2-2v-4.5c0-.27614.2239-.5.5-.5s.5.22386.5.5v4.5c0 1.6569-1.3431 3-3 3z"
						fill="currentColor"
					/></svg
				>
			{:else}
				<p class="font-semibold text-green-400">loading..</p>
			{/if}
		</div>
	</div>

	<!-- Old school datepicker -->
	<button
		class="text-xs text-left text-gray-500"
		on:click={() => {
			showDatePicker = !showDatePicker;
		}}>{showDatePickerText}?</button
	>
	{#if showDatePicker}
		<!-- Date Range Inputs -->
		<div class="flex items-center justify-center gap-4 p-4 text-sm text-gray-300" transition:slide>
			<div class="block">
				<label for="startDate">Start</label>
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
			</div>

			<div class="block">
				<label for="endDate">End</label>
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
		</div>
	{/if}

	<!-- Filtered gigs -->

	<!-- Add this above your GigsBandsTable -->
	<div class="p-4 mt-4" bind:this={tableSectionRef}>
		{#if !$clickedGenres && !timeRangePrompt}
			<div class="text-center"><h2>NOW SHOWING: ALL GIGS</h2></div>
		{:else}
			<div class="text-center"><h2>NOW SHOWING: {$clickedGenres} {timeRangePrompt}</h2></div>
		{/if}
		{#if !$gigsStoreFiltered || $gigsStoreFiltered.length === 0}
			<p class="italic text-gray-500">Click on chart to see those gigs</p>
		{:else}
			<!-- google maps -->
			{#key $gigsStoreFiltered}
				<GoogleMaps gigs={$gigsStoreFiltered} />
			{/key}
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

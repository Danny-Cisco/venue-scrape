<script>
	import { onMount } from 'svelte';
	import { fade, slide, fly } from 'svelte/transition';
	import GigsBandsTable from '$lib/components/tables/GigsBandsTable.svelte';
	import UpsetPlot from '$lib/components/outputs/UpsetPlot.svelte';

	import { dateRangePrompt } from '$lib/utils/prompts.ts';
	import { toISOStringLocal } from '$lib/utils/date.ts';
	import PacMan from '$lib/components/loadingSpinners/PacMan.svelte';

	import {
		gigsStore,
		gigsGenreStore,
		gigsStoreFiltered,
		dateRangeStore,
		gigsStoreDateFiltered,
		filteredGigIds,
		clickedGenres
	} from '$lib/stores/gigsStore.js';

	import {
		showGigModal,
		showBandModal,
		lastClicked,
		showMapsModal
	} from '$lib/stores/modalStores.js';

	let spellCheckedTimeRange = '';
	let gigs = {};
	let bands = {};
	let gigsRecords;
	export let data;

	let pageInitialising = true;
	let error = null;

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

	// *** NEW: Filter Reset Functions ***

	// Resets only the genre selections from the chart
	function resetGenreSelection() {
		console.log('🔄 Resetting Genre Selection');
		clickedGenres.set(null);
		filteredGigIds.set([]);
	}

	// Resets everything, including the text prompt (for the manual button)
	function handleManualReset() {
		console.log('🔄 Manual Filters Reset');
		resetGenreSelection();
	}

	// Auto-scroll when `filteredGigIds` changes and has values
	$: if ($filteredGigIds?.length > 0 && tableSectionRef) {
		setTimeout(() => {
			tableSectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 50);
	}

	// Auto-scroll when `gigsStoreDateFiltered` changes and has values
	$: if ($gigsStoreDateFiltered?.length > 0 && chartSectionRef) {
		if (!firstIsBlocked) firstIsBlocked = true;
		else
			setTimeout(() => {
				chartSectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 50);
	}

	// Handle data updates
	$: ({ profile, session } = data);
	$: if (gigsData.length > 0) gigsRecords = gigsData.records;
	$: if (gigsRecords)
		$gigsStore = gigsRecords.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

	// Debugging logs
	$: console.log('✅ data:', data);
	$: console.log('✅ gigsRecords:', gigsRecords);
	$: console.log('✅ gigsStore:', $gigsStore);
	$: console.log('✅ gigsStoreDateFiltered:', $gigsStoreDateFiltered);
	$: console.log('✅ dateRangeStore:', $dateRangeStore);

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
		// *** MODIFIED: Reset filters before updating date range ***
		resetGenreSelection();
		timeRangePrompt = '';

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
		// *** MODIFIED: Reset genre filters before using AI prompt ***
		resetGenreSelection();

		const systemPrompt = `The current date, day and time is ${nowForChat}. ${dateRangePrompt} `;
		const question = timeRangePrompt;

		loading = true;

		try {
			const jsonBody = await JSON.stringify({ question, systemPrompt });
			const response = await fetch('/api/openai/qabot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json' // Corrected content type
				},
				body: jsonBody
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
			}

			const data = await response.json();
			const answerJson = data.answer;
			console.log('🚀 ~ raw LLM date range resonse ~ Json:', data);
			const dateRangeJson = await JSON.parse(answerJson);
			console.log('🚀 ~ getDateRange ~ dateRangeJson:', dateRangeJson);

			const start = new Date(dateRangeJson.startDate + 'T00:00:00');
			const end = new Date(dateRangeJson.endDate + 'T23:59:59.999');
			spellCheckedTimeRange = dateRangeJson.correctedDateRelatedInput;
			console.log('🚀 ~ getDateRange ~ timeRangePrompt:', timeRangePrompt);

			const params = new URLSearchParams({
				table: 'gigs',
				dateRangeStart: toISOStringLocal(start),
				dateRangeEnd: toISOStringLocal(end)
			});

			const res = await fetch(`/api/supabase/get-filtered-date?${params}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

			const json = await res.json();
			if (!json.success) throw new Error(json.message);

			gigsRecords = json.records;
			console.log('🚀 ~ getDateRange ~ new gigsRecords:', gigsRecords);
		} catch (err) {
			console.error('❌ Error in getDateRange:', err);
			error = err.message;
		} finally {
			loading = false;
		}
	}

	let upsetPlotData;
	$: upsetPlotData = $gigsGenreStore;

	onMount(async () => {
		resetGenreSelection();

		try {
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

			nowISO = now.toISOString();
			const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
			dateRangeEndISO = in7Days.toISOString();

			const params = new URLSearchParams({
				table: 'gigs',
				dateRangeStart: nowISO,
				dateRangeEnd: dateRangeEndISO
			});

			const res = await fetch(`/api/supabase/get-filtered-date?${params}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

			const json = await res.json();
			if (!json.success) throw new Error(json.message);

			gigsRecords = json.records;
			console.log('🚀 ~ onMount ~ initial gigsRecords:', gigsRecords);
		} catch (err) {
			console.error('❌ Error loading gigs:', err);
			error = err.message;
		} finally {
			loading = false;
			pageInitialising = false;
		}
	});
</script>

{#if pageInitialising}
	<div class="page center h-[100vhs]" in:fade>
		<p>Fetching the next 7 days...</p>
		<PacMan />
	</div>
{:else if loading}
	<div class="page center h-[100vhs]" in:fade>
		<p>Preparing the data...</p>
		<PacMan />
	</div>
{:else}
	<!-- UI -->
	<div class="absolute inset-0 top-[150px] isolate" in:fade>
		<!-- Main content -->
		<div
			class="flex flex-col items-stretch items-center justify-center max-w-full min-w-full gap-6 p-4 pt-12"
			bind:this={chartSectionRef}
		>
			{#key upsetPlotData}
				<UpsetPlot data={upsetPlotData} />
			{/key}
		</div>

		<!-- Old school datepicker -->
		<button
			class="w-full mx-auto text-xs text-center text-gray-500"
			on:click={() => {
				showDatePicker = !showDatePicker;
			}}>{showDatePickerText}?</button
		>
		{#if showDatePicker}
			<div
				class="flex items-center justify-center gap-4 p-4 text-sm text-gray-300"
				transition:slide
			>
				<div>
					<label for="startDate" class="block">Start</label>
					<input
						type="date"
						id="startDate"
						bind:value={startDateInput}
						on:change={(e) => updateDateRange('start', e)}
						class="px-2 py-1 text-white border border-gray-600 rounded"
					/>
				</div>

				<div>
					<label for="endDate" class="block">End</label>
					<input
						type="date"
						id="endDate"
						bind:value={endDateInput}
						on:change={(e) => updateDateRange('end', e)}
						class="px-2 py-1 text-white border border-gray-600 rounded"
					/>
				</div>
			</div>
		{/if}

		<!-- *** MODIFIED: Filtered Gigs Section with Reset Button *** -->
		<div class="p-4 my-4" bind:this={tableSectionRef}>
			{#if !$gigsStoreFiltered || $gigsStoreFiltered.length === 0}
				<p class="italic text-center text-gray-500">
					Click on a chart intersection to see a filtered list of gigs.
				</p>
			{:else}
				<GigsBandsTable gigs={$gigsStoreFiltered} bands={{}} />
			{/if}
		</div>
	</div>
{/if}
<div class="fixed top-[100px] left-0 right-0 bg-black pt-[2px] min-w-screen">
	<!-- Centered container for the heading and reset button -->
	<div
		class="flex items-center justify-center w-screen h-12 gap-8 mb-0 font-sans font-black bg-black"
	>
		{#if !$clickedGenres && !timeRangePrompt}
			<h2 class="mb-0 text-3xl" in:fade={{ duration: 1000 }}>7 Days - ALL Genres</h2>
		{:else}
			<!-- <h2 class="mb-0 text-3xl">NOW SHOWING:</h2> -->
			<h2 class="mb-0 text-3xl" in:fade={{ duration: 1000 }}>
				<span class="capitalize">{spellCheckedTimeRange || timeRangePrompt || '7 Days'}</span><span
					class="px-2"
				>
					-
				</span>
				{$clickedGenres || 'ALL Genres'}
			</h2>
		{/if}
		<h2
			class="mb-0 font-mono absolute right-[70px] border-[1px] rounded-full px-4 py-1 text-3xl"
			in:fade={{ duration: 1000 }}
		>
			{$gigsStoreFiltered.length}
		</h2>
		<!-- The Reset Button -->
		{#if $clickedGenres}
			<div class="relative center left-10" in:fade>
				<button
					on:click={handleManualReset}
					class="absolute px-3 py-1 text-xs font-thin text-white transition-colors bg-purple-500 rounded-full btn-hover row hover:bg-pink-500"
					aria-label="Reset filters"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						class="w-8 h-8"
						fill="currentColor"
						><path
							d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
						></path></svg
					>
					<div class="flex flex-col items-start p-1">
						<div>See All</div>
						<div>Genres</div>
					</div></button
				>
			</div>
		{/if}
	</div>
	<!-- TimeRange chatGpt input -->
	<div
		class="relative flex items-center justify-center w-full max-w-xl gap-4 my-2 mb-4 mx-auto border-purple-500 border-[2px] rounded-full text-sm text-gray-300"
	>
		<input
			type="text"
			bind:value={timeRangePrompt}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					getDateRange(timeRangePrompt);
				}
			}}
			placeholder="Type when... 'Today', 'Next Weekend', 'This Month' etc"
			class="w-full px-5 font-sans rounded-full"
		/>
		<button
			class="absolute text-gray-500 right-5 row hover:text-green-500 hover:font-bold"
			on:click={getDateRange(timeRangePrompt)}
		>
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
		</button>
	</div>
</div>
<button
	class="fixed top-[100px] bg-purple-500 hover:bg-pink-500 py-2 px-4 my-2 btn-hover rounded-l-full right-0"
	on:click={() => ($showMapsModal = true)}
>
	<div>
		<div class="flex flex-col">
			<div>MAP</div>
			<div>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="1.5"
					><path
						d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM9.71002 19.6674C8.74743 17.6259 8.15732 15.3742 8.02731 13H4.06189C4.458 16.1765 6.71639 18.7747 9.71002 19.6674ZM10.0307 13C10.1811 15.4388 10.8778 17.7297 12 19.752C13.1222 17.7297 13.8189 15.4388 13.9693 13H10.0307ZM19.9381 13H15.9727C15.8427 15.3742 15.2526 17.6259 14.29 19.6674C17.2836 18.7747 19.542 16.1765 19.9381 13ZM4.06189 11H8.02731C8.15732 8.62577 8.74743 6.37407 9.71002 4.33256C6.71639 5.22533 4.458 7.8235 4.06189 11ZM10.0307 11H13.9693C13.8189 8.56122 13.1222 6.27025 12 4.24799C10.8778 6.27025 10.1811 8.56122 10.0307 11ZM14.29 4.33256C15.2526 6.37407 15.8427 8.62577 15.9727 11H19.9381C19.542 7.8235 17.2836 5.22533 14.29 4.33256Z"
					></path></svg
				>
			</div>
		</div>
	</div>
</button>

<style>
	.page {
		min-height: 100vh;
	}
	input[type='date'] {
		color-scheme: dark;
	}

	.btn-hover {
		transition: transform 250ms;
	}

	.btn-hover:hover {
		transform: translateY(-2px);
	}
</style>

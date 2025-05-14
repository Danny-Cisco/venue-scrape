<script>
	import { fade } from 'svelte/transition';
	import { lastClicked, showGigModal, showBandModal } from '$lib/stores/modalStores.js';
	import SoldOut from '$lib/components/ui/SoldOut.svelte';

	export let gigs = {};
	export let bands = {};

	let activeTab = 'gigs'; // or 'bands'

	function handleGigRowClick(gig) {
		$lastClicked = gig;
		$showGigModal = true;
	}

	function handleBandRowClick(band) {
		$lastClicked = band;
		$showBandModal = true;
	}

	function convertToTimeString(datetime) {
		const date = new Date(datetime);
		let hours = date.getHours();
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12; // 0 becomes 12
		return `${hours}:${minutes} ${ampm}`;
	}
	function convertToDateString(datetime) {
		const date = new Date(datetime);
		const options = { month: 'short', day: 'numeric' };
		return date.toLocaleDateString(undefined, options);
	}

	function convertToDayOfWeek(datetime) {
		const date = new Date(datetime);
		const options = { weekday: 'long' };
		return date.toLocaleDateString(undefined, options);
	}
</script>

<!-- Tab buttons -->
<div class="flex justify-center w-screen space-x-1 px-14">
	<button
		class="flex-1 px-4 py-2 font-medium transition-all duration-200 border-[1px] border-b-0 rounded-t-2xl overflow-hidden relative group"
		class:!bg-purple-600={activeTab === 'gigs'}
		class:!text-white={activeTab === 'gigs'}
		class:bg-gray-800={activeTab !== 'gigs'}
		class:text-gray-300={activeTab !== 'gigs'}
		class:invisible={gigs.length === 0}
		on:click={() => (activeTab = 'gigs')}
		in:fade
	>
		<!-- Gradient hover background -->
		<span
			class="absolute inset-0 z-0 transition-opacity duration-200 opacity-0 bg-gradient-to-br from-purple-500 to-pink-500 group-hover:opacity-100 rounded-t-2xl"
		></span>
		<!-- Text layer -->
		<span class="relative z-10">Gigs</span>
	</button>

	<button
		class="flex-1 px-4 py-2 font-medium transition-all duration-200 border-[1px] border-b-0 rounded-t-2xl overflow-hidden relative group"
		class:!bg-green-600={activeTab === 'bands'}
		class:!text-white={activeTab === 'bands'}
		class:bg-gray-800={activeTab !== 'bands'}
		class:text-gray-300={activeTab !== 'bands'}
		class:invisible={bands.length === 0}
		on:click={() => (activeTab = 'bands')}
		in:fade
	>
		<!-- Gradient hover background -->
		<span
			class="absolute inset-0 z-0 text-white transition-opacity duration-200 opacity-0 bg-gradient-to-br from-green-400 to-green-600 group-hover:opacity-100 rounded-t-2xl"
		>
		</span>
		<!-- Text layer -->
		<span class="relative z-10">Bands</span>
	</button>
</div>
{#if activeTab === 'gigs' && gigs.length > 0}
	<div class="w-screen px-4 overflow-x-auto" in:fade>
		<table class="min-w-full overflow-hidden table-auto rounded-xl">
			<thead class="text-left bg-black border-b-[2px] border-white">
				<tr>
					<th class="px-4 py-2">Venue</th>
					<th class="px-4 py-2">Image</th>
					<th class="px-4 py-2">Title</th>
					<th class="px-4 py-2">Date</th>
					<th class="px-4 py-2">Time</th>
					<th class="px-4 py-2">Genres</th>
					<th class="px-4 py-2">Bands</th>
					<th class="px-4 py-2">Followers</th>
					<th class="px-4 py-2">Price</th>
					<th class="px-4 py-2">Sold Out?</th>
					<th class="px-4 py-2">Descrip</th>
					<th class="px-4 py-2">Bios</th>
					<th class="px-4 py-2">Insta Caps</th>
					<th class="px-4 py-2">Insta Tags</th>
					<th class="px-4 py-2">Tix URL</th>
					<th class="px-4 py-2">Oztix</th>
				</tr>
			</thead>
			<tbody>
				{#each gigs as gig}
					<tr
						class="hover:bg-gray-900 rowfx text-xs font-light text-gray-300 hover:text-white border-b-[1px] border-gray-500"
						on:click={handleGigRowClick(gig)}
					>
						<td
							class="px-4 py-2 font-bold uppercase whitespace-nowrap overflow-hidden max-w-[150px]"
							><div class="min-h-[100px] flex flex-col justify-center">
								{gig.venue}
							</div>
						</td>
						<td class="px-2 py-2 text-center">
							{#if gig.imageUrl}
								<div title={gig.description} class="overflow-hidden w-[100px] h-[100px] rounded-xl">
									<img src={gig.imageUrl} alt="promotion poster of the event" />
								</div>
							{/if}
						</td>
						<td title={gig.description} class="px-4 py-2 overflow-hidden min-w-[200px]"
							>{gig.title}</td
						>
						<td class="px-4 py-2 whitespace-nowrap">
							<div>{convertToDayOfWeek(gig.datetime)}</div>
							<div>{convertToDateString(gig.datetime)}</div>
						</td>
						<td class="px-4 py-2 whitespace-nowrap">
							<div>{convertToTimeString(gig.datetime)}</div>
						</td>
						<td class="px-4 py-2">
							{#if gig.genres?.length > 0}
								{#each gig.genres as genre}
									<div title={gig.thinking} class="block text-red-400 whitespace-nowrap">
										{genre}
									</div>
								{/each}
							{/if}
						</td>

						<td>
							<div class="px-4 py-2 max-w-[200px] max-h-[100px] overflow-auto">
								{#each gig.bands || [] as band}
									<div class="block text-green-400 whitespace-nowrap">'{band}'</div>
								{/each}
							</div>
						</td>
						<td class="px-4 py-2">
							{#if gig.instaFollowers}
								<div class="max-h-[200px] overflow-y-auto">${gig.instaFollowers}</div>
							{/if}
						</td>

						<td class="px-4 py-2">
							{#if gig.ticketPrice}
								<div class="max-h-[200px] overflow-y-auto">${gig.ticketPrice}</div>
							{/if}
						</td>

						<!-- Tick Columns -->

						<td class="px-2 py-2 text-center">
							{#if !gig.soldOut}
								<SoldOut />
							{/if}
						</td>
						<td class="px-2 py-2 text-center">
							{#if gig.description}
								<span title={gig.description}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="inline w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</span>
							{/if}
						</td>
						<td class="px-2 py-2 text-center">
							{#if gig.bios?.length}
								<span title={gig.bios.join('\n')}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="inline w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</span>
							{/if}
						</td>
						<td class="px-2 py-2 text-center">
							{#if gig.instaCaptions?.length}
								<span title={gig.instaCaptions.join('\n')}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="inline w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</span>
							{/if}
						</td>
						<td class="px-2 py-2 text-center">
							{#if gig.instaHashtags?.length}
								<span title={gig.instaHashtags.join(' ')}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="inline w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</span>
							{/if}
						</td>

						<td class="px-2 py-2 text-center">
							{#if gig.ticketUrl}
								<span title={gig.ticketUrl}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="inline w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</span>
							{/if}
						</td>
						<td class="px-2 py-2 text-center">
							{#if gig.oztix}
								<span title={JSON.stringify(gig.oztix)}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="inline w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if activeTab === 'bands' && bands.length > 0}
	<div class="w-screen px-4 overflow-x-auto" in:fade>
		<table class="min-w-full overflow-hidden table-auto rounded-xl">
			<thead class="text-left bg-black border-b-[2px] border-white">
				<tr>
					<th class="px-4 py-2">Band Name</th>
					<th class="px-4 py-2">Social Urls</th>
					<th class="px-4 py-2">FurtherUrls</th>
				</tr>
			</thead>
			<tbody>
				{#each bands as band}
					<tr
						class="hover:bg-gray-900 rowfx text-xs font-light text-gray-300 hover:text-white border-b-[1px] border-gray-500"
						on:click={handleBandRowClick(band)}
					>
						<td class="px-4 py-2">{band.bandName}</td>
						<td class="px-4 py-2">
							{#each band.socialUrls || [] as socialUrl}
								<div class="flex flex-col">
									{socialUrl}
								</div>
							{/each}
						</td>
						<td class="px-4 py-2">
							{#each band.furtherUrls || [] as furtherUrl}
								<div class="flex flex-col">
									{furtherUrl}
								</div>
							{/each}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.rowfx {
		transition: color, 200ms;
	}
</style>

<script>
	import { fade } from 'svelte/transition';
	import { lastClicked, showGigModal, showBandModal } from '$lib/stores/modalStores.js';

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
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
		class:!bg-pink-600={activeTab === 'bands'}
		class:!text-white={activeTab === 'bands'}
		class:bg-gray-800={activeTab !== 'bands'}
		class:text-gray-300={activeTab !== 'bands'}
		class:invisible={bands.length === 0}
		on:click={() => (activeTab = 'bands')}
		in:fade
	>
		<!-- Gradient hover background -->
		<span
			class="absolute inset-0 z-0 transition-opacity duration-200 opacity-0 bg-gradient-to-br from-purple-500 to-pink-500 group-hover:opacity-100 rounded-t-2xl"
		></span>
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
					<th class="px-4 py-2">Title</th>
					<th class="px-4 py-2">Date</th>
					<th class="px-4 py-2">Time</th>
					<th class="px-4 py-2">Bands</th>
					<th class="px-4 py-2">Description</th>
					<th class="px-4 py-2">Bios</th>
					<th class="px-4 py-2">InstaCaptions</th>
					<th class="px-4 py-2">InstaHashtags</th>
					<th class="px-4 py-2">Image</th>
					<th class="px-4 py-2">Ticket Price</th>
					<th class="px-4 py-2">Ticket Link</th>
					<th class="px-4 py-2">Oztix</th>
					<th class="px-4 py-2">Sold Out</th>
					<th class="px-4 py-2">Genres</th>
					<th class="px-4 py-2">Thinking</th>
				</tr>
			</thead>
			<tbody>
				{#each gigs as gig}
					<tr
						class="hover:bg-gray-900 rowfx text-xs font-light text-gray-300 hover:text-white border-b-[1px] border-gray-500"
						on:click={handleGigRowClick(gig)}
					>
						<td class="px-4 py-2">
							<div class="max-h-[200px] font-bold uppercase whitespace-nowrap overflow-y-auto">
								{gig.venue}
							</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">{gig.title}</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] block overflow-y-auto">
								{convertToDayOfWeek(gig.datetime)}
							</div>
							<div class="max-h-[200px] block whitespace-nowrap overflow-y-auto">
								{convertToDateString(gig.datetime)}
							</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] whitespace-nowrap overflow-y-auto">
								{convertToTimeString(gig.datetime)}
							</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">
								{#if gig.bands?.length > 0}
									{#each gig.bands || [] as band}
										<div class="block">{band}</div>
									{/each}
								{/if}
							</div>
						</td>
						<td class="px-4 py-2 text-xs">
							<div class="max-h-[200px] overflow-y-auto">{gig.description}</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">
								{#if gig.bios?.length > 0}
									{#each gig.bios || [] as bio}
										<div class="block">{bio}</div>
									{/each}
								{/if}
							</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">
								{#if gig.instaCaptions?.length > 0}
									{#each gig.instaCaptions || [] as caption}
										<div class="block">{caption}</div>
									{/each}
								{/if}
							</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">
								{#if gig.instaHashtags?.length > 0}
									{#each gig.instaHashtags || [] as hashtag}
										<div class="block">{hashtag}</div>
									{/each}
								{/if}
							</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">
								{#if gig.imageUrl}
									<img
										src={gig.imageUrl}
										alt="Poster for the gig"
										class="object-cover w-20 h-20 rounded"
									/>
								{:else}
									<span class="text-sm italic text-gray-400">No image</span>
								{/if}
							</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">{gig.ticketPrice}</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">
								{#if gig.ticketUrl}
									<a
										href={gig.ticketUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 underline">Buy Ticket</a
									>
								{:else}
									<span class="text-sm italic text-gray-400">N/A</span>
								{/if}
							</div>
						</td>
						<td class="px-4 py-2">
							{#if gig.oztix}
								<div class="max-h-[200px] overflow-y-auto">
									{JSON.stringify(gig.oztix, null, 2)}
								</div>
							{/if}
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">{gig.soldOut}</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">
								{#if gig.genres?.length > 0}
									{#each gig.genres || [] as genre}
										<div class="block font-bold whitespace-nowrap">{genre}</div>
									{/each}
								{/if}
							</div>
						</td>
						<td class="px-4 py-2">
							<div class="max-h-[200px] overflow-y-auto">{gig.thinking}</div>
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

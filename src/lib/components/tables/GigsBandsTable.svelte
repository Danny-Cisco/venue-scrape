<script>
	import { fade } from 'svelte/transition';
	import { lastClicked, showGigModal, showBandModal } from '$lib/stores/modalStores.js';
	import SoldOut from '$lib/components/ui/SoldOut.svelte';

	export let gigs = {};
	export let bands = {};

	let activeTab = 'gigs'; // or 'bands'

	function formatFollowers(count) {
		if (count) return `${(count / 1000).toFixed(1)}k`;
	}

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
		<span class="relative z-10">Gigs ({gigs.length})</span>
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
		<span class="relative z-10">Bands ({bands.length})</span>
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
							<div class="px-4 py-2 max-w-[250px] max-h-[100px] overflow-auto">
								{#each gig.bandObjects || [] as bandObject}
									<div class="text-green-400 row whitespace-nowrap">
										'{bandObject.bandName}'
										<div class="flex-1 text-blue-400 row">
											<!-- <svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												height="12"
												width="12"
												><path
													d="M12.001 9C10.3436 9 9.00098 10.3431 9.00098 12C9.00098 13.6573 10.3441 15 12.001 15C13.6583 15 15.001 13.6569 15.001 12C15.001 10.3427 13.6579 9 12.001 9ZM12.001 7C14.7614 7 17.001 9.2371 17.001 12C17.001 14.7605 14.7639 17 12.001 17C9.24051 17 7.00098 14.7629 7.00098 12C7.00098 9.23953 9.23808 7 12.001 7ZM18.501 6.74915C18.501 7.43926 17.9402 7.99917 17.251 7.99917C16.5609 7.99917 16.001 7.4384 16.001 6.74915C16.001 6.0599 16.5617 5.5 17.251 5.5C17.9393 5.49913 18.501 6.0599 18.501 6.74915ZM12.001 4C9.5265 4 9.12318 4.00655 7.97227 4.0578C7.18815 4.09461 6.66253 4.20007 6.17416 4.38967C5.74016 4.55799 5.42709 4.75898 5.09352 5.09255C4.75867 5.4274 4.55804 5.73963 4.3904 6.17383C4.20036 6.66332 4.09493 7.18811 4.05878 7.97115C4.00703 9.0752 4.00098 9.46105 4.00098 12C4.00098 14.4745 4.00753 14.8778 4.05877 16.0286C4.0956 16.8124 4.2012 17.3388 4.39034 17.826C4.5591 18.2606 4.7605 18.5744 5.09246 18.9064C5.42863 19.2421 5.74179 19.4434 6.17187 19.6094C6.66619 19.8005 7.19148 19.9061 7.97212 19.9422C9.07618 19.9939 9.46203 20 12.001 20C14.4755 20 14.8788 19.9934 16.0296 19.9422C16.8117 19.9055 17.3385 19.7996 17.827 19.6106C18.2604 19.4423 18.5752 19.2402 18.9074 18.9085C19.2436 18.5718 19.4445 18.2594 19.6107 17.8283C19.8013 17.3358 19.9071 16.8098 19.9432 16.0289C19.9949 14.9248 20.001 14.5389 20.001 12C20.001 9.52552 19.9944 9.12221 19.9432 7.97137C19.9064 7.18906 19.8005 6.66149 19.6113 6.17318C19.4434 5.74038 19.2417 5.42635 18.9084 5.09255C18.573 4.75715 18.2616 4.55693 17.8271 4.38942C17.338 4.19954 16.8124 4.09396 16.0298 4.05781C14.9258 4.00605 14.5399 4 12.001 4ZM12.001 2C14.7176 2 15.0568 2.01 16.1235 2.06C17.1876 2.10917 17.9135 2.2775 18.551 2.525C19.2101 2.77917 19.7668 3.1225 20.3226 3.67833C20.8776 4.23417 21.221 4.7925 21.476 5.45C21.7226 6.08667 21.891 6.81333 21.941 7.8775C21.9885 8.94417 22.001 9.28333 22.001 12C22.001 14.7167 21.991 15.0558 21.941 16.1225C21.8918 17.1867 21.7226 17.9125 21.476 18.55C21.2218 19.2092 20.8776 19.7658 20.3226 20.3217C19.7668 20.8767 19.2076 21.22 18.551 21.475C17.9135 21.7217 17.1876 21.89 16.1235 21.94C15.0568 21.9875 14.7176 22 12.001 22C9.28431 22 8.94514 21.99 7.87848 21.94C6.81431 21.8908 6.08931 21.7217 5.45098 21.475C4.79264 21.2208 4.23514 20.8767 3.67931 20.3217C3.12348 19.7658 2.78098 19.2067 2.52598 18.55C2.27848 17.9125 2.11098 17.1867 2.06098 16.1225C2.01348 15.0558 2.00098 14.7167 2.00098 12C2.00098 9.28333 2.01098 8.94417 2.06098 7.8775C2.11014 6.8125 2.27848 6.0875 2.52598 5.45C2.78014 4.79167 3.12348 4.23417 3.67931 3.67833C4.23514 3.1225 4.79348 2.78 5.45098 2.525C6.08848 2.2775 6.81348 2.11 7.87848 2.06C8.94514 2.0125 9.28431 2 12.001 2Z"
												></path></svg
											> -->

											{formatFollowers(bandObject.instagram?.followersCount) || '---'}
										</div>
									</div>
								{/each}
							</div>
						</td>
						<td class="px-4 py-2">
							{#if gig.followers}
								<div class="max-h-[200px] row overflow-y-auto">
									<div class="flex-1 text-blue-400 row">
										<!-- <svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											height="12"
											width="12"
											><path
												d="M12.001 9C10.3436 9 9.00098 10.3431 9.00098 12C9.00098 13.6573 10.3441 15 12.001 15C13.6583 15 15.001 13.6569 15.001 12C15.001 10.3427 13.6579 9 12.001 9ZM12.001 7C14.7614 7 17.001 9.2371 17.001 12C17.001 14.7605 14.7639 17 12.001 17C9.24051 17 7.00098 14.7629 7.00098 12C7.00098 9.23953 9.23808 7 12.001 7ZM18.501 6.74915C18.501 7.43926 17.9402 7.99917 17.251 7.99917C16.5609 7.99917 16.001 7.4384 16.001 6.74915C16.001 6.0599 16.5617 5.5 17.251 5.5C17.9393 5.49913 18.501 6.0599 18.501 6.74915ZM12.001 4C9.5265 4 9.12318 4.00655 7.97227 4.0578C7.18815 4.09461 6.66253 4.20007 6.17416 4.38967C5.74016 4.55799 5.42709 4.75898 5.09352 5.09255C4.75867 5.4274 4.55804 5.73963 4.3904 6.17383C4.20036 6.66332 4.09493 7.18811 4.05878 7.97115C4.00703 9.0752 4.00098 9.46105 4.00098 12C4.00098 14.4745 4.00753 14.8778 4.05877 16.0286C4.0956 16.8124 4.2012 17.3388 4.39034 17.826C4.5591 18.2606 4.7605 18.5744 5.09246 18.9064C5.42863 19.2421 5.74179 19.4434 6.17187 19.6094C6.66619 19.8005 7.19148 19.9061 7.97212 19.9422C9.07618 19.9939 9.46203 20 12.001 20C14.4755 20 14.8788 19.9934 16.0296 19.9422C16.8117 19.9055 17.3385 19.7996 17.827 19.6106C18.2604 19.4423 18.5752 19.2402 18.9074 18.9085C19.2436 18.5718 19.4445 18.2594 19.6107 17.8283C19.8013 17.3358 19.9071 16.8098 19.9432 16.0289C19.9949 14.9248 20.001 14.5389 20.001 12C20.001 9.52552 19.9944 9.12221 19.9432 7.97137C19.9064 7.18906 19.8005 6.66149 19.6113 6.17318C19.4434 5.74038 19.2417 5.42635 18.9084 5.09255C18.573 4.75715 18.2616 4.55693 17.8271 4.38942C17.338 4.19954 16.8124 4.09396 16.0298 4.05781C14.9258 4.00605 14.5399 4 12.001 4ZM12.001 2C14.7176 2 15.0568 2.01 16.1235 2.06C17.1876 2.10917 17.9135 2.2775 18.551 2.525C19.2101 2.77917 19.7668 3.1225 20.3226 3.67833C20.8776 4.23417 21.221 4.7925 21.476 5.45C21.7226 6.08667 21.891 6.81333 21.941 7.8775C21.9885 8.94417 22.001 9.28333 22.001 12C22.001 14.7167 21.991 15.0558 21.941 16.1225C21.8918 17.1867 21.7226 17.9125 21.476 18.55C21.2218 19.2092 20.8776 19.7658 20.3226 20.3217C19.7668 20.8767 19.2076 21.22 18.551 21.475C17.9135 21.7217 17.1876 21.89 16.1235 21.94C15.0568 21.9875 14.7176 22 12.001 22C9.28431 22 8.94514 21.99 7.87848 21.94C6.81431 21.8908 6.08931 21.7217 5.45098 21.475C4.79264 21.2208 4.23514 20.8767 3.67931 20.3217C3.12348 19.7658 2.78098 19.2067 2.52598 18.55C2.27848 17.9125 2.11098 17.1867 2.06098 16.1225C2.01348 15.0558 2.00098 14.7167 2.00098 12C2.00098 9.28333 2.01098 8.94417 2.06098 7.8775C2.11014 6.8125 2.27848 6.0875 2.52598 5.45C2.78014 4.79167 3.12348 4.23417 3.67931 3.67833C4.23514 3.1225 4.79348 2.78 5.45098 2.525C6.08848 2.2775 6.81348 2.11 7.87848 2.06C8.94514 2.0125 9.28431 2 12.001 2Z"
											></path></svg
										> -->

										{formatFollowers(gig.followers) || '---'}
									</div>
								</div>
							{/if}
						</td>

						<td class="px-4 py-2">
							{#if gig.oztix?.tickets}
								<div class="max-h-[200px] overflow-y-auto">${gig.oztix?.tickets[0].price}</div>
							{:else}
								<div class="max-h-[200px] whitespace-nowrap overflow-y-auto">FREE ENTRY</div>
							{/if}
						</td>

						<!-- Tick Columns -->

						<td class="px-2 py-2 text-center">
							{#if gig.soldOut}
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

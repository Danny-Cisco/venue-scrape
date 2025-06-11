<script>
	import { fade } from 'svelte/transition';
	import { lastClicked, showGigModal, showBandModal } from '$lib/stores/modalStores.js';
	import SoldOut from '$lib/components/ui/SoldOut.svelte';

	export let gigs = []; // Initialize as an empty array for safety

	let activeTab = 'gigs'; // or 'bands'

	// Reactive derivation of unique bands from gigs.bandObjects
	$: uniqueBands = (() => {
		const bandMap = new Map();
		if (gigs && Array.isArray(gigs)) {
			gigs.forEach((gig) => {
				if (gig.bandObjects && Array.isArray(gig.bandObjects)) {
					gig.bandObjects.forEach((bandObject) => {
						if (bandObject && typeof bandObject === 'object') {
							// Determine a unique key for the band, assuming bandObject fields are camelCased
							const bandKey =
								bandObject.instagram?.id ||
								bandObject.instagram?.username ||
								bandObject.bandname || // Primary camelCased name field
								Math.random().toString(); // Fallback to avoid errors, not ideal for reactivity if names are missing

							if (bandKey && !bandMap.has(bandKey)) {
								bandMap.set(bandKey, bandObject);
							}
						}
					});
				}
			});
		}
		return Array.from(bandMap.values());
	})();

	function formatFollowers(count) {
		if (typeof count === 'number' && count >= 0) return `${(count / 1000).toFixed(1)}k`;
		return '---';
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
		if (!datetime) return '';
		const date = new Date(datetime);
		let hours = date.getHours();
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12; // 0 becomes 12
		return `${hours}:${minutes} ${ampm}`;
	}
	function convertToDateString(datetime) {
		if (!datetime) return '';
		const date = new Date(datetime);
		const options = { month: 'short', day: 'numeric' };
		return date.toLocaleDateString(undefined, options);
	}

	function convertToDayOfWeek(datetime) {
		if (!datetime) return '';
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
		class:invisible={!gigs || gigs.length === 0}
		on:click={() => (activeTab = 'gigs')}
		in:fade
	>
		<span
			class="absolute inset-0 z-0 transition-opacity duration-200 opacity-0 bg-gradient-to-br from-purple-500 to-pink-500 group-hover:opacity-100 rounded-t-2xl"
		></span>
		<span class="relative z-10 font-sans text-lg font-semibold uppercase"
			>Gigs ({gigs?.length || 0})</span
		>
	</button>

	<button
		class="flex-1 px-4 py-2 font-medium transition-all duration-200 border-[1px] border-b-0 rounded-t-2xl overflow-hidden relative group"
		class:!bg-green-600={activeTab === 'bands'}
		class:!text-white={activeTab === 'bands'}
		class:bg-gray-800={activeTab !== 'bands'}
		class:text-gray-300={activeTab !== 'bands'}
		class:invisible={!uniqueBands || uniqueBands.length === 0}
		on:click={() => (activeTab = 'bands')}
		in:fade
	>
		<span
			class="absolute inset-0 z-0 text-white transition-opacity duration-200 opacity-0 bg-gradient-to-br from-green-400 to-green-600 group-hover:opacity-100 rounded-t-2xl"
		>
		</span>
		<span class="relative z-10 font-sans text-lg font-semibold uppercase"
			>Bands ({uniqueBands?.length || 0})</span
		>
	</button>
</div>

{#if activeTab === 'gigs' && gigs && gigs.length > 0}
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
						on:click={() => handleGigRowClick(gig)}
					>
						<td
							class="px-4 py-2 border-l-4 px-4 py-2 font-bold uppercase whitespace-nowrap overflow-hidden max-w-[150px]"
							class:border-red-500={gig.tickets?.some((t) => t.availability === 'SoldOut')}
						>
							<div class="min-h-[100px] flex flex-col justify-center">
								{gig.venue?.name || gig.venue}
							</div>
						</td>
						<td class="px-2 py-2 text-center">
							{#if gig.image}
								<div title={gig.description} class="overflow-hidden w-[100px] h-[100px] rounded-xl">
									<img src={gig.image} loading="lazy" alt="Event Poster" />
								</div>
							{/if}
						</td>
						<td title={gig.description} class="px-4 py-2 overflow-hidden min-w-[200px]"
							>{@html gig.title}</td
						>
						<td class="px-4 py-2 whitespace-nowrap">
							<div>{convertToDayOfWeek(gig.startDate)}</div>
							<div>{convertToDateString(gig.startDate)}</div>
						</td>
						<td class="px-4 py-2 whitespace-nowrap">
							<div>{convertToTimeString(gig.startDate)}</div>
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
										'{bandObject.bandname}'
										<div class="flex-1 text-blue-400 row">
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
										{formatFollowers(gig.followers) || '---'}
									</div>
								</div>
							{/if}
						</td>

						<td
							class="px-4 py-2 border-l-4 border-r-4"
							class:border-red-500={gig.tickets?.some((t) => t.availability === 'SoldOut')}
						>
							{#if gig.tickets && gig.tickets.length > 0 && gig.tickets[0].price}
								<div class="max-h-[100px] overflow-y-auto overflow-x-hidden">
									{#each gig.tickets as ticket}
										<div class="block">
											<div class="grid [grid-template-columns:3fr_1fr_1fr] w-[500px]">
												<div class="h-[50px]">{ticket.ticketType}</div>
												<div>${ticket.price}</div>
												{#if ticket.availability == 'SoldOut'}
													<SoldOut />
												{:else}
													<div>{ticket.availability}</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="max-h-[200px] whitespace-nowrap overflow-y-auto">FREE ENTRY</div>
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
								<span title={JSON.stringify(gig.oztix, null, 2)}>
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

{#if activeTab === 'bands' && uniqueBands && uniqueBands.length > 0}
	<div class="w-screen px-4 overflow-x-auto" in:fade>
		<table class="min-w-full overflow-hidden table-auto rounded-xl">
			<thead class="text-left bg-black border-b-[2px] border-white">
				<tr>
					<th class="px-4 py-2">Band Name</th>
					<th class="px-4 py-2">Insta User</th>
					<th class="px-4 py-2 text-center">Followers</th>
					<th class="px-4 py-2 text-center">Posts</th>
					<th class="px-4 py-2">Bio</th>
					<th class="px-4 py-2">Links</th>
				</tr>
			</thead>
			<tbody>
				{#each uniqueBands as band (band.instagram?.id || band.instagram?.username || band.bandname || Math.random())}
					<tr
						class="hover:bg-gray-900 rowfx text-xs font-light text-gray-300 hover:text-white border-b-[1px] border-gray-500"
						on:click={() => handleBandRowClick(band)}
					>
						<td class="px-4 py-2 font-semibold whitespace-nowrap"
							><div class="min-h-[100px] flex flex-col justify-center">
								{band.bandname || band.instagram?.fullName || 'N/A'}
							</div></td
						>
						<td class="px-4 py-2">
							{#if band.instagram?.username && band.instagram?.url}
								<a
									href={band.instagram.url}
									target="_blank"
									rel="noopener noreferrer"
									class="text-pink-400 hover:underline"
								>
									@{band.instagram.username}
								</a>
							{:else if band.instagram?.username}
								@{band.instagram.username}
							{:else}
								N/A
							{/if}
						</td>
						<td class="px-4 py-2 text-center text-blue-400"
							>{formatFollowers(band.instagram?.followersCount)}</td
						>
						<td class="px-4 py-2 text-center">{band.instagram?.postsCount ?? '---'}</td>
						<td
							class="px-4 py-2 max-w-[300px] overflow-hidden text-ellipsis"
							title={band.instagram?.biography}
						>
							<div class="overflow-y-auto max-h-16">
								{band.instagram?.biography || 'N/A'}
							</div>
						</td>
						<td class="px-4 py-2 max-w-[250px]">
							<div class="overflow-y-auto max-h-24">
								{#if band.instagram?.externalUrls && band.instagram.externalUrls.length > 0}
									{#each band.instagram.externalUrls as extUrl}
										<div>
											<a
												href={extUrl.lynxUrl || extUrl.url}
												target="_blank"
												rel="noopener noreferrer"
												class="block text-teal-400 truncate hover:underline"
												title={extUrl.url}
											>
												{extUrl.title ||
													(extUrl.url || extUrl.lynxUrl || '').split('//')[1]?.split('/')[0] ||
													'External Link'}
											</a>
										</div>
									{/each}
								{:else if band.instagram?.externalUrl}
									<div>
										<a
											href={band.instagram.externalUrlShimmed || band.instagram.externalUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="block text-teal-400 truncate hover:underline"
											title={band.instagram.externalUrl}
										>
											{(band.instagram.externalUrlShimmed || band.instagram.externalUrl)
												.split('//')[1]
												?.split('/')[0] || 'External Link'}
										</a>
									</div>
								{:else if band.externalUrlShimmed || band.externalUrl}
									<div>
										<a
											href={band.externalUrlShimmed || band.externalUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="block text-teal-400 truncate hover:underline"
											title={band.externalUrl}
										>
											{(band.externalUrlShimmed || band.externalUrl)
												.split('//')[1]
												?.split('/')[0] || 'External Link'}
										</a>
									</div>
								{/if}

								{#if band.socialUrls && band.socialUrls.length > 0}
									{#each band.socialUrls as socialUrl}
										{#if socialUrl !== band.instagram?.url}
											<div>
												<a
													href={socialUrl}
													target="_blank"
													rel="noopener noreferrer"
													class="block text-purple-400 truncate hover:underline"
													title={socialUrl}
												>
													{socialUrl.split('//')[1]?.split('/')[0] || 'Social Link'}
												</a>
											</div>
										{/if}
									{/each}
								{/if}
								{#if !(band.instagram?.externalUrls && band.instagram.externalUrls.length > 0) && !band.instagram?.externalUrl && !(band.externalUrlShimmed || band.externalUrl) && !(band.socialUrls && band.socialUrls.filter((su) => su !== band.instagram?.url).length > 0)}
									N/A
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.rowfx {
		transition:
			background-color 200ms ease-in-out,
			color 200ms ease-in-out;
	}
	td > div.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: #4b5563 #1f2937;
	}
	td > div.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	td > div.overflow-y-auto::-webkit-scrollbar-track {
		background: #1f2937;
		border-radius: 3px;
	}
	td > div.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: #4b5563;
		border-radius: 3px;
		border: 1px solid #1f2937;
	}
</style>

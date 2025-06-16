<script>
	import { fade } from 'svelte/transition';
	import { lastClicked, showGigModal, showBandModal } from '$lib/stores/modalStores.js';
	import SoldOut from '$lib/components/ui/SoldOut.svelte';

	import GigCard from '../cards/GigCard.svelte';
	import GIgNumberIndicator from '../ui/GIgNumberIndicator.svelte';

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

{#if activeTab === 'gigs' && gigs && gigs.length > 0}
	<div class="flex justify-center w-full pt-4 bg-black">
		<h2 class="py-3 mb-0 text-4xl font-semibold text-center row font-fancy2">
			Now Showing <GIgNumberIndicator />
		</h2>
	</div>
	<div class="flex flex-col w-screen gap-4 px-4 overflow-x-auto bg-black" in:fade>
		<div class="h-[10px]"></div>

		{#each gigs as gig}
			<div
				on:click={handleGigRowClick(gig)}
				class="rowfx hover:cursor-pointer hover:border-pink-500 border-black border-[1px]"
			>
				<div class="h-[10px]"></div>

				<GigCard {gig} />

				<div class="h-[10px] border-dotted border-b-[0px] border-gray-500"></div>
			</div>
		{/each}
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

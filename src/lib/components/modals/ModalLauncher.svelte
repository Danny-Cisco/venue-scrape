<script>
	import {
		showGigModal,
		lastClicked,
		showBandModal,
		showMapsModal
	} from '$lib/stores/modalStores.js';
	import GigModal from '$lib/components/modals/GigModal.svelte';
	import BandModal from '$lib/components/modals/BandModal.svelte';
	import MapsModal from '$lib/components/modals/MapsModal.svelte';
	import ModalCloseButton from '$lib/components/modals/ModalCloseButton.svelte';
	import { fade, fly } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

	import {
		gigsStore,
		gigsGenreStore,
		gigsStoreFiltered,
		dateRangeStore,
		gigsStoreDateFiltered,
		filteredGigIds,
		clickedGenres
	} from '$lib/stores/gigsStore.js';

	$: $showGigModal = $showGigModal;
	$: console.log('🚀 ~ showGigModal:', $showGigModal);
	$: $lastClicked = $lastClicked;
	$: console.log('🚀 ~ lastClicked:', $lastClicked);
	$: $showBandModal = $showBandModal;
	$: console.log('🚀 ~ showBandModal:', $showBandModal);

	// Function to close all modals
	function closeModals() {
		$showGigModal = false;
		$showBandModal = false;
	}

	// Handle ESC key press
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			closeModals();
		}
	}

	// Add event listener on mount and remove on destroy
	onMount(() => {
		// Only add event listener if we're in the browser
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		// Only remove event listener if we're in the browser
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if $showGigModal && $lastClicked}
	<div
		class="fixed inset-0 top-[100px] flex flex-col isolate w-full items-center justify-center bg-black/80"
		transition:fade={{ duration: 100 }}
	>
		<div class="relative h-full" transition:fly={{ y: 500 }}>
			<GigModal gig={$lastClicked} />
			<!-- close button -->

			<ModalCloseButton />
		</div>
	</div>
{:else if $showBandModal && $lastClicked}
	<div
		class="fixed inset-0 top-[100px] flex flex-col isolate w-full items-center justify-center bg-black/80"
		transition:fade={{ duration: 100 }}
	>
		<div class="relative h-full" transition:fly={{ y: 500 }}>
			<BandModal band={$lastClicked} />

			<!-- close button -->
			<ModalCloseButton />
		</div>
	</div>
{:else if $showMapsModal && $gigsStoreFiltered}
	<div
		class="fixed inset-0 top-[100px] flex flex-col isolate w-full items-center justify-center bg-black/80"
		transition:fade={{ duration: 100 }}
	>
		<div class="relative w-full h-full" transition:fly={{ y: 500 }}>
			<div class="w-full bg-blue h-">
				<MapsModal gigs={$gigsStoreDateFiltered} />
			</div>
			<!-- close button -->
			<div class="absolute top-0 -right-3">
				<ModalCloseButton />
			</div>
		</div>
	</div>
{/if}

<script>
	import { showGigModal, lastClicked, showBandModal } from '$lib/stores/modalStores.js';
	import GigModal from '$lib/components/modals/GigModal.svelte';
	import BandModal from '$lib/components/modals/BandModal.svelte';
	import ModalCloseButton from '$lib/components/modals/ModalCloseButton.svelte';
	import { fade } from 'svelte/transition';

	$: $showGigModal = $showGigModal;
	$: console.log('🚀 ~ showGigModal:', $showGigModal);
	$: $lastClicked = $lastClicked;
	$: console.log('🚀 ~ lastClicked:', $lastClicked);
	$: $showBandModal = $showBandModal;
	$: console.log('🚀 ~ showBandModal:', $showBandModal);
</script>

{#if $showGigModal && $lastClicked}
	<div
		class="fixed inset-0 top-[100px] flex flex-col isolate items-center justify-center bg-black/80"
		transition:fade={{ duration: 100 }}
	>
		<div class="relative h-full">
			<GigModal gig={$lastClicked} />
			<!-- close button -->

			<ModalCloseButton />
		</div>
	</div>
{:else if $showBandModal && $lastClicked}
	<div
		class="fixed inset-0 top-[100px] flex flex-col isolate items-center justify-center bg-black/80"
		transition:fade={{ duration: 100 }}
	>
		<div class="relative h-full">
			<BandModal band={$lastClicked} />

			<!-- close button -->
			<ModalCloseButton />
		</div>
	</div>
{/if}

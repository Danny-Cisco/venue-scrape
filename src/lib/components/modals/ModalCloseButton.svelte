<script>
	import {
		showGigModal,
		showBandModal,
		lastClicked,
		showMapsModal
	} from '$lib/stores/modalStores.js';
</script>

<div
	class="absolute bg-purple-500 rounded-full shadow-xl top-4 size-10 center hover:bg-pink-500 btn-hover left-5"
	on:click={() => {
		$showGigModal = false;
		$showBandModal = false;
		$showMapsModal = false;
		$lastClicked = null;
	}}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="size-8"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
	</svg>
</div>

<style>
	.btn-hover {
		transition: transform 250ms;
	}

	.btn-hover:hover {
		transform: translateY(-2px);
	}
</style>

<script>
	export let showTickets = true;
	import SoldOut from '$lib/components/ui/SoldOut.svelte';
	export let ticket;
</script>

<div class="flex flex-col items-center justify-start p-2 text-black bg-white rounded shadow-lg">
	<!-- <div class="font-serif capitalise">{@html ticket.ticketType}</div> -->
	<div class="w-full font-black text-center">
		{#if ticket.price != 0}
			${ticket.price}
		{:else}
			<div class="font-extralight">Free</div>
		{/if}
	</div>
	<div class="center">
		{#if ticket.availability === 'SoldOut'}
			<SoldOut />
		{:else}
			<div class="w-full text-center text-green-500">{ticket.availability}</div>
		{/if}
	</div>
</div>

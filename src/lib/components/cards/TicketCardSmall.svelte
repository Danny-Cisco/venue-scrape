<script>
	export let showTickets = true;
	import SoldOut from '$lib/components/ui/SoldOut.svelte';
	import { ticketText } from '$lib/utils/tickets.js';
	export let ticket;
	export let xs = false;

	let optionalClass = '';
	let padding = 'p-3';
	let textSize = '';
	let rounded = 'rounded';

	if (xs) {
		optionalClass = 'scale-75';
		padding = 'p-2';
		textSize = 'text-xs';
		rounded = 'rounded-0';
	}
</script>

<div
	class={`relative flex flex-col items-center h-fit px-4 justify-between font-mono text-black bg-white border-black border-dashed ${rounded} shadow-lg hover:shadow-xl hover:mt-[-1px] hover:mb-[1px] ${padding} ${textSize}`}
>
	<!-- <div class="font-serif capitalise">{@html ticket.ticketType}</div> -->
	<div class="flex items-center justify-center w-full -ml-2 font-mono font-black text-center">
		{#if Number(ticket.price != 0)}
			<svg
				viewBox="-0.5 -0.5 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				id="Dollar--Streamline-Iconoir"
				height="24"
				width="24"
				class="py-1 max-h-6"
			>
				<desc> Dollar Streamline Icon: https://streamlinehq.com </desc>
				<path
					d="M10.631375 3.84675C9.916374999999999 3.13175 8.65725 2.6344374999999998 7.5 2.6033125000000004M4.368625 10.631375c0.67275 0.8969375 1.9235 1.4085 3.1313750000000002 1.4519375m0 -9.48c-1.3768749999999998 -0.0370625 -2.6094375 0.5858125000000001 -2.6094375 2.2872500000000002 0 3.1313750000000002 5.7408125 1.5656875000000001 5.7408125 4.6970624999999995 0 1.7859375 -1.5279375000000002 2.5532500000000002 -3.1313750000000002 2.4956875m0 -9.48V0.7153750000000001m0 11.3679375v2.2013125000000002"
					stroke="#000000"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1"
				></path>
			</svg>{Number(ticket.price).toFixed(2)}
		{:else}
			<div class="h-6 ml-2 font-mono font-thin text-gray-600 center">Free</div>
		{/if}
	</div>
	<!-- tint if sold out or ended -->
	{#if ticket.availability.includes('OutOfStock')}
		<div class="absolute inset-0 bg-black/30" />
	{/if}
	{#if ticket.availability === 'SoldOut'}
		<div class="absolute inset-0 border-[3px] border-red-500 border-dashed" />
		<div class="absolute inset-[-2px] border-[2px] border-white rounded" />
	{/if}

	<div class="relative font-mono center">
		{#if ticket.availability === 'SoldOut'}
			<div class={`absolute -bottom-3 ${optionalClass}`}>
				<SoldOut />
			</div>
		{/if}
		{#if ticket.availability.includes('OutOfStock')}
			<div class="w-full text-center text-gray-700">{ticketText(ticket.availability)}</div>
		{:else}
			<div class="w-full font-bold text-center text-green-500">
				{ticketText(ticket.availability)}
			</div>
		{/if}
	</div>
</div>

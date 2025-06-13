<script>
	export let showTickets = true;
	import SoldOut from '$lib/components/ui/SoldOut.svelte';
	export let ticket;
</script>

<div
	class="grid [grid-template-columns:auto_1fr_auto_auto] w-full shadow-lg text-base text-black max-w-full gap-2 bg-white p-4 rounded font-mono"
>
	<!-- Icon for ticket -->
	<div class="rotate-6">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			stroke="1.5"
			class="w-6"
		>
			<path
				d="M2.00488 9.49979V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V9.49979C20.6242 9.49979 19.5049 10.6191 19.5049 11.9998C19.5049 13.3805 20.6242 14.4998 22.0049 14.4998V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V14.4998C3.38559 14.4998 4.50488 13.3805 4.50488 11.9998C4.50488 10.6191 3.38559 9.49979 2.00488 9.49979ZM4.00488 7.96755C5.4866 8.7039 6.50488 10.2329 6.50488 11.9998C6.50488 13.7666 5.4866 15.2957 4.00488 16.032V18.9998H20.0049V16.032C18.5232 15.2957 17.5049 13.7666 17.5049 11.9998C17.5049 10.2329 18.5232 8.7039 20.0049 7.96755V4.99979H4.00488V7.96755ZM9.00488 8.99979H15.0049V10.9998H9.00488V8.99979ZM9.00488 12.9998H15.0049V14.9998H9.00488V12.9998Z"
			></path>
		</svg>
	</div>

	<!-- Ticket type -->
	<div class="font-serif font-thin">{@html ticket.ticketType}</div>

	<!-- Ticket price -->
	<div class="flex items-center mr-2 font-black">
		{#if ticket.price != 0}
			<svg
				viewBox="-0.5 -0.5 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				id="Dollar--Streamline-Iconoir"
				height="20"
				width="20"
			>
				<desc> Dollar Streamline Icon: https://streamlinehq.com </desc>
				<path
					d="M10.631375 3.84675C9.916374999999999 3.13175 8.65725 2.6344374999999998 7.5 2.6033125000000004M4.368625 10.631375c0.67275 0.8969375 1.9235 1.4085 3.1313750000000002 1.4519375m0 -9.48c-1.3768749999999998 -0.0370625 -2.6094375 0.5858125000000001 -2.6094375 2.2872500000000002 0 3.1313750000000002 5.7408125 1.5656875000000001 5.7408125 4.6970624999999995 0 1.7859375 -1.5279375000000002 2.5532500000000002 -3.1313750000000002 2.4956875m0 -9.48V0.7153750000000001m0 11.3679375v2.2013125000000002"
					stroke="#000000"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1"
				></path>
			</svg>
			{ticket.price}
		{:else}
			<span class="text-gray-600 font-thin">Free</span>
		{/if}
	</div>
	<div class="relative font-mono font-thin">
		<!-- Ticket availability -->
		{#if ticket.availability === 'SoldOut'}
			<div class="absolute inset-0 center">
				<SoldOut />
			</div>
		{/if}<span class="text-green-500">{ticket.availability}</span>
	</div>
</div>

<script>
	export let showTickets = true;
	import SoldOut from '$lib/components/ui/SoldOut.svelte';
	export let ticket;
</script>

<div
	class="relative flex flex-col items-center justify-start p-4 font-mono text-black bg-white rounded shadow-lg"
>
	<!-- FANCY SHADOW CURLS -->
	<div>
		<div
			class="absolute top-0 left-0 w-4 h-4 bg-gradient-to-br from-black/10 via-transparent to-transparent"
		></div>
		<!-- <div
			class="absolute bottom-0 left-0 w-4 h-8 bg-gradient-to-tr from-black/10 via-transparent to-transparent"
		></div> -->
	</div>

	<!-- <div class="font-serif capitalise">{@html ticket.ticketType}</div> -->
	<div class="flex items-center justify-center w-full -ml-2 font-mono font-black text-center">
		{#if ticket.price != 0}
			<svg
				viewBox="-0.5 -0.5 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				id="Dollar--Streamline-Iconoir"
				height="24"
				width="24"
			>
				<desc> Dollar Streamline Icon: https://streamlinehq.com </desc>
				<path
					d="M10.631375 3.84675C9.916374999999999 3.13175 8.65725 2.6344374999999998 7.5 2.6033125000000004M4.368625 10.631375c0.67275 0.8969375 1.9235 1.4085 3.1313750000000002 1.4519375m0 -9.48c-1.3768749999999998 -0.0370625 -2.6094375 0.5858125000000001 -2.6094375 2.2872500000000002 0 3.1313750000000002 5.7408125 1.5656875000000001 5.7408125 4.6970624999999995 0 1.7859375 -1.5279375000000002 2.5532500000000002 -3.1313750000000002 2.4956875m0 -9.48V0.7153750000000001m0 11.3679375v2.2013125000000002"
					stroke="#000000"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1"
				></path>
			</svg>{ticket.price}
		{:else}
			<div class="ml-2 font-mono text-gray-600 font-extralight">Free</div>
		{/if}
	</div>
	<div class="relative font-mono center">
		{#if ticket.availability === 'SoldOut'}
			<div class="absolute top-0">
				<SoldOut />
			</div>
		{/if}
		<div class="w-full text-center text-green-500">{ticket.availability}</div>
	</div>
</div>

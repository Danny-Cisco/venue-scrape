<script>
	import { fade, fly } from 'svelte/transition';
	export let gig = {};

	import GigDescriptionSection from '../ui/GigDescriptionSection.svelte';
	import DateTextMinimal from '$lib/components/ui/DateTextMinimal.svelte';
	import StarRatingBarColor from '../ui/StarRatingBarColor.svelte';
	import BandCard from '../cards/BandCard.svelte';
	import TicketCardLong from '../cards/TicketCardLong.svelte';

	import TicketCardSmall from '../cards/TicketCardSmall.svelte';

	function scrollToTickets() {
		const el = document.getElementById('ticket-lower');
		if (el) el.scrollIntoView({ behavior: 'smooth' });
	}

	function moshtix140to600image(url) {
		if (typeof url !== 'string') return url;

		const isMoshtix = url.includes('moshtix') && url.includes('x140x140');

		if (isMoshtix) {
			return url.replace('x140x140', 'x600x600');
		}

		return url;
	}
</script>

<div class="min-w-full overflow-y-auto gig-card">
	<!-- Top Summary Section -->
	<div class="w-[1100px] gig-details">
		<!-- Gig Title -->
		<h2
			class="px-5 py-3 mb-1 font-sans text-4xl font-black text-white uppercase bg-black shadow-xl"
		>
			{@html gig.title}
			<!-- Venue -->
			{#if gig.venue}
				<div class="mt-3 font-sans text-3xl font-extrabold text-gray-700 row">
					<a href={gig.venue.website}>
						<div class="uppercase row whitespace-nowrap hover:cursor-pointer hover:underline">
							<span>@ {gig.venue.name}</span>
						</div>
					</a>
					<div class="ml-2 font-sans text-gray-400 font-extralight">
						{gig.venue.suburb === 'Melbourne' ? 'Melbourne, City' : gig.venue.suburb}
					</div>
				</div>
			{/if}
		</h2>

		<div class="grid items-stretch grid-cols-2">
			<!-- left hand side -->
			<div class="flex flex-col justify-between">
				<ul class="flex flex-col mt-2 mb-4 ml-4 font-sans font-black text-black">
					<!-- <p class="">Featuring...</p> -->
					<ul class="my-1">
						{#each gig.bandObjects as bandObject, i}
							{#if i == 0}
								<li class="ml-2 text-2xl row">
									{bandObject.bandname}
									<StarRatingBarColor {bandObject} />
								</li>
							{:else}
								<li class="ml-2 row">{bandObject.bandname} <StarRatingBarColor {bandObject} /></li>
							{/if}
						{/each}
					</ul>
				</ul>
				<div class="flex-grow"></div>

				<div class="flex flex-col">
					<!-- Date + Time -->
					<div class="flex">
						<div
							class="px-4 py-2 text-xl text-black bg-white border border-black rounded-sm font-regular"
						>
							<DateTextMinimal date={gig.startDate} />
						</div>
					</div>
				</div>
			</div>

			<!-- right hand side -->
			<div class="flex flex-col justify-end gap-4 mt-1">
				<!-- TICKET SECTION UPPER-->
				<div class="flex justify-end gap-1 hover:cursor-pointer" on:click={scrollToTickets}>
					{#each gig.tickets as ticket}
						<TicketCardSmall {ticket} />
					{/each}
				</div>

				<div class="flex-1"></div>

				<!-- Genres -->
				<div class="flex items-end justify-end w-full gap-2">
					{#each gig.genres as genre}
						<div
							class="px-6 py-2 bg-white shadow-xl whitespace-nowrap border-[1px] border-black text-2xl text-black border-dashed rounded-full"
						>
							{genre}
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Cards Section -->
		<div class="relative flex items-start w-full mt-4 bg-black">
			<!-- 🎨 Poster -->
			{#if gig.image}
				<img
					src={moshtix140to600image(gig.image)}
					alt={gig.title}
					class="object-cover border-4 border-black w-[600px] h-[600px]"
				/>
			{/if}

			<!-- 📝 Details -->
			<div class="flex flex-col flex-1 w-full min-h-full">
				<!-- <div class="flex-1"></div> -->

				<!-- BANDS SECTION -->
				<div class="flex flex-col w-full overflow-hidden bg-black border-l-0 border-black">
					{#if gig.bandObjects?.length > 0}
						<h2
							class="justify-center w-full pt-2 font-sans text-2xl font-black text-center text-white row"
						>
							<span class="font-mono border-[1px] border-white rounded-full px-4"
								>{gig.bandObjects.length}</span
							>

							LIVE ACT{#if gig.bandObjects.length != 1}S{/if}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
								/>
							</svg>
						</h2>
						<div
							class="flex flex-col items-center flex-1 w-full pb-10 space-y-4 overflow-hidden overflow-y-auto"
						>
							{#each gig.bandObjects as bandObject (bandObject.bandname)}
								<!-- BAND CARD SECTION -->
								<BandCard {bandObject} />
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
		<GigDescriptionSection {gig} />

		{#if gig.tickets && gig.tickets.length > 0}
			<!-- TICKETS SECTION LOWER-->
			<div
				id="ticket-lower"
				class="flex flex-col w-full max-w-full gap-1 p-5 font-sans text-2xl font-black text-white bg-black rounded-sm"
				in:fade
			>
				<div class="flex justify-between w-full">
					<h1 class="row">
						TICKETS INFO <span class="rotate-6"
							><svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								stroke="1.5"
								class="w-6"
							>
								<path
									d="M2.00488 9.49979V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V9.49979C20.6242 9.49979 19.5049 10.6191 19.5049 11.9998C19.5049 13.3805 20.6242 14.4998 22.0049 14.4998V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V14.4998C3.38559 14.4998 4.50488 13.3805 4.50488 11.9998C4.50488 10.6191 3.38559 9.49979 2.00488 9.49979ZM4.00488 7.96755C5.4866 8.7039 6.50488 10.2329 6.50488 11.9998C6.50488 13.7666 5.4866 15.2957 4.00488 16.032V18.9998H20.0049V16.032C18.5232 15.2957 17.5049 13.7666 17.5049 11.9998C17.5049 10.2329 18.5232 8.7039 20.0049 7.96755V4.99979H4.00488V7.96755ZM9.00488 8.99979H15.0049V10.9998H9.00488V8.99979ZM9.00488 12.9998H15.0049V14.9998H9.00488V12.9998Z"
								></path>
							</svg></span
						>
					</h1>
					<h2 class="text-lg font-bold text-black uppercase row">
						<!-- 🎟️ Tickets Link -->
						{#if gig.ticketUrl && gig.ticketUrl !== '#'}
							<a
								href={gig.ticketUrl}
								target="_blank"
								class="justify-end w-full mr-2 row gig-ticket-button hover:underline"
							>
								Visit Ticketing Site
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
									/>
								</svg>
							</a>
						{:else}
							<p class="gig-ticket-free">Free Entry</p>
						{/if}
					</h2>
				</div>
				<div class="space-y-4">
					{#each gig.tickets as ticket}
						<TicketCardLong {ticket} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.gig-card {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: 1rem;
		background-color: white;

		max-width: 1200px;

		padding: 2rem;
		height: 100%;
	}

	.gig-image {
		width: 100%;
		max-width: 300px;
		height: auto;
		border-radius: 0.5rem;
		object-fit: cover;
	}

	.gig-details {
		display: flex;
		flex-direction: column;
	}

	.gig-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #222;
	}

	.gig-datetime {
		font-size: 1rem;
		color: #444;
	}

	.gig-description {
		white-space: pre-wrap;
		font-size: 1rem;
		color: #333;
		line-height: 1.5;
	}

	.gig-ticket-free {
		color: green;
		font-weight: bold;
		margin-top: 1rem;
	}
</style>

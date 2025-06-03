<script>
	import SoldOut from '$lib/components/ui/SoldOut.svelte';
	import { getWeekday, getDay, getMonth, getYear, getTime, getTimeZone } from '$lib/utils/date.ts';
	export let gig = {};

	function openBandModal(band) {
		console.log('band clicked 👉 ', band);
	}
</script>

<div class="overflow-y-auto gig-card">
	<div class="w-full gig-details">
		<!-- Genres -->
		<div class="block mt-1">
			<div class="row">
				{#each gig.genres as genre}
					<div class="px-3 py-1 bg-white border-[1px] border-black text-black rounded-full">
						{genre}
					</div>
				{/each}
			</div>
		</div>

		<div class="flex items-start w-full gap-4 py-4 border-b border-gray-300">
			<!-- 🎨 Poster -->
			{#if gig.image}
				<img src={gig.image} alt={gig.title} class="object-cover w-32 h-32 rounded" />
			{/if}

			<!-- 📝 Details -->
			<div class="flex flex-col flex-1 min-h-full">
				<!-- Gig Title -->
				<h2 class="text-2xl font-bold text-black">{gig.title}</h2>
				<div class="flex-1"></div>
				<!-- Date + Time -->
				<p class="text-lg font-semibold text-black">
					{getTime(gig.startDate)}, {getWeekday(gig.startDate)}
					{getDay(gig.startDate)}
					{getMonth(gig.startDate)}, {getYear(gig.startDate)}
				</p>

				<!-- Venue -->
				{#if gig.venue}
					<p class="mt-1 font-bold text-gray-700 text-md">
						<u>{gig.venue.name}</u>,
						{#if gig.ticketUrl && gig.ticketUrl !== '#'}
							<a href={gig.ticketUrl} target="_blank" class="gig-ticket-button"
								>Visit Ticketing Site</a
							>
						{:else}
							<p class="gig-ticket-free">Free Entry</p>
						{/if}
					</p>
				{/if}
			</div>
		</div>
		<!-- 🎟️ Tickets Section -->
		{#if gig.tickets && gig.tickets.length > 0}
			<div class="flex flex-col max-w-full gap-2 p-2 bg-black">
				{#each gig.tickets as ticket}
					<div
						class="grid [grid-template-columns:3fr_1fr_1fr] w-full max-w-full gap-2 border p-2 rounded"
					>
						<div>{ticket.ticketType}</div>
						<div>${ticket.price}</div>
						{#if ticket.availability === 'SoldOut'}
							<SoldOut />
						{:else}
							<span>{ticket.availability}</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<h3 class="mt-4 mb-0 font-bold text-black uppercase">Bands</h3>
		<div class="flex flex-col items-start max-w-full text-blue-500 hover:cursor-pointer">
			{#each gig.bandObjects as bandObject}
				<button on:click={openBandModal(bandObject.bandname)}
					>{bandObject.bandname} - {(bandObject.instagram?.followersCount / 1000).toFixed(
						1
					)}k</button
				>
			{/each}
		</div>
		<h3 class="mt-4 mb-0 font-bold text-black uppercase">Description</h3>

		<p class="gig-description">{gig.description}</p>
	</div>
</div>

<style>
	.gig-card {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: 1rem;
		background-color: #fff;

		max-width: 900px;

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
		gap: 0.75rem;
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

<script>
	import SoldOut from '$lib/components/ui/SoldOut.svelte';
	import { getWeekday, getDay, getMonth, getYear, getTime, getTimeZone } from '$lib/utils/date.ts';
	export let gig = {};

	import { marked } from 'marked';

	import { onMount } from 'svelte';

	import { htmlFormatter } from '$lib/utils/prompts.ts';

	export let showDescription = false;

	let question = gig.description;
	let systemPrompt = htmlFormatter;

	let formatting = false;

	let htmlDescription;
	onMount(async () => {
		if (!gig.descriptionHtml) htmlDescription = await formatText();
	});

	async function formatText() {
		formatting = true;
		const parsedBody = JSON.stringify({ question, systemPrompt });

		const response = await fetch('/api/openai/qabot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: parsedBody
		});

		const data = await response.json();
		console.log('🚀 ~ formatText ~ data:', data);
		formatting = false;
		return data.answer;
	}

	function openBandModal(band) {
		console.log('band clicked 👉 ', band);
	}
</script>

<div class="overflow-y-auto gig-card">
	<div class="w-full gig-details">
		<!-- Genres -->
		<div class="block mt-1">
			<div class="justify-end w-full row">
				{#each gig.genres as genre}
					<div class="px-3 py-1 bg-white border-[1px] border-black text-black rounded-full">
						{genre}
					</div>
				{/each}
			</div>
		</div>

		<div class="relative flex items-start w-full gap-4 py-4">
			<!-- 🎨 Poster -->
			{#if gig.image}
				<img src={gig.image} alt={gig.title} class="object-cover w-32 h-32 rounded" />
			{/if}

			<!-- 📝 Details -->
			<div class="flex flex-col flex-1 min-h-full">
				<!-- Gig Title -->
				<h2 class="text-2xl font-bold text-black">{@html gig.title}</h2>
				<div class="flex-1"></div>
				<!-- Date + Time -->
				<p class="text-lg font-semibold text-black">
					{getTime(gig.startDate)}, {getWeekday(gig.startDate)}
					{getDay(gig.startDate)}
					{getMonth(gig.startDate)}, {getYear(gig.startDate)}
				</p>

				<!-- Venue -->
				{#if gig.venue}
					<p class="mt-1 text-xl font-bold text-gray-700">
						<u>{gig.venue.name}</u>,
					</p>
				{/if}

				<!-- Ticket Url -->
				{#if gig.ticketUrl && gig.ticketUrl !== '#'}
					<a
						href={gig.ticketUrl}
						target="_blank"
						class="absolute right-0 bottom-2 row gig-ticket-button"
						>Ticketing Site <svg
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
								d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
							/>
						</svg>
					</a>
				{:else}
					<p class="gig-ticket-free">Free Entry</p>
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

		<h3 class="mt-4 mb-0 text-lg font-bold text-black uppercase">Bands</h3>
		<div class="flex flex-col items-start max-w-full mb-4 ml-8 text-blue-500 hover:cursor-pointer">
			{#each gig.bandObjects as bandObject}
				<button class="w-full row" on:click={openBandModal(bandObject.bandname)}
					><div class="w-2 h-2 bg-blue-500 rounded-full"></div>
					<span class="font-bold capitalize whitespace-nowrap">{bandObject.bandname} </span>-
					<a href={bandObject.instagram?.url}>@{bandObject.instagram?.username}</a>{(
						bandObject.instagram?.followersCount / 1000
					).toFixed(1)}k</button
				>
			{/each}
		</div>
		<!-- <h3 class="mt-4 mb-0 text-lg font-bold text-black uppercase">Description</h3> -->
		{#if htmlDescription}
			<div class="text-black">{@html htmlDescription}</div>
		{:else}{#if formatting}
				<div class="text-xs text-gray-500">A nice, formatted description is on it's way...</div>
			{/if}
			<div class="text-black elipsis">{gig.descriptionHtml || gig.description}</div>
		{/if}
	</div>
</div>

<style>
	:global(p) {
		margin-bottom: 1rem;
	}

	:global(h1) {
		font-size: 1.5rem;
		font-weight: bold;
	}

	:global(.footer-class) {
		font-size: 0.5rem;
	}
	:global(.additional-info-class) {
		font-size: 0.5rem;
	}
	.gig-card {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: 1rem;
		background-color: white;

		max-width: 900px;
		width: auto;

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

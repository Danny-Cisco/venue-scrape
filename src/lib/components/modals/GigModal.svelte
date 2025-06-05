<script>
	import SoldOut from '$lib/components/ui/SoldOut.svelte';
	import { fade } from 'svelte/transition';
	import { getWeekday, getDay, getMonth, getYear, getTime, getTimeZone } from '$lib/utils/date.ts';
	export let gig = {};

	import { marked } from 'marked';

	import { getStarCount } from '$lib/utils/stars.js';

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
			<div class="justify-center w-full row">
				{#each gig.genres as genre}
					<div
						class="px-6 py-2 bg-white border-[1px] border-black text-3xl text-black border-dashed rounded-full"
					>
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
						class="absolute text-xs right-6 bottom-2 row gig-ticket-button"
						>Tickets <svg
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
			</div>
		</div>
		<!-- 🎟️ Tickets Section -->
		{#if gig.tickets && gig.tickets.length > 0}
			<div class="flex flex-col w-full max-w-full gap-1 p-2 text-xs text-black rounded-lg">
				{#each gig.tickets as ticket}
					<div
						class="grid [grid-template-columns:auto_1fr_auto_auto] w-full max-w-full gap-2 bg-white border-gray-300 border border-dashed p-4 rounded"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="1.5"
							class="w-4"
							><path
								d="M2.00488 9.49979V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V9.49979C20.6242 9.49979 19.5049 10.6191 19.5049 11.9998C19.5049 13.3805 20.6242 14.4998 22.0049 14.4998V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V14.4998C3.38559 14.4998 4.50488 13.3805 4.50488 11.9998C4.50488 10.6191 3.38559 9.49979 2.00488 9.49979ZM4.00488 7.96755C5.4866 8.7039 6.50488 10.2329 6.50488 11.9998C6.50488 13.7666 5.4866 15.2957 4.00488 16.032V18.9998H20.0049V16.032C18.5232 15.2957 17.5049 13.7666 17.5049 11.9998C17.5049 10.2329 18.5232 8.7039 20.0049 7.96755V4.99979H4.00488V7.96755ZM9.00488 8.99979H15.0049V10.9998H9.00488V8.99979ZM9.00488 12.9998H15.0049V14.9998H9.00488V12.9998Z"
							></path></svg
						>
						<div class="font-serif capitalise">{ticket.ticketType}</div>
						<div class="mr-4">
							{#if ticket.price != 0}${ticket.price}
							{:else}
								<div class="text-gray-300">Free</div>{/if}
						</div>
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
		<div class="flex flex-col items-start max-w-full mx-4 mb-4 text-blue-500 hover:cursor-pointer">
			{#each gig.bandObjects as bandObject}
				<button
					class="grid w-full grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-2 text-left px-2 py-1 rounded"
					on:click={openBandModal(bandObject.bandname)}
				>
					<!-- 🔵 Dot -->
					<div class="w-2 h-2 bg-blue-500 rounded-full"></div>

					<!-- 🎸 Band Name & IG -->
					<div class="">
						<span class="font-bold capitalize">{bandObject.bandname}</span>
					</div>

					<div>
						{#if bandObject.instagram}
							<a href={bandObject.instagram?.url} class="text-sm text-blue-600"
								>@{bandObject.instagram?.username || bandObject.instagram}
								<!-- 📊 Followers -->
								<span class="text-sm font-bold text-blue-600 whitespace-nowrap">
									- {(bandObject.instagram?.followersCount / 1000).toFixed(1)}k
								</span></a
							>
						{:else}
							no instagram account
						{/if}
					</div>

					<!-- ⭐ Star Rating -->
					<div class="flex ml-1">
						{#each Array(5) as _, i}
							{#if i < getStarCount(bandObject.instagram?.followersCount)}
								<!-- Filled -->
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="#FACC15"
									stroke="#FA9910"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class="size-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
									/>
								</svg>
							{:else}
								<!-- Outline -->
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="#FAeeaa"
									stroke-width="1.5"
									class="size-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
									/>
								</svg>
							{/if}
						{/each}
					</div>

					<!-- 🌐 External Link -->
					<a href={bandObject.instagram?.externalUrl} class="ml-1 text-xs text-green-500 row">
						Linktree
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
				</button>
			{/each}
		</div>
		<!-- <h3 class="mt-4 mb-0 text-lg font-bold text-black uppercase">Description</h3> -->
		{#if htmlDescription}
			<div class="p-4 text-black rounded-lg description" in:fade>
				{@html htmlDescription}
			</div>
		{:else}{#if formatting}
				<div class="relative overflow-hidden text-xs text-gray-500">
					<span
						class="wave-mask bg-gradient-to-r from-gray-400 via-gray-900 to-gray-400 bg-[length:200%_100%] bg-clip-text text-transparent"
					>
						A nice, formatted description is on its way...
					</span>
				</div>
			{/if}
			<div class="p-4 text-black rounded-lg">
				<p class={showDescription ? '' : 'line-clamp-3'}>
					{@html gig.descriptionHtml || gig.description}
				</p>

				<!-- Toggle button -->
				<button
					class="mt-2 text-sm text-blue-600 hover:underline"
					on:click={() => (showDescription = !showDescription)}
				>
					{showDescription ? 'Show less ▲' : 'Show more ▼'}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.wave-mask {
		animation: waveMove 2.5s linear infinite;
	}

	@keyframes waveMove {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
	:global(.description p) {
		margin-bottom: 1rem;
		margin-top: 1rem;
	}

	:global(.description h1) {
		font-size: 1.8rem;
		font-weight: bold;
		padding-bottom: 1rem;
	}

	:global(.description h2) {
		font-size: 1.3rem;
		font-weight: bold;
		padding-top: 1rem;
	}

	:global(.description h3) {
		font-size: 1.3rem;
		font-weight: bold;
		padding-top: 1rem;
	}

	:global(.description ul) {
		margin-left: 1.5rem;
		list-style-type: disc;
		margin-bottom: 1rem;
	}

	:global(.description li) {
		margin-bottom: 0.5rem;
	}

	:global(.description strong) {
		font-weight: bold;
	}

	:global(.description .footer-class) {
		font-size: 0.5rem;
	}

	:global(.description .info-class) {
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

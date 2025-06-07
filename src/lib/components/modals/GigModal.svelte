<script>
	import SoldOut from '$lib/components/ui/SoldOut.svelte';
	import { fade, fly } from 'svelte/transition';
	export let gig = {};

	import { marked } from 'marked';

	import { weserv, imgHaste, photon } from '$lib/utils/image.js';

	import RetryingImage from '$lib/components/ui/RetryingImage.svelte';

	import DateTextMinimal from '$lib/components/ui/DateTextMinimal.svelte';
	import StarRatingBarColor from '../ui/StarRatingBarColor.svelte';

	import { onMount } from 'svelte';

	import { htmlFormatter } from '$lib/utils/prompts.ts';

	export let showDescription = false;
	export let showTickets = true;

	let question = gig.description;
	let systemPrompt = htmlFormatter;

	let formatting = false;

	function moshtix140to600image(url) {
		if (typeof url !== 'string') return url;

		const isMoshtix = url.includes('moshtix') && url.includes('x140x140');

		if (isMoshtix) {
			return url.replace('x140x140', 'x600x600');
		}

		return url;
	}

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

<div class="w-full overflow-y-auto gig-card">
	<!-- Top Summary Section -->
	<div class="w-full gig-details">
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

		<div class="grid grid-cols-2">
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
			<!-- Genres -->
			<div class="flex justify-end w-full mt-1">
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
					class="object-cover w-[600px] h-[600px]"
				/>
			{/if}

			<!-- 📝 Details -->
			<div class="flex flex-col flex-1 w-full min-h-full">
				<!-- <div class="flex-1"></div> -->

				<!-- BANDS SECTION -->
				<div class="flex flex-col w-full overflow-hidden bg-black border-l-0 border-black">
					<h2 class="w-full pt-1 font-sans text-2xl font-black text-center text-white">
						<span class="font-mono">{gig.bandObjects.length}</span> LIVE ACTS
					</h2>
					<div
						class="flex flex-col items-center flex-1 w-full pb-10 space-y-4 overflow-hidden overflow-y-auto"
					>
						{#each gig.bandObjects as bandObject (bandObject.bandname)}
							<!-- Card container - this is the main change -->
							<button
								class="w-full max-w-md p-3 mx-4 text-gray-800 transition-shadow duration-300 ease-in-out bg-white rounded-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
								on:click={() => openBandModal(bandObject.bandname)}
							>
								<div class="flex min-w-full">
									<!-- Instagram Profile Picture via Weserv -->
									<div
										class="bg-gradient-to-br from-gray-500/5 gap-4 to-black/5 center font-sans text-xs text-gray-400 font-extralight min-w-[150px] max-w-[150px] rounded-sm overflow-hidden min-h-[150px] max-h-[150px]"
									>
										{#if bandObject.instagram?.profilePicUrl}
											<img
												src={weserv(bandObject.instagram.profilePicUrl)}
												alt="_profile pic"
												fallback="/fallback-avatar.png"
											/>
										{/if}
									</div>
									<div class="flex flex-col w-full ml-4">
										<!-- Top section: Dot and Band Name -->
										<div class="">
											<!-- <div class="w-3 h-3 mr-3 bg-blue-500 rounded-full shrink-0"></div> -->
											<h2
												class="mb-0 font-sans text-2xl font-black text-black capitalize text-start"
											>
												{bandObject.bandname}
											</h2>
											{#if bandObject.instagram}
												<p>
													<a
														href={bandObject.instagram?.url}
														target="_blank"
														rel="noopener noreferrer"
														class="flex text-xs text-gray-400 font-extralight hover:underline"
														on:click|stopPropagation
														>@{bandObject.instagram?.username || bandObject.instagram}
													</a>
												</p>
											{/if}
										</div>
										<!-- Star Rating -->
										<div class="flex mt-3 mb-3">
											<StarRatingBarColor {bandObject} />
										</div>

										<!-- <div class="flex-1"></div> -->

										<!-- Instagram Info Section -->
										<div class="grid w-full h-full grid-cols-2">
											<div>
												{#if bandObject.instagram}
													<div class="flex flex-col items-start space-y-1">
														{#if bandObject.instagram.followersCount}
															<div class="flex gap-2 text-sm text-blue-500">
																{(bandObject.instagram.followersCount / 1000).toFixed(1)}k
																<div class="font-sans text-sm font-bold">Followers</div>
															</div>
														{/if}
														{#if bandObject.instagram.postsCount}
															<div class="flex gap-2 text-sm text-blue-500">
																{bandObject.instagram.postsCount}
																<div class="font-sans text-sm font-bold">Posts</div>
															</div>
														{/if}
													</div>
												{:else}
													<div class="text-xs italic text-gray-500">No Instagram profile</div>
												{/if}
											</div>
											<!-- links section -->

											{#if bandObject.instagram}
												<div
													class="flex flex-col items-end h-full pt-3 mt-auto space-y-1 border-t-0 border-gray-200"
												>
													<div class="flex-1"></div>
													<div class="">
														<!-- InstagramLink -->

														<a
															href={bandObject.instagram.url}
															target="_blank"
															rel="noopener noreferrer"
															class="flex text-xs text-blue-600 row hover:underline"
															on:click|stopPropagation
															>Instagram
															<svg
																xmlns="http://www.w3.org/2000/svg"
																fill="none"
																viewBox="0 0 24 24"
																stroke-width="1.5"
																stroke="currentColor"
																class="ml-1 size-4"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
																/>
															</svg></a
														>
													</div>
													<!-- External Link -->
													{#if bandObject.instagram.externalUrl}
														<a
															href={bandObject.instagram.externalUrl}
															target="_blank"
															rel="noopener noreferrer"
															class="flex items-center text-xs text-green-600 row hover:text-green-700"
															on:click|stopPropagation
														>
															Linktree <svg
																xmlns="http://www.w3.org/2000/svg"
																fill="none"
																viewBox="0 0 24 24"
																stroke-width="1.5"
																stroke="currentColor"
																class="ml-1 size-4"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
																/>
															</svg>
														</a>
													{/if}
												</div>
											{/if}
										</div>
									</div>
								</div>
								<!-- Biography section -->
								<div>
									<p class=" font-sans min-h-[3.5rem] pt-2 text-sm text-left text-black">
										{bandObject.instagram?.biography || ''}
									</p>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
		<!-- 🎟️ Tickets Section -->
		{#if gig.tickets && gig.tickets.length > 0}
			<h2 class="text-lg font-bold text-black uppercase row">
				<!-- Ticket Url -->
				{#if gig.ticketUrl && gig.ticketUrl !== '#'}
					<a
						href={gig.ticketUrl}
						target="_blank"
						class="justify-end w-full mr-6 text-xs row gig-ticket-button"
					>
						Ticket Site
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

			<div class="flex flex-col w-full max-w-full gap-1 p-2 text-xs text-black rounded-lg" in:fade>
				{#each gig.tickets as ticket, i}
					<div
						in:fly={{ y: 10, duration: 300, delay: i * 70 }}
						class="grid [grid-template-columns:auto_1fr_auto_auto] w-full shadow-lg max-w-full gap-2 bg-white border-gray-300 border border-dashed p-4 rounded"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="1.5"
							class="w-4"
						>
							<path
								d="M2.00488 9.49979V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V9.49979C20.6242 9.49979 19.5049 10.6191 19.5049 11.9998C19.5049 13.3805 20.6242 14.4998 22.0049 14.4998V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V14.4998C3.38559 14.4998 4.50488 13.3805 4.50488 11.9998C4.50488 10.6191 3.38559 9.49979 2.00488 9.49979ZM4.00488 7.96755C5.4866 8.7039 6.50488 10.2329 6.50488 11.9998C6.50488 13.7666 5.4866 15.2957 4.00488 16.032V18.9998H20.0049V16.032C18.5232 15.2957 17.5049 13.7666 17.5049 11.9998C17.5049 10.2329 18.5232 8.7039 20.0049 7.96755V4.99979H4.00488V7.96755ZM9.00488 8.99979H15.0049V10.9998H9.00488V8.99979ZM9.00488 12.9998H15.0049V14.9998H9.00488V12.9998Z"
							></path>
						</svg>
						<div class="font-serif capitalise">{@html ticket.ticketType}</div>
						<div class="mr-4">
							{#if ticket.price != 0}
								${ticket.price}
							{:else}
								<div class="text-gray-300">Free</div>
							{/if}
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

		<!-- <h3 class="mt-4 mb-0 text-lg font-bold text-black uppercase">Description</h3> -->
		<div class="">
			{#if htmlDescription}
				<div class="min-w-full p-4 text-black rounded-lg description" in:fade>
					{@html htmlDescription}
				</div>
			{:else}{#if formatting}
					<div class="relative overflow-hidden text-xs text-gray-500">
						<span
							class=" wave-mask bg-gradient-to-r from-gray-400 via-gray-900 to-gray-400 bg-[length:200%_100%] bg-clip-text text-transparent"
						>
							A nice, formatted description is on its way...
						</span>
					</div>
				{/if}
				<div class="max-w-full p-4 text-black rounded-lg">
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

		max-width: 1200px;
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

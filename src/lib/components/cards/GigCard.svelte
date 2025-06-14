<script>
	import { fade, fly } from 'svelte/transition';
	export let gig = {};

	import GigDescriptionSection from '../ui/GigDescriptionSection.svelte';
	import DateTextMinimal from '$lib/components/ui/DateTextMinimal.svelte';
	import StarRatingBarColor from '../ui/StarRatingBarColor.svelte';
	import BandCard from './BandCard.svelte';
	import TicketCardLong from './TicketCardLong.svelte';

	import TicketCardSmall from './TicketCardSmall.svelte';

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

<div class="flex flex-col max-w-[1200px] w-full mx-auto">
	<div class="flex justify-between">
		<!-- Date + Time -->
		<div class="flex">
			<div
				class="px-2 py-1 text-base text-white border border-black rounded-sm whitespace-nowrap font-regular"
			>
				<DateTextMinimal date={gig.startDate} />
			</div>
		</div>
	</div>

	<div class="grid bg-black w-full pl-1 grid-cols-[auto_1fr_auto]">
		<!-- Image Section -->
		<div class="">
			<!-- 🎨 Poster -->
			{#if gig.image}
				<img
					src={moshtix140to600image(gig.image)}
					alt={gig.title}
					class="object-cover border-4 border-black w-[200px] h-[200px]"
				/>
			{:else}
				<img
					src="/noun-group.png"
					alt=""
					class="border-4 bg-white opacity-50 border-black pt-4 w-[200px] h-[200px]"
				/>
			{/if}
		</div>
		<!--  Text Section -->
		<div class="bg-gray-100 border-[4px] border-black">
			<!-- Gig Title -->
			<h2
				class="relative px-3 py-0 mb-0 font-sans text-2xl font-semibold text-white bg-black shadow-xl"
			>
				{@html gig.title}

				<!-- Venue -->
				{#if gig.venue}
					<div class="mt-0 text-xl font-extrabold text-gray-700 font-body row">
						<a href={gig.venue.website}>
							<div
								class="uppercase row whitespace-nowrap hover:cursor-pointer hover:text-pink-500 hover:underline"
							>
								<span>@ {gig.venue.name}</span>
							</div>
						</a>
						<div class="ml-2 font-thin text-gray-400 font-body">
							{gig.venue.suburb === 'Melbourne' ? 'Melbourne, City' : gig.venue.suburb}
						</div>
					</div>
				{/if}
			</h2>

			<div class="grid items-stretch grid-cols-[auto_1fr]">
				<!-- left section -->
				<div class="flex flex-col justify-between">
					<ul class="flex flex-col mb-4 ml-4 font-sans font-black text-black">
						<!-- <p class="">Featuring...</p> -->
						<ul class="my-1">
							{#if gig.bandObjects}
								{#each gig.bandObjects as bandObject, i}
									{#if i == 0}
										<li class="ml-2 text-sm row">
											{bandObject.bandname}
											<StarRatingBarColor {bandObject} small={true} />
										</li>
									{:else}
										<li class="ml-2 text-xs row">
											{bandObject.bandname}
											<StarRatingBarColor {bandObject} small={true} />
										</li>
									{/if}
								{/each}
							{/if}
						</ul>
					</ul>
					<div class="flex-grow"></div>
				</div>

				<!-- middle hand side -->
				<div class="flex flex-col items-end justify-end mt-1">
					<!-- TICKET SECTION UPPER-->
					<div
						class="flex flex-wrap max-w-[350px] justify-end gap-1 mr-4 hover:cursor-pointer"
						on:click={scrollToTickets}
					>
						{#each gig.tickets as ticket}
							<TicketCardSmall {ticket} />
						{/each}
					</div>

					<div class="flex-1"></div>
				</div>
			</div>
		</div>
		<!-- right section -->
		<div class="bg-black w-[170px] flex flex-col">
			<!-- Genres -->
			<div
				class="flex flex-col items-start justify-start w-full h-full gap-2 px-2 py-4 m-1 bg-gray-100"
			>
				{#each gig.genres as genre}
					<div
						class="px-3 py-1 bg-white font-normal uppercase shadow-xl whitespace-nowrap border-[1px] border-black text-base text-black font-body border-dashed rounded-full"
					>
						{genre}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.gig-card {
		display: flex;
		flex-direction: column;
		align-items: end;

		max-width: 1200px;
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

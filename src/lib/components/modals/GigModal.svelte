<script>
	export let gig = {};

	function openBandModal(band) {
		console.log('band clicked 👉 ', band);
	}
</script>

<div class="overflow-y-auto gig-card">
	<div class="w-full gig-details">
		<h2 class="gig-title">{gig.title}</h2>
		<p class="flex flex-col gig-datetime">
			<strong>{gig.date}</strong>
			<strong>{gig.time}</strong>
		</p>

		{#if gig.image}
			<img src={gig.image} alt={gig.title} class="gig-image" />
		{/if}
		<p class="gig-description">{gig.description}</p>

		{#if gig.ticketUrl && gig.ticketUrl !== '#'}
			<a href={gig.ticketUrl} target="_blank" class="gig-ticket-button">Visit Ticketing Site</a>
		{:else}
			<p class="gig-ticket-free">Free Entry</p>
		{/if}
		<h3 class="mt-4 mb-0 font-bold text-black uppercase">Bands</h3>
		<div class="flex flex-col items-start max-w-full text-blue-500 hover:cursor-pointer">
			{#each gig.bands as band}
				<button on:click={openBandModal(band)}>{band}</button>
			{/each}
		</div>
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

	.gig-ticket-button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background-color: gray;
		color: #fff;
		font-weight: bold;
		border-radius: 0.5rem;
		text-align: center;
		text-decoration: none;
		transition: background-color 0.2s;
		border-radius: 999999px;
	}

	.gig-ticket-button:hover {
		background-color: black;
	}

	.gig-ticket-free {
		color: green;
		font-weight: bold;
		margin-top: 1rem;
	}
</style>

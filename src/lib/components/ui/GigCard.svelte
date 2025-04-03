<script>
	export let gig = {};

	let show = false;
</script>

<div class="gig-card">
	<div class="w-full gig-details">
		<h2 class="gig-title">{gig.title}</h2>
		<p class="flex flex-col gig-datetime">
			<strong>{gig.date}</strong>
			<strong>{gig.time}</strong>
		</p>

		{#if !show}
			<button class="text-black" on:click={() => (show = !show)}
				><svg
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
						d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
					/>
				</svg>
			</button>
		{:else}
			<button class="text-black" on:click={() => (show = !show)}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
					<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
				</svg>
			</button>
			{#if gig.imageUrl}
				<img src={gig.imageUrl} alt={gig.title} class="gig-image" />
			{/if}
			<p class="gig-description">{gig.description}</p>
		{/if}

		{#if gig.ticketUrl && gig.ticketUrl !== '#'}
			<a href={gig.ticketUrl} target="_blank" class="gig-ticket-button">Visit Ticketing Site</a>
		{:else}
			<p class="gig-ticket-free">Free Entry</p>
		{/if}
	</div>
</div>

<style>
	.gig-card {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: 1rem;
		background-color: #fff;
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		max-width: 600px;
		margin: 8px;
		height: 100%;
	}

	.gig-image {
		width: 100%;
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

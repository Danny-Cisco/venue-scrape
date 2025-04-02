<script>
	export let gig = {};
</script>

<div class="gig-card">
	{#if gig.imageUrl}
		<img src={gig.imageUrl} alt={gig.title} class="gig-image" />
	{/if}

	<div class="gig-details">
		<h2 class="gig-title">{gig.title}</h2>
		<p class="gig-datetime">
			<strong>{gig.date}</strong> at <strong>{gig.time}</strong>
		</p>
		<p class="gig-description">{gig.description}</p>

		{#if gig.ticketUrl && gig.ticketUrl !== '#'}
			<a href={gig.ticketUrl} target="_blank" class="gig-ticket-button">Buy Tickets</a>
		{:else}
			<p class="gig-ticket-free">Free Entry</p>
		{/if}
	</div>
</div>

<style>
	.gig-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background-color: #fff;
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		max-width: 600px;
		margin: 8px;
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
		background-color: #e85914;
		color: #fff;
		font-weight: bold;
		border-radius: 0.5rem;
		text-align: center;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.gig-ticket-button:hover {
		background-color: #c44710;
	}

	.gig-ticket-free {
		color: green;
		font-weight: bold;
		margin-top: 1rem;
	}
</style>

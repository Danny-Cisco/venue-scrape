<script>
	export let band = {};
</script>

<div class="overflow-y-auto band-card">
	<div class="w-full band-details">
		<h2 class="band-name">{band.bandName}</h2>

		{#if band.images}
			<div class="flex w-screen overflow-x-auto">
				{#each band.images.imageUrls as imageUrl}
					<img src={imageUrl} alt={band.bandName} class="band-image" />
				{/each}
			</div>
		{/if}

		{#if band.socialUrls}
			{#each band.socialUrls as socialUrl}
				<a href={socialUrl}>{socialUrl}</a>
			{/each}
		{/if}

		{#if band.instagram}
			<div>
				<h1>Instagram:</h1>
				<p>{JSON.stringify(band.instagram, null, 2)}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.band-card {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: 1rem;
		background-color: #fff;

		max-width: 900px;

		padding: 2rem;
		height: 100%;
	}

	.band-image {
		width: 100%;
		max-width: 300px;
		height: auto;
		border-radius: 0.5rem;
		object-fit: cover;
	}

	.band-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.band-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: #222;
	}

	.band-datetime {
		font-size: 1rem;
		color: #444;
	}

	.band-description {
		white-space: pre-wrap;
		font-size: 1rem;
		color: #333;
		line-height: 1.5;
	}

	.band-ticket-button {
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

	.band-ticket-button:hover {
		background-color: black;
	}

	.band-ticket-free {
		color: green;
		font-weight: bold;
		margin-top: 1rem;
	}
</style>

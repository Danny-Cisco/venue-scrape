<script>
	export let band = {};
</script>

<div class="overflow-y-auto text-black band-card">
	<div class="w-full band-details">
		<h2 class="text-6xl font-bold text-center text-black">{band.bandName}</h2>

		{#if band.images}
			<div class="flex max-w-full min-w-full overflow-x-auto">
				{#each band.images.imageUrls as imageUrl}
					<img src={imageUrl} alt={band.bandName} class="band-image" />
				{/each}
			</div>
		{/if}

		{#if band.socialUrls}
			<h1 class="text-4xl font-bold">Social Urls:</h1>

			{#each band.socialUrls as socialUrl}
				<a href={socialUrl}>{socialUrl}</a>
			{/each}
		{/if}

		{#if band.instagram}
			<div class="text-black">
				<h1 class="text-4xl font-bold">Instagram:</h1>
				<a href={band.instagram.url}>{band.instagram.url}</a>
				<h2>Bio</h2>
				<p>{band.instagram.biography}</p>
				<h2>Followers: {band.instagram.followersCount}</h2>
				<h2>Posts: {band.instagram.postsCount}</h2>
				<h2>External Urls</h2>
				{#each band.instagram.externalUrls as extUrl}
					<a href={extUrl.url}>{extUrl.url}</a>
				{/each}

				<h2 class="mt-4">Latest Instagram Posts:</h2>
				<div class="flex max-w-full min-w-full overflow-x-auto">
					{#each band.instagram.latestPosts as post}
						<div class="p-4 m-1 border rounded bg-gray-5">
							<h2 class="capitalize">{post.type} Post</h2>
							<a href={post.url}>{post.url}</a>

							<h2 class="row">
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
										d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
									/>
								</svg>
								{post.likesCount}
							</h2>
							<h2 class="row">
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
										d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
									/>
								</svg>
								{post.commentsCount}
							</h2>
							{#if post.type === 'Video'}
								<h2 class="row">
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
											d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
										/>
									</svg>
									{post.videoViewCount}
								</h2>
							{/if}
							<div class="mb-2">
								<p>{post.caption}</p>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each post.mentions as mention}
									<p class="p-2 mx-2 font-bold text-white bg-blue-500 rounded-full">{mention}</p>
								{/each}
								{#each post.hashtags as hashtag}
									<p class="p-2 mx-2 font-bold text-white bg-blue-500 rounded-full">{hashtag}</p>
								{/each}
								{#if post.taggedUsers}
									{#each post.taggedUsers as taggedUser}
										<p class="p-2 mx-2 font-bold text-white bg-blue-500 rounded-full">
											{taggedUser.full_name}
										</p>
									{/each}
								{/if}
							</div>
						</div>
					{/each}
				</div>
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

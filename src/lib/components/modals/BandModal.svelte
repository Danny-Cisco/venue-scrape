<script>
	export let band = {};

	let clickedPost = null;

	$: clickedPost = band.instagram?.latestPosts?.[0] || null;

	let totalInstagramLikes = 0;
	let averageInstagramLikes = 0;

	function handlePostClick(post) {
		clickedPost = post;
	}

	$: {
		totalInstagramLikes = 0;
		if (band.instagram?.latestPosts) {
			for (const post of band.instagram.latestPosts) {
				totalInstagramLikes += +post.likesCount || 0;
			}
		}
	}

	$: averageInstagramLikes = Math.round(
		totalInstagramLikes / (band.instagram?.latestPosts.length || 1)
	);
</script>

<div class="overflow-y-auto text-black band-card">
	<div class="w-full space-y-20 band-details">
		<h2 class="text-6xl font-bold text-center text-black">{band.bandname}</h2>

		{#if band.images}
			<div>
				<div class="flex max-w-full min-w-full overflow-x-auto">
					{#each band.images.images || [] as image}
						<img src={image} alt={band.bandname} class="band-image" />
					{/each}
				</div>
			</div>
		{/if}

		{#if band.socialUrls}
			<div>
				<h1 class="text-4xl font-bold">Social Urls:</h1>
				<div class="ml-8">
					{#each band.socialUrls || [] as socialUrl}
						<div class="block">
							<a href={socialUrl}>{socialUrl}</a>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if band.instagram}
			<div>
				<h1 class="space-x-10 text-4xl font-bold row">
					Instagram: <div class="row">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="size-10"
							><path
								d="M12 11C14.7614 11 17 13.2386 17 16V22H15V16C15 14.4023 13.7511 13.0963 12.1763 13.0051L12 13C10.4023 13 9.09634 14.2489 9.00509 15.8237L9 16V22H7V16C7 13.2386 9.23858 11 12 11ZM5.5 14C5.77885 14 6.05009 14.0326 6.3101 14.0942C6.14202 14.594 6.03873 15.122 6.00896 15.6693L6 16L6.0007 16.0856C5.88757 16.0456 5.76821 16.0187 5.64446 16.0069L5.5 16C4.7203 16 4.07955 16.5949 4.00687 17.3555L4 17.5V22H2V17.5C2 15.567 3.567 14 5.5 14ZM18.5 14C20.433 14 22 15.567 22 17.5V22H20V17.5C20 16.7203 19.4051 16.0796 18.6445 16.0069L18.5 16C18.3248 16 18.1566 16.03 18.0003 16.0852L18 16C18 15.3343 17.8916 14.694 17.6915 14.0956C17.9499 14.0326 18.2211 14 18.5 14ZM5.5 8C6.88071 8 8 9.11929 8 10.5C8 11.8807 6.88071 13 5.5 13C4.11929 13 3 11.8807 3 10.5C3 9.11929 4.11929 8 5.5 8ZM18.5 8C19.8807 8 21 9.11929 21 10.5C21 11.8807 19.8807 13 18.5 13C17.1193 13 16 11.8807 16 10.5C16 9.11929 17.1193 8 18.5 8ZM5.5 10C5.22386 10 5 10.2239 5 10.5C5 10.7761 5.22386 11 5.5 11C5.77614 11 6 10.7761 6 10.5C6 10.2239 5.77614 10 5.5 10ZM18.5 10C18.2239 10 18 10.2239 18 10.5C18 10.7761 18.2239 11 18.5 11C18.7761 11 19 10.7761 19 10.5C19 10.2239 18.7761 10 18.5 10ZM12 2C14.2091 2 16 3.79086 16 6C16 8.20914 14.2091 10 12 10C9.79086 10 8 8.20914 8 6C8 3.79086 9.79086 2 12 2ZM12 4C10.8954 4 10 4.89543 10 6C10 7.10457 10.8954 8 12 8C13.1046 8 14 7.10457 14 6C14 4.89543 13.1046 4 12 4Z"
							></path></svg
						>
						{band.instagram.followersCount}
					</div>
					<div class="row">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="size-10"
							><path
								d="M6 4C6 3.44772 6.44772 3 7 3H21C21.5523 3 22 3.44772 22 4V16C22 16.5523 21.5523 17 21 17H18V20C18 20.5523 17.5523 21 17 21H3C2.44772 21 2 20.5523 2 20V8C2 7.44772 2.44772 7 3 7H6V4ZM8 7H17C17.5523 7 18 7.44772 18 8V15H20V5H8V7ZM16 15.7394V9H4V18.6321L11.4911 11.6404L16 15.7394ZM7 13.5C7.82843 13.5 8.5 12.8284 8.5 12C8.5 11.1716 7.82843 10.5 7 10.5C6.17157 10.5 5.5 11.1716 5.5 12C5.5 12.8284 6.17157 13.5 7 13.5Z"
							></path></svg
						>{band.instagram.postsCount}
					</div>
					<div class="row">
						<!-- likes icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-10"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
							/>
						</svg>{averageInstagramLikes}
					</div>
				</h1>
				<div class="ml-8">
					<div class="block">
						<a href={band.instagram.url}>{band.instagram.url}</a>
					</div>
					{#each band.instagram.externalUrls || [] as extUrl}
						<div class="block">
							<a href={extUrl.url}>{extUrl.url}</a>
						</div>
					{/each}
					<img src={band.instagram.profilePicUrlHD} alt="" />
					<h2>Biography of {band.instagram.fullName}</h2>
					<p class="ml-8">{band.instagram.biography}</p>

					<h2 class="mt-4">Recent Posts:</h2>
					<div class="grid max-w-full min-w-full grid-cols-2">
						<div>
							<!-- list of posts -->
							{#if band.instagram.latestPosts}
								<table>
									<thead>
										<tr class="grid w-full grid-cols-4"
											><th>Type</th><th>Likes</th><th>Comments</th><th>Views</th></tr
										>
									</thead>
									<tbody>
										{#each band.instagram.latestPosts || [] as post}
											<tr
												class="grid w-full grid-cols-4 cursor-pointer hover:bg-gray-100"
												on:click={handlePostClick(post)}
												><td>{post.type}</td><td>
													<div class="row">
														<!-- likes icon -->
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
														</svg>{post.likesCount}
													</div></td
												><td>
													<div class="row">
														<!-- comments icon -->
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
														</svg>{post.commentsCount}
													</div>
												</td><td
													>{#if post.type === 'Video'}
														<div class="row">
															<!-- views icon -->
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
															</svg>{post.videoViewCount}
														</div>{/if}</td
												></tr
											>
										{/each}
									</tbody>
								</table>
							{/if}
						</div>
						{#if clickedPost}
							<!-- clicked post card -->
							<div class="p-4 m-1 border rounded bg-gray-5">
								<h2 class="capitalize">{clickedPost.type} Post</h2>
								<a href={clickedPost.url}>{clickedPost.url}</a>

								<h2 class="row">
									<!-- likes icon -->
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
									{clickedPost.likesCount}
								</h2>
								<h2 class="row">
									<!-- comments icon -->
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
									{clickedPost.commentsCount}
								</h2>
								{#if clickedPost.type === 'Video'}
									<h2 class="row">
										<!-- views icon -->
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
										{clickedPost.videoViewCount}
									</h2>
								{/if}
								<div class="mb-2">
									<p>{clickedPost.caption}</p>
								</div>
								<div class="flex flex-wrap gap-2">
									{#each clickedPost.mentions || [] as mention}
										<p class="px-2 py-1 text-xs font-light text-white bg-blue-500 rounded-full">
											{mention}
										</p>
									{/each}

									{#each clickedPost.hashtags || [] as hashtag}
										<p
											class="px-2 py-1 text-xs font-light text-white bg-purple-500 rounded-full row"
										>
											# {hashtag}
										</p>
									{/each}
									{#if clickedPost.taggedUsers}
										{#each clickedPost.taggedUsers || [] as taggedUser}
											<p
												class="px-2 py-1 text-xs font-light text-white bg-pink-500 rounded-full row"
											>
												@ {taggedUser.full_name}
											</p>
										{/each}
									{/if}
								</div>
							</div>
						{/if}
					</div>
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

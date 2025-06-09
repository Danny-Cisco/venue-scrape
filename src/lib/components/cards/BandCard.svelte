<script>
	import { weserv, imgHaste, photon } from '$lib/utils/image.js';
	import { onMount } from 'svelte';
	import StarRatingBarColor from '../ui/StarRatingBarColor.svelte';

	export let bandObject;

	let key = 0;

	let profilePicUrl = '';

	function openBandModal(band) {
		console.log('band clicked . Open Modal COde goes here 👉 ', band);
	}

	async function getLinktreePic(url) {
		try {
			const response = await fetch(
				`/api/cheerio/linktree-profile-pic?url=${encodeURIComponent(url)}`
			);
			if (!response.ok) {
				throw new Error(`Server error: ${response.status}`);
			}

			const data = await response.json();
			console.log('🚀 ~ getLinktreePic ~ data:', data);

			if (data.image) {
				key += key;
				return data.image; // The profile pic URL
			} else {
				throw new Error(data.error || 'Image not found');
			}
		} catch (err) {
			console.error('Failed to fetch Linktree profile picture:', err);
			return null;
		}
	}

	onMount(async () => {
		profilePicUrl = await getLinktreePic(bandObject.instagram?.externalUrl);
	});
</script>

<button
	class="w-full max-w-md p-3 pb-0 mx-4 text-gray-800 h-[245px] transition-shadow duration-300 ease-in-out bg-white rounded-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
	on:click={() => openBandModal(bandObject.bandname)}
>
	<div class="flex min-w-full">
		<!-- Instagram Profile Picture via Weserv -->
		<div
			class="bg-gradient-to-br from-gray-500/5 gap-4 to-black/5 center font-sans text-xs text-gray-400 font-extralight min-w-[150px] max-w-[150px] rounded-sm overflow-hidden min-h-[150px] max-h-[150px]"
		>
			<!-- {#if bandObject.instagram?.profilePicUrl}
				<img
					src={weserv(bandObject.instagram.profilePicUrl)}
					alt="_profile pic"
					fallback="/fallback-avatar.png"
				/>
			{/if} -->
			{#key key}
				{#if bandObject.instagram?.externalUrl}
					<img src={profilePicUrl} alt="_linktree pic" fallback="/fallback-avatar.png" />
				{/if}
			{/key}
		</div>
		<div class="flex flex-col w-full h-full ml-4">
			<!-- Top section: Dot and Band Name -->
			<div class="flex flex-col justify-between w-full h-full max-w-full">
				<!-- <div class="w-3 h-3 mr-3 bg-blue-500 rounded-full shrink-0"></div> -->
				<div>
					<h2
						class="pl-0 mb-0 ml-0 font-sans text-2xl font-black text-left text-black capitalize ellipsis w-fit line-clamp-2"
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
				<div class="grid items-stretch w-full grid-cols-2">
					<div class="flex flex-col justify-between">
						<!-- Star Rating -->
						<div class="flex mt-3 mb-3">
							<StarRatingBarColor {bandObject} />
						</div>

						<!-- <div class="flex-1"></div> -->

						<!-- Instagram Info Section -->
						<div class="block">
							{#if bandObject.instagram}
								{#if bandObject.instagram.followersCount}
									<div class="flex items-end gap-2 text-sm text-blue-500">
										{(bandObject.instagram.followersCount / 1000).toFixed(1)}k
										<div class="font-sans text-sm font-bold">Followers</div>
									</div>
								{/if}
								{#if bandObject.instagram.postsCount}
									<div class="flex items-end gap-2 text-sm text-blue-500">
										{bandObject.instagram.postsCount}
										<div class="font-sans text-sm font-bold">Posts</div>
									</div>
								{/if}
							{:else}
								<div class="text-xs italic text-gray-500">No Instagram profile</div>
							{/if}
						</div>
					</div>

					<div
						class="flex flex-col items-end h-full pt-3 mt-auto space-y-1 border-t-0 border-gray-200"
					>
						<!-- links section -->
						{#if bandObject.instagram}
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
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Biography section -->
	<div>
		<div
			class=" font-sans min-h-[5.2rem] text-sm py-2 text-center items-center justify-center flex-col flex text-black"
		>
			<p>
				{bandObject.instagram?.biography || ''}
			</p>
		</div>
	</div>
</button>

<script>
	import { weserv, imgHaste, photon } from '$lib/utils/image.js';
	import { onMount } from 'svelte';
	import StarRatingBarColor from '../ui/StarRatingBarColor.svelte';
	import ExternalLinkListerIcons from '$lib/components/ui/ExternalLinkListerIcons.svelte';

	import { bioWriter } from '$lib/utils/prompts.ts';

	let writingBio = false;

	export let bandObject;

	let key = 0;
	let loading = false;
	let showLinktreePic = false;
	let failed = false;

	let profilePicUrl = '';

	function openBandModal(band) {
		console.log('band clicked . Open Modal COde goes here 👉 ', band);
	}

	async function getLinktreePic(url) {
		if (failed) return;
		loading = true;
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
				showLinktreePic = true;

				profilePicUrl = data.image;
				return;
			} else {
				failed = true;
				throw new Error(data.error || 'Image not found');
			}
		} catch (err) {
			console.error('Failed to fetch Linktree profile picture:', err);
			failed = true;
			return null;
		} finally {
			loading = false;
			key += key;
		}
	}

	async function getBio() {
		writingBio = true;

		const systemPrompt = bioWriter;

		const question =
			bandObject.bandname +
			bandObject.instagram?.biography +
			bandObject.instagram?.latestPosts
				.map((post) => `${post.caption}${post.locationName}${post.hashTags}`)
				.join('');
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
		writingBio = false;
		return data.answer;
	}

	let bio = '';
	onMount(async () => {
		const bioResponse = await getBio();
		console.log('🚀 ~ onMount ~ bio:', bioResponse);
		const bioObj = await JSON.parse(bioResponse);
		bio = bioObj.bio;
	});
</script>

<button
	class="w-full max-w-md p-3 pb-0 mx-4 text-gray-800 h-[245px] transition-shadow duration-300 ease-in-out bg-white rounded-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
	on:click={() => openBandModal(bandObject.bandname)}
>
	<div class="flex min-w-full">
		<!-- Instagram Profile Picture via Weserv -->
		<div
			class="bg-black gap-4 center font-sans text-xs text-gray-400 font-extralight min-w-[150px] max-w-[150px] rounded-sm overflow-hidden min-h-[150px] max-h-[150px]"
		>
			{#key key}
				{#if showLinktreePic}
					<img src={profilePicUrl} alt="_linktree pic" fallback="/fallback-avatar.png" />
				{:else if loading}
					<!-- SHOW ANIMATED GRADIENT WAVE WHILE LOADING -->
					<div class="w-full h-full loading-wave"></div>
				{:else if bandObject.instagram?.profilePicUrl}
					<img
						src={weserv(bandObject.instagram.profilePicUrl)}
						alt="_insta pic"
						fallback="/fallback-avatar.png"
						on:error={getLinktreePic(bandObject.instagram?.externalUrl)}
					/>
				{:else}
					<!-- FALLBACK TO SOLID BLACK IF NOT LOADING AND NOTHING ELSE -->
					<div class="w-full h-full bg-black"></div>
				{/if}
			{/key}
		</div>
		<div class="flex flex-col w-full h-[150px] ml-4">
			<!-- Top section: Band Name -->
			<div class="flex flex-col justify-between w-full h-full max-w-full">
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
			</div>
			<div class="grid items-stretch w-full grid-cols-[auto_1fr]">
				<div class="flex flex-col justify-between">
					<!-- Star Rating : Bar graph, not stars-->
					<div class="flex mt-3 mb-3">
						<StarRatingBarColor {bandObject} />
					</div>

					<!-- Instagram Info Section -->
					<div class="block">
						{#if bandObject.instagram}
							{#if bandObject.instagram.followersCount}
								<div class="flex items-end gap-2 text-sm text-black">
									{(bandObject.instagram.followersCount / 1000).toFixed(1)}k
									<div class="font-sans text-sm font-bold">Followers</div>
								</div>
							{/if}
							{#if bandObject.instagram.postsCount}
								<div class="flex items-end gap-2 text-sm text-black">
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
					class="relative flex flex-col items-end h-full pt-3 mt-auto space-y-1 border-t-0 border-gray-200"
				>
					<!-- links section -->
					{#if bandObject.instagram}
						<div class="flex-1"></div>

						<!-- External Link -->
						{#if bandObject.instagram.externalUrl}
							<ExternalLinkListerIcons url={bandObject.instagram.externalUrl} />
						{/if}
					{/if}
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
				{bio || bandObject.instagram?.biography || ''}
			</p>
		</div>
	</div>
</button>

<style>
	.loading-wave {
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, black, #555, black);
		background-size: 200% 100%;
		animation: wave 2s ease-in-out infinite;
	}

	@keyframes wave {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>

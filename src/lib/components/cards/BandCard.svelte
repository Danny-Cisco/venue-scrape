<script>
	import { weserv, imgHaste, photon } from '$lib/utils/image.js';
	import { onMount } from 'svelte';
	import StarRatingBarColor from '../ui/StarRatingBarColor.svelte';
	import ExternalLinkListerIcons from '$lib/components/ui/ExternalLinkListerIcons.svelte';
	import BioSection from '$lib/components/ui/BioSection.svelte';
	import { fade } from 'svelte/transition';
	import { bioWriter } from '$lib/utils/prompts.ts';
	import InstagramInfoIcons from '../ui/InstagramInfoIcons.svelte';

	let writingBio = false;

	let failed = false;

	export let bandObject;

	let key = 0;
	let loading = false;
	let showLinktreePic = false;

	let profilePicUrl = '';

	let bandnameElement;
	let needsSpacer = false;

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
		if (!bandObject.instagram) {
			return;
		}
		writingBio = true;
		const systemPrompt = bioWriter;
		const question =
			bandObject.bandname +
			bandObject.instagram?.biography +
			bandObject.instagram?.latestPosts
				.map((post) => `${post.caption}${post.locationName}${post.hashTags}`)
				.join('');
		const parsedBody = JSON.stringify({ question, systemPrompt });

		async function tryApiCall(body) {
			try {
				const response = await fetch('/api/openai/qabot', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body
				});
				if (!response.ok) {
					throw new Error(`Server error: ${response.status}`);
				}
				const data = await response.json();
				console.log('🚀 ~ writingBio ~ data:', data);
				return data.answer;
			} catch (error) {
				console.error('API call failed:', error);
				throw error;
			}
		}

		const maxRetries = 2;
		let lastError = null;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const result = await tryApiCall(parsedBody);
				writingBio = false;
				return result;
			} catch (error) {
				lastError = error;
				console.error(`Attempt ${attempt} failed:`, error);
				if (attempt < maxRetries) {
					// Optional: Add delay between retries (e.g., 1 second)
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
			}
		}

		writingBio = false;
		throw lastError || new Error('Failed to fetch bio after retries');
	}

	let bio = '';
	onMount(async () => {
		// Get the computed height of the h2 bandname element and add spacer if needed
		const lineHeight = parseFloat(getComputedStyle(bandnameElement).lineHeight);
		const elementHeight = bandnameElement.clientHeight;
		needsSpacer = elementHeight > lineHeight * 1.2; // Use 1.2 to account for minor height variations

		let bioResponse = await getBio();

		console.log('🚀 ~ Raw response from getBio:', bioResponse);

		let cleanedResponse = bioResponse.trim();

		// This regex finds a comma (,) optionally followed by whitespace (\s*) right before the end of the string ($) and a curly brace (}).
		if (cleanedResponse.endsWith('}')) {
			cleanedResponse = cleanedResponse.replace(/,(\s*})$/, '$1}');
		}

		// --- Parsing with Error Handling ---
		try {
			// Attempt to parse the cleaned string
			const bioObj = JSON.parse(cleanedResponse);
			bio = bioObj.bio;
		} catch (error) {
			console.error('Failed to parse bio JSON:', error);
			console.error('Original malformed string was:', bioResponse);
			// Provide a fallback value so the UI doesn't break
			bio = 'Bio currently unavailable.';
		}
	});
</script>

<button
	class="flex flex-col w-full max-w-md p-3 pb-0 mx-4 text-gray-800 transition-shadow duration-300 ease-in-out bg-white rounded-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
	on:click={() => openBandModal(bandObject.bandname)}
>
	<div class="flex min-w-full">
		<!-- Instagram Profile Picture via Weserv -->
		<div
			class="bg-black/5 gap-4 center font-sans text-xs text-gray-400 font-extralight min-w-[150px] max-w-[150px] rounded-sm overflow-hidden min-h-[150px] max-h-[150px]"
		>
			{#key key}
				{#if showLinktreePic}
					<img src={profilePicUrl} alt="_linktree pic" />
				{:else if loading}
					<!-- SHOW ANIMATED GRADIENT WAVE WHILE LOADING -->
					<div class="w-full h-full loading-wave"></div>
				{:else if bandObject.instagram?.profilePicUrl && !failed}
					<img
						src={weserv(bandObject.instagram.profilePicUrl)}
						alt="_insta pic"
						on:error={getLinktreePic(bandObject.instagram?.externalUrl)}
					/>
				{:else}
					<!-- FALLBACK TO SOLID BLACK IF NOT LOADING AND NOTHING ELSE -->
					<div class="w-full h-full center" in:fade>
						<img class="pt-4 opacity-5" src="/noun-group.png" alt="_default pic" />
					</div>
				{/if}
			{/key}
		</div>
		<div class="flex flex-col w-full h-[150px] items-stretch ml-4">
			<!-- Top section: Band Name -->
			<div class="flex flex-col w-full h-full max-w-full">
				<div>
					<h2
						class="pb-0 pl-0 mb-0 ml-0 font-sans text-2xl font-black text-left text-black capitalize ellipsis w-fit line-clamp-2"
						bind:this={bandnameElement}
					>
						{bandObject.bandname}
					</h2>
				</div>
			</div>
			<div class="grid items-stretch w-full gap-4 -mt-1 grid-cols-[100px_1fr]">
				<div class="flex flex-col max-w-[200px] min-h-[110px] justify-start">
					<!-- instagram profile name link -->
					{#if bandObject.instagram}
						<a
							href={bandObject.instagram?.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex text-sm font-semibold max-w-[200px] text-purple-600 bg-transparent font-body hover:text-pink-500 hover:underline"
							on:click|stopPropagation
							>@{bandObject.instagram?.username || bandObject.instagram}
						</a>
						<!-- <div class="flex-1"></div> -->
						<!-- Star Rating : Bar graph, not stars-->
						<div class="flex">
							<!-- <StarRatingBarColor {bandObject} /> -->
						</div>
						<!-- Instagram Info Section -->
						<!-- <InstagramInfoIcons {bandObject} /> -->

						<!-- <div class="flex-1"></div> -->

						<!-- Instagram Info Section -->
						<div class="flex flex-col flex-1 gap-1">
							<InstagramInfoIcons {bandObject} />
							<div class="flex-1"></div>
							<StarRatingBarColor {bandObject} />
							<div class="flex-1"></div>
						</div>
					{:else}
						<div class="text-xs text-gray-500 font-round whitespace-nowrap">
							No Instagram profile
						</div>
					{/if}
				</div>

				<div
					class="relative flex flex-col min-h-[110px] items-end h-full pt-3 pb-1 mt-1 space-y-1 border-t-0 border-gray-200"
				>
					<div class="flex-1"></div>
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
	<!-- spacer appears for LONG BANDNAME-->
	{#if needsSpacer}
		<div class="h-[2rem]"></div>
	{/if}
	<!-- Biography section -->

	<div
		class=" font-body min-h-[5.2rem] text-sm py-2 text-center items-center font-medium justify-center flex-col flex text-black"
	>
		{#if writingBio && bandObject.instagram}
			<!-- Loading Animation -->
			<div class="relative pl-5 overflow-hidden text-base text-gray-400">
				<span
					class="wave-mask bg-gradient-to-r from-gray-300 via-black to-gray-300 bg-[length:200%_100%] bg-clip-text text-transparent"
				>
					A detailed bio is on its way...
				</span>
			</div>
		{:else}
			<p in:fade>
				<!-- {bio || bandObject.instagram?.biography || ''} -->
				<BioSection {bio} />
			</p>
		{/if}
	</div>
</button>

<style>
	.wave-mask {
		animation: waveMove 2.5s linear infinite;
	}

	@keyframes waveMove {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
	.loading-wave {
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, #eee, #ddd, #eee);
		background-size: 300% 100%;
		animation: wave 3s ease-in-out infinite;
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

<script lang="ts">
	import '../app.postcss';

	import { showLeftSidebar } from '$lib/stores/ui';
	import { message, error, loading } from '$lib/stores/auth';

	import {
		showGigModal,
		showBandModal,
		lastClicked,
		showMapsModal
	} from '$lib/stores/modalStores.js';

	import { onMount } from 'svelte';
	import { slide, fly, fade } from 'svelte/transition';

	import type { SubmitFunction } from './$types.js';

	export let data;

	import { handleMagicLink } from '$lib/utils/magicLink';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import ModalLauncher from '$lib/components/modals/ModalLauncher.svelte';
	let email = '';

	let showContactTips = false;

	let leftSidebarContainer;

	let isSubmitting = false;
	let { supabase, session, profile } = data;
	$: ({ supabase, session, profile } = data);

	$: console.log('profile: ', profile);

	$: if ($showLeftSidebar) {
		if (profile?.read_only || !profile)
			setTimeout(() => {
				showContactTips = true;
			}, 300);
	}

	function closeAll() {
		$showLeftSidebar = false;
		$showGigModal = false;
		$showBandModal = false;
		$showMapsModal = false;
		$lastClicked = null;
	}

	$: if ($showLeftSidebar == false) showContactTips = false;

	async function submitMagicLink() {
		isSubmitting = true;
		const result = await handleMagicLink(email, supabase);
		// console.log('🚀 ~ submitMagicLink ~ result:', result);

		if (result.success) {
			message.set(result.message);
			error.set('');
		} else {
			message.set('');
			error.set(result.errors?.email || result.message);
		}
		isSubmitting = false;
	}

	const handleSubmit: SubmitFunction = () => {
		$loading = true;
		return async ({ update }) => {
			update();
			$loading = false;
		};
	};

	function handleOutsideClick() {
		$showLeftSidebar = false;
	}

	onMount(() => {
		// Detect if the user is on mobile and update the stores
		const isMobile = window.innerWidth <= 768; // Common breakpoint for mobile

		if (isMobile) {
			// hide the sidebars if page loaded on mobile
			showLeftSidebar.set(false);
		} else {
			// hide the sidebars on desktop as well
			showLeftSidebar.set(false);
		}

		return () => {};
	});
</script>

<!-- page gradient -->
<div class="fixed inset-0 z-[0] bg-gradient-to-br from-white/10 to-black/50"></div>

<div class="flex flex-1 h-full">
	<!-- Main Content -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="relative w-full h-full overflow-y-auto pt-[100px]" on:click={handleOutsideClick}>
		<main class="h-full max-w-[80ch] mx-auto">
			<slot />
		</main>
	</div>
	<!-- Left Sidebar -->
	{#if $showLeftSidebar}
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<aside
			bind:this={leftSidebarContainer}
			class="w-[270px] p-4 pt-16 bg-black top-0 isolate absolute z-[99999] left-0 h-full font-sans font-thin hover:text-pink-500 overflow-y-auto"
			transition:slide={{ axis: 'x' }}
			on:click={closeAll}
		>
			<div class="h-[121px]"></div>
			<!-- <h2 class="mb-2 text-lg font-semibold whitespace-nowrap">Music Naarm</h2> -->
			<ul>
				<li class="mb-2 row">
					<a
						href="/"
						class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
					>
						<svg
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
								d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
							/>
						</svg>
						Home
					</a>
				</li>
				<li class="mb-2 row">
					<a
						href="/app-settings"
						class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
					>
						<svg
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
								d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
						App Settings
					</a>
				</li>

				<li class="mb-2 row">
					<a
						href="/account"
						class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="size-5 ml-[1px]"
							><path
								d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM7 12H9C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12H17C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12Z"
							></path></svg
						>
						My Profile
					</a>
				</li>
			</ul>
			<!-- divider -->
			<div class="h-5"></div>
			<div class="h-5 border-t-[1px] border-white/50 border-dotted"></div>

			<a href="/dashboards">
				<h2
					class="justify-start mb-2 ml-0 text-base font-semibold text-gray-100 uppercase font-fancy2 whitespace-nowrap"
				>
					Dashboards
				</h2></a
			>

			<ul class="justify-start ml-0 whitespace-nowrap">
				<li class="mb-2 row">
					<a
						href="/dashboards/genre-chart"
						class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
					>
						<svg
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
								d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
							/>
						</svg>
						Genre Chart
					</a>
				</li>
			</ul>

			{#if profile && !profile?.read_only}
				<!-- divider -->
				<div class="h-5"></div>
				<div class="h-5 border-t-[1px] border-white/50 border-dotted"></div>

				<a href="/ticket-sites">
					<h2
						class="justify-start mb-2 ml-0 text-base font-semibold text-gray-100 uppercase font-fancy2 whitespace-nowrap"
					>
						Ticket Sites
					</h2></a
				>

				<ul class="justify-start ml-0 whitespace-nowrap">
					<li class="mb-2 row">
						<a
							href="/ticket-sites/moshtix"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Moshtix
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/ticket-sites/oztix"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Oztix
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/ticket-sites/eventbrite"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Eventbrite
						</a>
					</li>
				</ul>
				<a href="/venues">
					<h2
						class="justify-start mb-2 ml-0 text-base font-semibold text-gray-100 uppercase font-fancy2 whitespace-nowrap"
					>
						Venues
					</h2></a
				>

				<ul class="justify-start ml-0 whitespace-nowrap">
					<li class="mb-2 row">
						<a
							href="/venues/the-gem"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							The Gem
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/venues/the-tote"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							The Tote
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/venues/the-john-curtain"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							The John Curtin
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/venues/the-jazzlab"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							The Jazzlab
						</a>
					</li>
				</ul>
				<a href="/gig-guides">
					<h2
						class="justify-start mb-2 ml-0 text-base font-semibold text-gray-100 uppercase font-fancy2 whitespace-nowrap"
					>
						Gig Guides
					</h2></a
				>

				<ul class="justify-start ml-0 whitespace-nowrap">
					<li class="mb-2 row">
						<a
							href="/gig-guides/whats-lively"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							What's Lively
						</a>
					</li>
				</ul>
			{/if}

			{#if profile && profile?.dev_mode}
				<!-- divider -->
				<div class="h-5"></div>
				<div class="h-5 border-t-[1px] border-white/50 border-dotted"></div>

				<a href="/tools">
					<h2
						class="justify-start mb-2 ml-0 text-base font-semibold text-gray-100 uppercase font-fancy2 whitespace-nowrap"
					>
						Developer Tools
					</h2></a
				>

				<ul class="justify-start ml-0 whitespace-nowrap">
					<li class="mb-2 row">
						<a
							href="/tools/image-to-gigs"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Image To Gigs
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/venue-suburbs"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Venue Suburbs
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/venue-addresses"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Venue Addresses
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/jina-or-html"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Jina or HTML
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/cheerio-selector"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Cheerio Selector
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/serper"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Serper
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/serper-plus-ai"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Serper plus AI
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/cheerio-links-plus-ai"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Cheerio links plus AI
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/cheerio-html-plus-ai"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Cheerio HTML plus AI
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/jina-plus-ai"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Jina plus AI
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/algolia"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Algolia
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/algolia-plus-ai"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Algolia plus AI
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/get-instagram-url"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Get Instagram Url
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/google-maps"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Google Maps
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/venue-name-match"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Venue Name Match
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/live-music-check"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Live Music Check
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/bandname-extractor"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							bandname Extractor
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/whats-lively-urls"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							What's Lively Urls
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/whats-lively-ticket-links"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							What's Lively Ticket Links
						</a>
					</li>
					<li class="mb-2 row">
						<a
							href="/tools/moshtix-urls"
							class="flex items-center justify-start gap-2 ml-0 font-light whitespace-nowrap hover:underline"
						>
							<svg
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
							</svg>
							Moshtix Urls
						</a>
					</li>
				</ul>
			{/if}
			<div class="h-[15dvh]"></div>

			{#if $showLeftSidebar}
				{#if showContactTips}
					<div class="w-full text-gray-600 whitespace-nowrap" in:fade={{ delay: 1000 }}>
						<p>Want more tools?</p>
						<p>Contact the</p>
						<p>developer to upgrade</p>
						<p>your account</p>
					</div>
				{/if}
			{/if}
		</aside>
	{/if}

	<!-- Button to toggle left sidebar -->
	<button
		class="absolute left-0 z-20 p-2 pr-4 my-1 z-[999999] text-center rounded-r-full top-[101px] bg-purple-500 text-gray-100 btn-hover hover:bg-pink-500"
		on:click={() => showLeftSidebar.update((v) => !v)}
	>
		MENU <div class="center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
				style="transition: transform 0.3s ease;"
				style:transform={$showLeftSidebar ? 'rotate(0deg)' : 'rotate(180deg)'}
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
				/>
			</svg>
		</div>
	</button>
</div>

<!-- Header -->
<header
	class="fixed z-[999999] top-0 left-0 right-0 flex h-[100px] font-thin leading-none tracking-tight items-center justify-between px-4 py-2 isolate bg-black"
>
	<!-- Logo -->
	<strong class="flex items-end p-2 px-4 text-3xl bg-black border-0 border-purple-500 rounded-full">
		<!-- <img src="/icon.svg" class="size-10" alt="" /> -->
		<span class="px-3 py-1 text-4xl font-black text-gray-100 uppercase bg-black font-fancy2">
			Music Naarm
		</span>
	</strong>

	<!-- User Authentication -->
	{#if !$loading}
		<div class="flex items-end gap-4 py-2 pl-4 pr-2 m-4 mr-0 text-gray-100 rounded-md">
			{#if session}
				<a href="/account" class="flex items-center gap-2"
					><p class="text-lg font-thin text-gray-300 font-body">
						{profile?.username || session.user.email || session.user.displayName}
					</p>

					<!-- User Avatar -->
					<img
						src={profile?.avatar_url || '/default-avatar.svg'}
						alt="User Avatar"
						class="w-10 h-10 rounded-full"
					/>
				</a>
			{:else}
				<!-- Magic Link Form -->
				<div class="flex flex-col items-end">
					{#if $message}
						<div class="text-gray-500" in:fly={{ x: 200, duration: 500 }}>
							{$message}
						</div>
					{/if}
					{#if $error}
						<div class="text-orange-400" in:fly={{ x: 200, duration: 500 }}>
							{$error}
						</div>
					{/if}
					<form
						on:submit|preventDefault={submitMagicLink}
						class="flex items-center justify-end gap-2 mt-1 text-sm font-light"
					>
						<label for="email" class="hidden">Email</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="Enter your email"
							class="w-64 h-10 px-2 py-2 bg-transparent rounded !ring-black/20"
							required
						/>

						<button
							type="submit"
							class="px-4 py-2 font-light flex items-center gap-2 font-mono h-10 whitespace-nowrap text-[1rem] w-[200px] hover:shadow-md hover:mt-[-1px] rounded"
						>
							{isSubmitting ? 'Loading...' : 'Send Magic Link'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-8"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
								/>
							</svg>
						</button>
					</form>
				</div>
			{/if}
		</div>
	{/if}
</header>

<ModalLauncher />

<style>
	.size-5 {
		width: 20px;
		height: 20px;
	}
	/* 
	.rotate-180 {
		transform: rotate(180deg);
	} */

	.btn-hover {
		transition: transform 250ms;
	}

	.btn-hover:hover {
		transform: translateY(-2px);
	}
	h2 {
		margin-top: 1.2rem;
	}
</style>

<script lang="ts">
	import '../app.postcss';

	import { videoElement, devices, selectedDevice, permissionStatus } from '$lib/stores/camera';
	import { showLeftSidebar, showRightSidebar, showCameraSettingsModal } from '$lib/stores/ui';
	import { message, error, loading } from '$lib/stores/auth';
	import { triggerStartStream, triggerStopStream } from '$lib/stores/video';
	import { requestCameraPermission } from '$lib/utils/camera';

	import CapturedImageFly from '$lib/components/video/CapturedImageFly.svelte';
	import { onMount, tick } from 'svelte';
	import { slide, fly, fade } from 'svelte/transition';
	import Video from '$lib/components/video/Video.svelte';
	import CameraSettingsModal from '$lib/modals/CameraSettingsModal.svelte';

	import { capturedImage } from '$lib/stores/capturedImage.js';
	import { createHotkeyEmitter } from '$lib/helpers/hotkey.js';

	import { captureImage, captureImageAsGif } from '$lib/utils/imageProcessing';

	import type { ActionData, SubmitFunction } from './$types.js';

	import { invalidate } from '$app/navigation';

	export let data;

	import { handleMagicLink } from '$lib/utils/magicLink';

	// Set the device
	function selectDevice(deviceId) {
		$selectedDevice = deviceId;
	}

	let zoomLevel = 1; // Default zoom level
	function updateHeaderGrid() {
		const largeSquareSize = 100 * zoomLevel;
		const smallSquareSize = largeSquareSize / 5;

		const body = document.querySelector('body');
		body.style.backgroundImage = `
        linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
    `;
		body.style.backgroundSize = `
        ${largeSquareSize}px ${largeSquareSize}px,
        ${largeSquareSize}px ${largeSquareSize}px,
        ${smallSquareSize}px ${smallSquareSize}px,
        ${smallSquareSize}px ${smallSquareSize}px
    `;
	}

	$: $selectedDevice;

	let email = '';

	let isSubmitting = false;

	async function submitMagicLink() {
		isSubmitting = true;
		const result = await handleMagicLink(email, supabase);
		console.log('🚀 ~ submitMagicLink ~ result:', result);

		if (result.success) {
			message.set(result.message);
			error.set('');
		} else {
			message.set('');
			error.set(result.errors?.email || result.message);
		}
		isSubmitting = false;
	}

	let { supabase, session, profile } = data;
	$: ({ supabase, session, profile } = data);
	$: console.log('🚀 ~ profile:', profile);
	$: console.log('🚀 ~ data:', data);

	const hotkeyEmitter = createHotkeyEmitter();

	$: if ($selectedDevice) {
		triggerStartStream.set(true);
	} else {
		triggerStopStream.set(true);
	}

	const handleSubmit: SubmitFunction = () => {
		$loading = true;
		return async ({ update }) => {
			update();
			$loading = false;
		};
	};

	function handleVideoClick() {
		showCameraSettingsModal.set(true);
	}

	onMount(() => {
		// Detect if the user is on mobile and update the stores
		const isMobile = window.innerWidth <= 768; // Common breakpoint for mobile

		if (isMobile) {
			// hide the sidebars if page loaded on mobile
			showLeftSidebar.set(false);
			showRightSidebar.set(false);
		}

		updateHeaderGrid();

		requestCameraPermission();
		const unsubscribe = hotkeyEmitter.subscribe(captureImageAsGif);
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		const handleWheel = (e) => {
			return;
			if (e.deltaY < 0) {
				zoomLevel = Math.min(zoomLevel * 1.1, 5);
			} else {
				zoomLevel = Math.max(zoomLevel / 1.1, 0.5);
			}
			updateHeaderGrid();
		};

		window.addEventListener('wheel', handleWheel);

		return () => {
			unsubscribe();
			data.subscription.unsubscribe();
			window.removeEventListener('wheel', handleWheel); // Add this line
			if ($videoElement?.srcObject) {
				$videoElement.srcObject.getTracks().forEach((track) => track.stop());
			}
		};
	});
</script>

<body class="relative flex flex-col min-h-screen text-gray-800">
	<!-- Header -->
	<header class="flex items-center justify-between px-4 h-[10vh] py-2 bg-[#f1f1f1]">
		<!-- Logo -->
		<strong
			class="flex items-end gap-1 text-3xl bg-white p-4 pt-0 shadow-md rounded-md text-[magenta]"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 424 424"
				width="60"
				height="60"
				fill="none"
				stroke="magenta"
				stroke-width="2"
			>
				<circle cx="17" cy="407" r="15" />
				<circle cx="32" cy="392" r="30" />
				<circle cx="47" cy="377" r="45" />
				<circle cx="62" cy="362" r="60" />
				<circle cx="77" cy="347" r="75" />
				<circle cx="92" cy="332" r="90" />
				<circle cx="107" cy="317" r="105" />
				<circle cx="122" cy="302" r="120" />
				<circle cx="137" cy="287" r="135" />
				<circle cx="152" cy="272" r="150" />
				<circle cx="167" cy="257" r="165" />
				<circle cx="182" cy="242" r="180" />
			</svg>
			MindMapr.ai
		</strong>

		<!-- User Authentication -->
		{#if !$loading}
			<div class="flex items-end gap-4 py-2 pl-4 pr-2 m-4 bg-white rounded-md shadow-md">
				{#if session}
					<a href="/account" class="flex items-center gap-4"
						><p class="font-bold text-gray-500">
							{profile?.username || session.user.email || session.user.displayName}
						</p>

						<!-- User Avatar -->
						<img
							src={profile?.avatar_url || '/default-avatar.png'}
							alt="User Avatar"
							class="w-10 h-10 rounded-full"
						/>
					</a>
				{:else}
					<!-- Magic Link Form -->
					<div class="flex flex-col items-end">
						{#if $message}
							<div class="" in:fly={{ x: 200, duration: 500 }}>
								{$message}
							</div>
						{/if}
						{#if $error}
							<div class="" in:fly={{ x: 200, duration: 500 }}>
								{$error}
							</div>
						{/if}
						<div class="flex items-center justify-end gap-2 text-sm">
							<label for="email" class="hidden">Email</label>
							<input
								type="email"
								bind:value={email}
								placeholder="Enter your email"
								class="w-64 px-2 py-1 border rounded inputField"
							/>
							<button
								on:click={submitMagicLink}
								class="px-4 py-2 font-semibold text-[1rem] w-[160px] text-white bg-[magenta] rounded"
							>
								{isSubmitting ? 'Loading...' : 'Send Magic Link'}
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</header>

	<div class="flex flex-1">
		<!-- Left Sidebar -->
		{#if $showLeftSidebar}
			<aside
				class="w-[300px] p-4 pt-16 rounded-md shadow-lg m-4 bg-white"
				transition:slide={{ axis: 'x' }}
			>
				<h2 class="mb-2 text-lg font-semibold">MindMapr</h2>
				<ul>
					<li class="mb-2">
						<a
							href="/"
							class="flex items-center justify-start gap-2 ml-0 font-light text-gray-500 whitespace-nowrap hover:underline"
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
					<li class="mb-2">
						<button
							on:click={() => ($showCameraSettingsModal = true)}
							class="flex items-center justify-start gap-2 ml-0 font-bold text-gray-500 whitespace-nowrap hover:underline"
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

							Camera
						</button>
					</li>
					<li class="mb-2">
						<a
							href="/account"
							class="flex items-center justify-start gap-2 ml-0 font-light text-gray-500 whitespace-nowrap hover:underline"
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
							Account
						</a>
					</li>
				</ul>

				<h2 class="justify-start mb-2 ml-0 text-lg font-semibold whitespace-nowrap">
					Control Panels
				</h2>
				<ul class="justify-start ml-0 whitespace-nowrap">
					<li class="mb-2">
						<a
							href="/control-panels/vision-chat"
							class="flex items-center justify-start gap-2 ml-0 font-light text-gray-500 whitespace-nowrap hover:underline"
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
							Vision Chat
						</a>
					</li>
					<li class="mb-2">
						<a
							href="/control-panels/conversation-to-d3-mindmap"
							class="flex items-center justify-start gap-2 ml-0 font-light text-gray-500 whitespace-nowrap hover:underline"
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

							Conversation to D3 Mindmap
						</a>
					</li>
					<li>
						<a
							href="/control-panels/post-it-to-miro"
							class="flex items-center justify-start gap-2 ml-0 font-light text-gray-500 whitespace-nowrap hover:underline"
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
							Post-it to Miro
						</a>
					</li>
				</ul>
				<h2 class="my-2 text-lg font-semibold">Displays</h2>
				<ul>
					<li class="mb-2">
						<a
							href="/displays/vision-chat-markdown"
							class="flex items-center justify-start gap-2 ml-0 font-light text-gray-500 whitespace-nowrap hover:underline"
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
									d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
								/>
							</svg>

							Vision Chat Markdown
						</a>
					</li>
				</ul>
			</aside>
		{/if}

		<!-- Button to toggle left sidebar -->
		<button
			class="absolute z-20 p-2 rounded-r-full px-4 bg-white text-[magenta] shadow-md left-0 top-[10vh] hover:mt-[-1px] hover:shadow-md"
			on:click={() => showLeftSidebar.update((v) => !v)}
		>
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
		</button>

		<!-- Main Content -->
		<main class="flex-1 p-6 pt-16 relative overflow-y-auto h-[90vh] max-w-3xl mx-auto">
			<slot />
			{#if $permissionStatus === 'denied'}
				<div class="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
					Copy this link to a new tab to enable camera: chrome://settings/content/camera
				</div>
			{:else if $permissionStatus === 'error'}
				<div class="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
					An error occurred while accessing the camera. Please try again.
				</div>
			{/if}
		</main>

		<!-- Right Sidebar -->
		{#if $showRightSidebar}
			<aside transition:slide={{ axis: 'x' }} class="w-[300px] p-4 pt-16 rounded-md m-4">
				<div class="w-[250px] mx-auto"></div>
			</aside>
		{/if}

		<div class="absolute top-[17vh] right-4" class:hidden={!$showRightSidebar}>
			<div class="w-[268px] mx-auto bg-white p-4 pr-0 -mr-4 rounded-xl shadow-md">
				<h2 class="mb-2 text-lg font-semibold">INPUTS</h2>

				<Video
					bind:$videoElement
					selectedDeviceId={$selectedDevice}
					on:openModal={handleVideoClick}
					on:captureImage={captureImageAsGif}
				/>

				<div
					class="bg-gray-100 text-gray-500 border-[magenta] relative border-2 shadow rounded-lg h-[144px] w-[250px] flex flex-col items-center justify-center"
				>
					captured image
					<CapturedImageFly />
				</div>
			</div>
		</div>

		<!-- Button to toggle right sidebar -->
		<button
			class="absolute z-20 p-2 rounded-l-full px-4 bg-white text-[magenta] shadow-md right-0 top-[10vh] hover:mt-[-1px] hover:shadow-md"
			on:click={() => showRightSidebar.update((v) => !v)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class=" size-6"
				style="transition: transform 0.3s ease;"
				style:transform={$showRightSidebar ? 'rotate(0deg)' : 'rotate(-180deg)'}
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
				/>
			</svg>
		</button>
	</div>
</body>

<CameraSettingsModal />

<style>
	.size-5 {
		width: 20px;
		height: 20px;
	}

	.rotate-180 {
		transform: rotate(180deg);
	}
	h2 {
		color: black;
	}
</style>

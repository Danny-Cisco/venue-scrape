<script>
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import CapturedImageFly from '$lib/components/video/CapturedImageFly.svelte';
	import { onMount, tick } from 'svelte';
	import Video from '$lib/components/video/Video.svelte';
	import CameraSettingsModal from '$lib/modals/CameraSettingsModal.svelte';
	import { writable } from 'svelte/store';
	import { capturedImage } from '$lib/stores/capturedImage.js';
	import { createHotkeyEmitter } from '$lib/helpers/hotkey.js';

	const hotkeyEmitter = createHotkeyEmitter();

	let videoElement;
	let triggerStartStream = false;
	let selectedDeviceId = '';
	let devices = writable([]);
	let permissionStatus = writable('pending'); // Track permission status
	let showCameraSettingsModal = false;

	function startStream() {
		triggerStartStream = true;
	}

	async function requestCameraPermission() {
		try {
			const result = await navigator.permissions.query({ name: 'camera' });
			if (result.state === 'granted') {
				permissionStatus.set('granted');
				await getVideoDevices();
			} else if (result.state === 'prompt') {
				try {
					await navigator.mediaDevices.getUserMedia({ video: true });
					permissionStatus.set('granted');
					await getVideoDevices();
				} catch (error) {
					console.error('Permission denied or error occurred:', error);
					permissionStatus.set('denied');
				}
			} else {
				permissionStatus.set('denied');
				console.error('Camera permission denied');
			}
			result.addEventListener('change', (e) => {
				permissionStatus.set(e.target.state);
				if (e.target.state === 'granted') {
					getVideoDevices();
				}
			});
		} catch (error) {
			console.error('Error checking camera permissions:', error);
			permissionStatus.set('error');
		}
	}

	async function getVideoDevices() {
		try {
			const allDevices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');
			devices.set(videoDevices);
		} catch (error) {
			console.error('Error enumerating devices:', error);
		}
	}

	function handleVideoClick() {
		showCameraSettingsModal = true;
	}

	function captureImage() {
		capturedImage.set('');
		tick().then(() => {
			setTimeout(() => {
				if (!selectedDeviceId) return;
				const canvas = document.createElement('canvas');
				canvas.width = videoElement.videoWidth;
				canvas.height = videoElement.videoHeight;

				const context = canvas.getContext('2d');
				context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

				const imageData = canvas.toDataURL('image/png');
				capturedImage.set(imageData);
			}, 10);
		});
	}

	onMount(() => {
		requestCameraPermission();
		const unsubscribe = hotkeyEmitter.subscribe(captureImage);

		return () => {
			unsubscribe();
			if (videoElement?.srcObject) {
				videoElement.srcObject.getTracks().forEach((track) => track.stop());
			}
		};
	});
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">MindMapr</strong>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<div class="flex min-h-screen text-gray-800">
		<!-- Sidebar -->
		<aside class="w-64 p-4 bg-gray-200">
			<h2 class="mb-2 text-lg font-semibold">MindMapr</h2>

			<ul>
				<li class="mb-2">
					<a href="/" class="flex items-center gap-2 text-blue-600 hover:underline"
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
								d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
							/>
						</svg>
						Home
					</a>
				</li>
				<li class="mb-2">
					<a href="/" class="flex items-center gap-2 text-blue-600 hover:underline"
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
								d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>

						Settings
					</a>
				</li>
			</ul>

			<h2 class="mb-2 text-lg font-semibold">TOOLS</h2>
			<nav>
				<ul>
					<li class="mb-2">
						<a href="/vision-chat" class="text-blue-600 hover:underline">Vision Chat</a>
					</li>
					<li class="mb-2">
						<a href="/conversation-to-d3-mindmap" class="text-blue-600 hover:underline">
							Conversation to D3 Mindmap
						</a>
					</li>
					<li>
						<a href="/post-it-to-miro" class="text-blue-600 hover:underline">Post-it to Miro</a>
					</li>
				</ul>
			</nav>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 p-6 text-gray-800 bg-gray-100">
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

			<Video
				bind:videoElement
				bind:triggerStartStream
				{selectedDeviceId}
				on:openModal={handleVideoClick}
				on:captureImage={captureImage}
			/>

			<CapturedImageFly />

			<CameraSettingsModal
				bind:showCameraSettingsModal
				bind:devices
				bind:selectedDeviceId
				on:startStream={startStream}
			/>
		</main>
	</div>
</AppShell>

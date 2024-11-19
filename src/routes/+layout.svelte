<script>
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import CapturedImageFly from '$lib/components/video/CapturedImageFly.svelte';
	import { onMount, tick } from 'svelte';

	import Video from '$lib/components/video/Video.svelte';
	import CameraSettingsModal from '$lib/modals/CameraSettingsModal.svelte';
	import { writable } from 'svelte/store';

	import { createHotkeyEmitter } from '$lib/helpers/hotkey.js';
	import { capturedImage } from '$lib/stores/capturedImage.js';

	const hotkeyEmitter = createHotkeyEmitter();

	let videoElement;
	let triggerStartStream = false;
	let selectedDeviceId = '';
	let devices = writable([]);
	let permissionStatus = writable('pending'); // Track permission status
	let showCameraSettingsModal = false;

	// $: console.log('triggerStartStream:', triggerStartStream);

	function startStream() {
		triggerStartStream = true;
	}

	// Function to request camera permissions
	async function requestCameraPermission() {
		try {
			// First check if permissions are already granted
			const result = await navigator.permissions.query({ name: 'camera' });

			if (result.state === 'granted') {
				permissionStatus.set('granted');
				await getVideoDevices();
			} else if (result.state === 'prompt') {
				// If permission hasn't been granted yet, request it
				try {
					// Request access to just video to get initial permission
					await navigator.mediaDevices.getUserMedia({ video: true });
					permissionStatus.set('granted');
					await getVideoDevices();
				} catch (error) {
					console.error('Permission denied or error occurred:', error);
					permissionStatus.set('denied');
				}
			} else {
				// Permission was denied previously
				permissionStatus.set('denied');
				console.error('Camera permission denied');
			}

			// Listen for permission changes
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

	// Function to enumerate video input devices
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
	// Function to capture a still picture from the video feed
	function captureImage() {
		capturedImage.set(''); // Clear the image temporarily
		tick().then(() => {
			setTimeout(() => {
				if (!selectedDeviceId) return;
				// Create a canvas to draw the video frame
				const canvas = document.createElement('canvas');
				canvas.width = videoElement.videoWidth;
				canvas.height = videoElement.videoHeight;

				// Draw the current frame of the video onto the canvas
				const context = canvas.getContext('2d');
				context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

				// Convert the canvas to a Base64 image
				const imageData = canvas.toDataURL('image/png');
				capturedImage.set(imageData); // Update the store with the new image
			}, 10); // 10ms timeout to ensure re-render
		});
	}
	// Add and remove event listener on component lifecycle
	onMount(() => {
		requestCameraPermission(); // Request camera permissions on mount
		const unsubscribe = hotkeyEmitter.subscribe(captureImage);

		return () => {
			// Clean up event listener and stop any active streams when component unmounts
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
			<svelte:fragment slot="trail">
				<!-- <a
					class="btn btn-sm variant-ghost-surface"
					href="https://discord.gg/EXqV7W8MtY"
					target="_blank"
					rel="noreferrer"
				>
					DiscordÁ
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://twitter.com/SkeletonUI"
					target="_blank"
					rel="noreferrer"
				>
					Twitter
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/skeletonlabs/skeleton"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
				</a> -->
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<main class="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gray-100">
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

		<!-- Video Feed -->
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
</AppShell>

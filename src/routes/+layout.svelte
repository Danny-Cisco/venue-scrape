<script>
	import '../app.postcss';
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
	let permissionStatus = writable('pending');
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

<div class="flex flex-col min-h-screen text-gray-800">
	<!-- Header -->
	<header class="flex items-center px-4 h-[10vh] py-2 bg-white shadow">
		<strong class="flex items-end gap-1 text-3xl text-[magenta]">
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
	</header>

	<div class="flex flex-1">
		<!-- Sidebar -->
		<aside class="w-64 p-4 bg-gray-200">
			<h2 class="mb-2 text-lg font-semibold">MindMapr</h2>
			<ul>
				<li class="mb-2">
					<a href="/" class="flex items-center gap-2 text-blue-600 hover:underline">
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
						on:click={() => (showCameraSettingsModal = true)}
						class="flex items-center gap-2 text-blue-600 hover:underline"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="..." />
						</svg>
						Settings
					</button>
				</li>
			</ul>

			<h2 class="mb-2 text-lg font-semibold">TOOLS</h2>
			<ul>
				<li class="mb-2">
					<a href="/vision-chat" class="flex items-center gap-2 text-blue-600 hover:underline">
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
						href="/conversation-to-d3-mindmap"
						class="flex items-center gap-2 text-blue-600 hover:underline"
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
					<a href="/post-it-to-miro" class="flex items-center gap-2 text-blue-600 hover:underline">
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
		</aside>

		<!-- Main Content -->
		<main class="flex-1 p-6 overflow-y-auto h-[90vh] bg-gray-100">
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
</div>

<style>
	.size-5 {
		width: 20px;
		height: 20px;
	}
</style>

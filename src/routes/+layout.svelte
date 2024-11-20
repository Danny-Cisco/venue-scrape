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
				<strong class="flex items-center gap-1 text-3xl text-white"
					><svg
						width="50px"
						height="50px"
						version="1.1"
						viewBox="0 0 1200 1200"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="m84 600c0-284.98 231.02-516 516-516s516 231.02 516 516-231.02 516-516 516h-516v-516zm709.33 466.17c182.71-75.859 311.2-256.01 311.2-466.17 0-278.64-225.89-504.54-504.53-504.54-210.16 0-390.31 128.5-466.17 311.21 80.125-163.91 248.5-276.8 443.23-276.8 272.31 0 493.07 220.75 493.07 493.07 0 194.74-112.89 363.11-276.8 443.23zm-590.86-155.45c-7.9648-10.18-15.551-20.668-22.73-31.453 9.6797-2.6523 19.871-4.0703 30.391-4.0703 63.328 0 114.67 51.34 114.67 114.67 0 10.52-1.418 20.711-4.0703 30.391-10.785-7.1797-21.273-14.766-31.453-22.73-6.6406-44.77-42.035-80.164-86.805-86.805zm11.676 14.367c18.496 21.93 38.832 42.266 60.762 60.762-8.8945-28.992-31.77-51.867-60.762-60.762zm136.38 113.55c-6.6797-3.8086-13.266-7.7617-19.746-11.863 3.5664-11.672 5.4844-24.066 5.4844-36.91 0-69.66-56.473-126.13-126.13-126.13-12.844 0-25.238 1.918-36.91 5.4844-4.1016-6.4805-8.0547-13.066-11.863-19.746 20.883-12.777 45.434-20.141 71.707-20.141 75.996 0 137.6 61.605 137.6 137.6 0 26.273-7.3633 50.824-20.141 71.707zm10.035 5.5703c4.7773 2.5781 9.5977 5.082 14.465 7.5117 25.793-28.484 41.504-66.27 41.504-107.72 0-88.66-71.871-160.53-160.53-160.53-41.453 0-79.238 15.711-107.72 41.504 2.4297 4.8672 4.9336 9.6875 7.5117 14.465 22.535-13.688 48.984-21.57 77.277-21.57 82.328 0 149.07 66.738 149.07 149.07 0 28.293-7.8828 54.742-21.57 77.277zm36.023 17.637c-3.6367-1.6016-7.2461-3.2461-10.836-4.9336 26.312-30.211 42.25-69.703 42.25-112.91 0-94.992-77.008-172-172-172-43.211 0-82.703 15.938-112.91 42.25-1.6875-3.5898-3.332-7.1992-4.9336-10.836 33.652-40.227 84.23-65.812 140.78-65.812 101.32 0 183.46 82.141 183.46 183.46 0 56.551-25.586 107.13-65.812 140.78zm11.754 5.0078c2.6055 1.0703 5.2227 2.1211 7.8516 3.1484 55.504-36.992 92.074-100.16 92.074-171.87 0-113.99-92.406-206.4-206.4-206.4-71.711 0-134.88 36.57-171.87 92.074 1.0273 2.6289 2.0781 5.2461 3.1484 7.8516 35.707-40.199 87.793-65.527 145.79-65.527 107.66 0 194.93 87.273 194.93 194.93 0 57.996-25.328 110.08-65.527 145.79zm237.53-237.52c0 117.11-73.152 217.14-176.26 256.88 84.309-44.012 141.86-132.26 141.86-233.95 0-145.66-118.08-263.73-263.73-263.73-101.69 0-189.93 57.551-233.95 141.86 39.738-103.11 139.77-176.26 256.88-176.26 151.99 0 275.2 123.21 275.2 275.2zm-45.867 22.934c0 102.36-60.969 190.48-148.57 230.04-0.8125-0.25-1.625-0.50391-2.4375-0.75781 69.879-42.148 116.61-118.79 116.61-206.35 0-132.99-107.81-240.8-240.8-240.8-87.559 0-164.2 46.727-206.35 116.61-0.25391-0.8125-0.50391-1.625-0.75781-2.4375 39.555-87.602 127.68-148.57 230.04-148.57 139.32 0 252.27 112.95 252.27 252.27zm-474.21-316.12c61.438-150.86 209.54-257.21 382.47-257.21 227.98 0 412.8 184.82 412.8 412.8 0 172.94-106.34 321.04-257.21 382.47 132.06-65.703 222.81-202.03 222.81-359.54 0-221.65-179.68-401.34-401.34-401.34-157.51 0-293.84 90.746-359.54 222.81zm505.7 540.07c124.1-62.094 209.31-190.4 209.31-338.61 0-208.98-169.42-378.4-378.4-378.4-148.21 0-276.52 85.207-338.61 209.31 57.824-142.9 197.91-243.71 361.54-243.71 215.32 0 389.87 174.55 389.87 389.87 0 163.63-100.81 303.72-243.71 361.54zm-197.12 0.50391c-1.7109-0.59375-3.4219-1.1953-5.125-1.8086 54.816-39.57 90.492-104 90.492-176.77 0-120.32-97.543-217.87-217.87-217.87-72.77 0-137.2 35.676-176.77 90.492-0.61328-1.7031-1.2148-3.4141-1.8125-5.125 38.879-71.352 114.54-119.77 201.52-119.77 126.66 0 229.33 102.68 229.33 229.33 0 86.977-48.414 162.64-119.77 201.52zm-318.59-378.71c43.363-111.06 151.4-189.74 277.82-189.74 164.65 0 298.13 133.48 298.13 298.13 0 126.42-78.68 234.46-189.74 277.82 92.262-47.637 155.34-143.89 155.34-254.89 0-158.32-128.34-286.66-286.66-286.66-110.99 0-207.25 63.078-254.89 155.34zm461.29-556.68c-200.85 0-372.99 122.96-445.24 297.71 76.52-155.95 236.88-263.3 422.31-263.3 259.65 0 470.13 210.48 470.13 470.13 0 185.43-107.36 345.79-263.3 422.31 174.75-72.254 297.71-244.39 297.71-445.24 0-265.98-215.62-481.6-481.6-481.6zm401.33 527.47c0 176.12-101.82 328.47-249.8 401.39 166.79-68.648 284.2-232.77 284.2-424.32 0-253.32-205.35-458.67-458.67-458.67-191.55 0-355.67 117.42-424.32 284.2 72.914-147.98 225.26-249.8 401.39-249.8 246.98 0 447.2 200.21 447.2 447.2zm-561.87-206.4c-135.72 0-251.77 84.211-298.75 203.23 51.25-100.22 155.52-168.83 275.82-168.83 170.98 0 309.6 138.61 309.6 309.6 0 120.3-68.605 224.57-168.83 275.82 119.02-46.984 203.23-163.03 203.23-298.75 0-177.32-143.75-321.07-321.07-321.07zm-288.73 41.371c65.043-158.82 221.15-270.7 403.39-270.7 240.65 0 435.73 195.09 435.73 435.73 0 182.24-111.88 338.35-270.7 403.39 140.02-69.309 236.3-213.64 236.3-380.46 0-234.32-189.95-424.27-424.27-424.27-166.82 0-311.15 96.277-380.46 236.3zm334.59-133.1c-154.32 0-286.4 95.273-340.61 230.21 58.48-116.14 178.78-195.81 317.68-195.81 196.32 0 355.47 159.15 355.47 355.47 0 138.9-79.672 259.2-195.81 317.68 134.94-54.211 230.21-186.29 230.21-340.61 0-202.65-164.28-366.93-366.93-366.93zm286.67 412.8c0 129.6-74.141 241.88-182.32 296.75 126.98-50.598 216.72-174.66 216.72-319.68 0-189.99-154.02-344-344-344-145.02 0-269.09 89.742-319.68 216.72 54.867-108.18 167.15-182.32 296.75-182.32 183.66 0 332.54 148.88 332.54 332.54z"
							fill-rule="evenodd"
							fill="pink"
						/>
					</svg>MindMapr.ai</strong
				>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<div class="flex min-h-screen text-gray-800">
		<!-- Sidebar -->
		<aside class="p-4 bg-gray-200">
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
					<button
						on:click={() => (showCameraSettingsModal = true)}
						class="flex items-center gap-2 text-blue-600 hover:underline"
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
					</button>
				</li>
			</ul>

			<h2 class="mb-2 text-lg font-semibold">TOOLS</h2>
			<nav>
				<ul>
					<li class="mb-2">
						<a href="/vision-chat" class="flex items-center gap-2 text-blue-600 hover:underline"
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4.867 19.125h.008v.008h-.008v-.008Z"
								/>
							</svg>
							Vision Chat</a
						>
					</li>
					<li class="mb-2">
						<a
							href="/conversation-to-d3-mindmap"
							class="flex items-center gap-2 text-blue-600 hover:underline"
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4.867 19.125h.008v.008h-.008v-.008Z"
								/>
							</svg>Conversation to D3 Mindmap
						</a>
					</li>
					<li>
						<a href="/post-it-to-miro" class="flex items-center gap-2 text-blue-600 hover:underline"
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
									d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4.867 19.125h.008v.008h-.008v-.008Z"
								/>
							</svg>Post-it to Miro</a
						>
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

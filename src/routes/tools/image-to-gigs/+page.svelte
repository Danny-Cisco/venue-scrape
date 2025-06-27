<script>
	import { slide } from 'svelte/transition';
	import { imageToGigsJSON } from '$lib/utils/prompts';
	import { nowForChat } from '$lib/utils/date';

	let systemPrompt = `${imageToGigsJSON}. To help you infer the startDate when no year is given allow me to let you know that todays data is ${nowForChat()}. Good Luck. Be thourough! `;
	let imageFile = null;
	let resizedImageDataUrl = '';
	let responseText = '';
	let loading = false;

	async function resizeImageNoAspect(file, size = 1024, quality = 0.1) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const reader = new FileReader();

			reader.onload = (e) => {
				img.onload = () => {
					const canvas = document.createElement('canvas');
					canvas.width = size;
					canvas.height = size;
					const ctx = canvas.getContext('2d');

					// Draw image stretched to 512x512 without keeping aspect ratio
					ctx.drawImage(img, 0, 0, size, size);

					const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
					resolve(jpegDataUrl);
				};
				img.onerror = reject;
				img.src = e.target.result;
			};

			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	async function sendImagePrompt() {
		if (!resizedImageDataUrl) return;
		loading = true;
		responseText = '';

		const payload = {
			systemPrompt,
			imageBase64: resizedImageDataUrl
		};

		try {
			const response = await fetch('/api/openai/qabot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			const data = await response.json();
			responseText = data.answer;
		} catch (err) {
			console.error('Failed to send image prompt', err);
			responseText = 'Error sending image';
		} finally {
			loading = false;
		}
	}

	async function handleFileChange(e) {
		imageFile = e.target.files[0];
		if (imageFile) {
			resizedImageDataUrl = await resizeImageNoAspect(imageFile);
		}
	}
</script>

<div class="gap-4 page-center">
	<h1 class="text-4xl">OpenAI Vision Bot</h1>

	<p class="flex w-full">System Prompt:</p>
	<textarea id="systemPrompt" class="w-full h-[150px]" bind:value={systemPrompt} />

	<p class="flex w-full mt-4">Upload Image:</p>
	<input type="file" accept="image/*" on:change={handleFileChange} />

	{#if resizedImageDataUrl}
		<p class="mt-4">Preview (stretched to 1024x1024 JPEG):</p>
		<img
			src={resizedImageDataUrl}
			alt="Stretched Preview"
			class="mt-2 rounded shadow w-[1024px] h-[1024px]"
		/>
	{/if}

	<button on:click={sendImagePrompt} class="mt-4 btn">Send Image to OpenAI</button>

	{#if loading}
		<div class="mt-4 row">
			loading <img src="/pac-man.svg" alt="Loading" class="size-10" transition:slide />
		</div>
	{/if}

	{#if responseText}
		<p class="flex w-full mt-4">Answer:</p>
		<div class="rounded bg-white/15">
			<p class="p-4 rounded">{responseText}</p>
		</div>
	{/if}
</div>

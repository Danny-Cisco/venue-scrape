<script>
	import { slide } from 'svelte/transition';
	import { imageToGigsJSON } from '$lib/utils/prompts';
	import { nowForChat } from '$lib/utils/date';
	import CopyClipboard from '$lib/components/ui/CopyClipboard.svelte';

	let question = '';
	let systemPrompt = `${imageToGigsJSON}. To help you infer the startDate when no year is given allow me to let you know that todays data is ${nowForChat()}. Good Luck. Be thourough! `;
	let imageFile = null;
	let resizedImageDataUrl = '';
	let responseText = '';
	let prettyResponse = '';
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
			question,
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
			prettyResponse = JSON.stringify(JSON.parse(responseText), null, 2);
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

<div class="flex flex-col gap-4 overflow-y-auto">
	<h1 class="text-4xl font-fancy2">Image to Gigs</h1>

	<p class="flex w-full">System Prompt:</p>
	<textarea id="systemPrompt" class="w-full h-[150px] font-sans" bind:value={systemPrompt} />
	<p class="flex w-full">Prompt:</p>

	<textarea
		name="question"
		id="question"
		class="w-full font-sans"
		on:keydown={(e) => {
			if (e.key === 'Enter' && e.metaKey) sendQuestion();
		}}
		bind:value={question}
	/>

	<p class="flex w-full mt-4">Upload Image:</p>
	<input
		class="p-4 rounded-full border-[1px] flex w-full justify-around bg-white/30 border-white border-dashed hover:border-pink-500"
		type="file"
		accept="image/*"
		on:change={handleFileChange}
	/>

	<button on:click={sendImagePrompt} class="mt-4 btn">Send Image to OpenAI</button>
	{#if resizedImageDataUrl}
		<p class="mt-4">Preview (stretched to 1024x1024 JPEG):</p>
		<img
			src={resizedImageDataUrl}
			alt="Stretched Preview"
			class="mt-2 rounded shadow w-[1024px] h-[1024px]"
		/>
	{/if}
	{#if loading}
		<div class="mt-4 row">
			loading <img src="/pac-man.svg" alt="Loading" class="size-10" transition:slide />
		</div>
	{/if}

	{#if prettyResponse}
		<p class="w-full mt-4">Answer:</p>
		<div class="relative">
			<div class="absolute top-2 right-2">
				<CopyClipboard text={prettyResponse} />
			</div>

			<pre
				class="max-w-full p-4 text-xs whitespace-pre-wrap rounded bg-white/5">{prettyResponse}</pre>
		</div>
	{/if}
</div>

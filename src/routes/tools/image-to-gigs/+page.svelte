<script>
	import { slide } from 'svelte/transition';
	import { imageToGigsJSON } from '$lib/utils/prompts';
	import { nowForChat } from '$lib/utils/date';
	import CopyClipboard from '$lib/components/ui/CopyClipboard.svelte';

	let question = '';
	let systemPrompt = `${imageToGigsJSON}. To help you infer the startDate when no year is given allow me to let you know that todays data is ${nowForChat()}. Good Luck. Be thorough!`;
	let imageFile = null;
	let resizedImageDataUrl = '';
	let imageUrl = '';
	let useImageUrlInstead = false;
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

	async function handleFileChange(e) {
		const file = e.target?.files?.[0];
		if (file) {
			imageFile = file;
			resizedImageDataUrl = await resizeImageNoAspect(file);
		}
	}

	async function handleDrop(event) {
		event.preventDefault();
		const file = event.dataTransfer?.files?.[0];
		if (file && file.type.startsWith('image/')) {
			imageFile = file;
			resizedImageDataUrl = await resizeImageNoAspect(file);
		}
	}

	function allowDrop(event) {
		event.preventDefault();
	}

	async function sendImagePrompt() {
		if (!resizedImageDataUrl && !imageUrl) return;

		loading = true;
		responseText = '';
		prettyResponse = '';

		const payload = {
			systemPrompt,
			question
		};

		if (useImageUrlInstead && imageUrl) {
			payload.imageUrl = imageUrl;
		} else if (resizedImageDataUrl) {
			payload.imageBase64 = resizedImageDataUrl;
		}

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
</script>

<div class="flex flex-col gap-4 overflow-y-auto">
	<h1 class="text-4xl font-fancy2">Image to Gigs</h1>

	<p>System Prompt:</p>
	<textarea id="systemPrompt" class="w-full h-[150px] font-sans" bind:value={systemPrompt} />

	<p class="flex w-full">Prompt:</p>
	<textarea
		name="question"
		id="question"
		class="w-full font-sans"
		on:keydown={(e) => {
			if (e.key === 'Enter' && e.metaKey) sendImagePrompt();
		}}
		bind:value={question}
	/>

	<label class="flex items-center gap-2 mt-4">
		<input type="checkbox" bind:checked={useImageUrlInstead} />
		Use image URL instead of file upload
	</label>

	{#if useImageUrlInstead}
		<input
			type="url"
			class="w-full p-2 mt-2 font-mono border border-white rounded bg-white/10"
			placeholder="https://example.com/image.jpg"
			bind:value={imageUrl}
		/>
	{:else}
		<div
			class="p-4 mt-4 border-2 border-dashed rounded bg-white/30 hover:border-pink-500"
			on:drop={handleDrop}
			on:dragover={allowDrop}
		>
			<p class="text-center">Drag and drop an image here, or use the input below:</p>
			<input
				class="w-full p-2 mt-2 border border-white rounded bg-white/20"
				type="file"
				accept="image/*"
				on:change={handleFileChange}
			/>
		</div>
	{/if}

	<button on:click={sendImagePrompt} class="mt-4 btn">Send Image to OpenAI</button>

	{#if useImageUrlInstead && imageUrl}
		<p class="mt-4">Preview (from URL):</p>
		<img src={imageUrl} alt="Image URL Preview" class="mt-2 rounded shadow w-[1024px] h-[1024px]" />
	{:else if resizedImageDataUrl}
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

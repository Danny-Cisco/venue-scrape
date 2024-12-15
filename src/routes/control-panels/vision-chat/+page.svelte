<script>
	import { messages, updateSystemPrompt } from '$lib/stores/messages.js';
	import { capturedImage } from '$lib/stores/capturedImage.js';
	import { get } from 'svelte/store';
	import { fade } from 'svelte/transition';

	let userInput = '';
	let systemPrompt = '';
	let lensName = '';
	let secretKey = ''; // New secret key input
	let saveError = ''; // For tracking save errors

	$: if (systemPrompt.trim()) {
		updateSystemPrompt(systemPrompt);
	}

	$: if ($capturedImage) {
		sendMessage();
	}

	let isLoading = false;
	let errorMessage = '';

	// New function to save to Supabase
	async function saveToSupabase(content) {
		console.log('secret key:', secretKey);
		if (!secretKey.trim()) {
			createNewLens(content);
			return;
		}

		try {
			const response = await fetch(`/api/supabase/update?table=lenses`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					key: secretKey,
					lens_name: lensName,
					content: content,
					system_prompt: systemPrompt
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to save update');
			}

			const result = await response.json();
			console.log('Saved to Supabase:', result.updated_data);
			saveError = ''; // Clear any previous errors
		} catch (err) {
			console.error('Error saving to Supabase:', err);
			saveError = err.message;
		}
	}

	async function createNewLens(content) {
		console.log('BOOOOOP');
		try {
			const response = await fetch(`/api/supabase/create?table=lenses`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					key: secretKey,
					lens_name: lensName,
					content: content,
					system_prompt: systemPrompt
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to save update');
			}

			const result = await response.json();
			console.log('Saved to Supabase:', result.updated_data);
			saveError = ''; // Clear any previous errors
		} catch (err) {
			console.error('Error saving to Supabase:', err);
			saveError = err.message;
		}
	}

	async function sendMessage() {
		if (!userInput.trim() && !$capturedImage) return;

		isLoading = true;
		errorMessage = '';

		let newMessageContent = [];
		if (userInput.trim()) {
			newMessageContent.push({ type: 'text', text: userInput });
		}
		if ($capturedImage) {
			newMessageContent.push({
				type: 'image_url',
				image_url: { url: $capturedImage }
			});
		}

		if (newMessageContent.length > 0) {
			messages.update((msgs) => [...msgs, { role: 'user', content: newMessageContent }]);
		}

		userInput = '';
		// capturedImage.set(null);

		try {
			const response = await fetch('/api/openai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: get(messages) })
			});

			const data = await response.json();

			if (data.reply && data.reply.content) {
				messages.update((msgs) => [...msgs, { role: 'assistant', content: data.reply.content }]);

				await saveToSupabase(data.reply.content);
			} else {
				errorMessage = 'No reply received from the assistant.';
			}
		} catch (error) {
			console.error('❌ Error fetching server response:', error);
			errorMessage = "An error occurred while fetching the assistant's reply.";
		} finally {
			isLoading = false;
			scrollToBottom();
		}
	}

	function scrollToBottom() {
		const chatContainer = document.querySelector('#chat-container');
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}
</script>

<div class="absolute inset-0" in:fade>
	<div class="absolute top-0 flex flex-col w-full p-4 bottom-4">
		<!-- System Prompt and Secret Key inputs -->
		<div class="mb-4 space-y-4">
			<div>
				<label class="hidden block mb-2 font-bold text-gray-700">Secret Key:</label>
				<input
					class="w-full p-2 border rounded"
					type="text"
					bind:value={secretKey}
					placeholder="Enter secret key for auto-saving responses"
				/>
				{#if saveError}
					<p class="mt-1 text-sm text-red-500">{saveError}</p>
				{/if}
			</div>
			<div>
				<label class="block mb-2 font-bold text-gray-700">Lens Name:</label>
				<input
					class="w-full p-2 border rounded"
					type="text"
					bind:value={lensName}
					placeholder="Enter a name for this Lens"
				/>
			</div>
			<div>
				<label class="block mb-2 font-bold text-gray-700">Set System Prompt:</label>
				<textarea
					class="w-full p-2 border rounded h-36"
					type="text"
					bind:value={systemPrompt}
					placeholder="Enter System Prompt"
				/>
			</div>
		</div>

		<!-- Chat display -->
		<div id="chat-container" class="flex-1 mb-4 overflow-y-auto pb-[100px]">
			{#each $messages as message}
				<div class="py-2">
					{#if message.role !== 'system'}
						<p class="font-semibold">{message.role}:</p>
						{#each message.content as content}
							{#if content.type === 'text'}
								<p>{content.text}</p>
							{:else if content.type === 'image_url'}
								<div class="overflow-hidden rounded-xl">
									<img src={content.image_url.url} alt="image" />
								</div>
							{:else}
								{content}
							{/if}
						{/each}
					{/if}
				</div>
			{/each}
		</div>

		<!-- Error message -->
		{#if errorMessage}
			<p class="text-red-500">{errorMessage}</p>
		{/if}

		<!-- Loading indicator -->
		{#if isLoading}
			<p>Loading...</p>
		{/if}

		<!-- Input and actions -->
		<input class="w-full" bind:value={userInput} placeholder="Type a message" />

		<button
			class="btn rounded-full bg-white text-[magenta] mt-4 shadow"
			on:click={sendMessage}
			disabled={isLoading}>Send</button
		>
	</div>
</div>

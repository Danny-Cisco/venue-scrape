<script>
	import { messages, updateSystemMessage } from '$lib/stores/messages.js'; // Import the messages store and helper
	import { capturedImage } from '$lib/stores/capturedImage.js';
	import { get } from 'svelte/store';

	let userInput = '';
	let systemMessage = '';

	$: if (systemMessage.trim()) {
		// Update system message reactively
		updateSystemMessage(systemMessage);
	}

	$: if ($capturedImage) {
		sendMessage();
	}

	let isLoading = false; // To show a loading indicator
	let errorMessage = ''; // To display errors

	async function sendMessage() {
		if (!userInput.trim() && !$capturedImage) return;

		isLoading = true;
		errorMessage = '';

		// Create new message content
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

		// Add new user message to the store
		if (newMessageContent.length > 0) {
			messages.update((msgs) => [...msgs, { role: 'user', content: newMessageContent }]);
		}

		userInput = '';
		capturedImage.set(null);

		try {
			// Send messages to the server
			const response = await fetch('/api/openai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: get(messages) })
			});

			const data = await response.json();

			// Add assistant's reply to the store
			if (data.reply && data.reply.content) {
				messages.update((msgs) => [...msgs, { role: 'assistant', content: data.reply.content }]);
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
		// Scroll to the bottom of the chat
		const chatContainer = document.querySelector('#chat-container');
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}
</script>

<div class="absolute inset-0">
	<div class="absolute top-0 flex flex-col w-full p-4 bottom-4">
		<!-- System message input -->
		<div class="mb-4">
			<label class="block mb-2 font-bold text-gray-700">Set System Message:</label>
			<input
				class="w-full p-2 border rounded"
				type="text"
				bind:value={systemMessage}
				placeholder="Enter system message"
			/>
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
								<img src={content.image_url.url} alt="image" />
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
		{#if $capturedImage}
			<img src={$capturedImage} alt="preview" />
		{/if}
		<button
			class="btn rounded-full bg-white text-[magenta] mt-4 shadow"
			on:click={sendMessage}
			disabled={isLoading}>Send</button
		>
	</div>
</div>

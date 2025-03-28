<script>
	let message = '';
	let responseText = '';

	async function sendMessage() {
		console.log('BOBOBOBOP');
		const parsedMessage = await JSON.stringify(message);
		const response = await fetch('/api/openai/chat', {
			method: 'POST',
			body: { messages: [parsedMessage] }
		});
		responseText = response.json();
	}
</script>

<div class="gap-4 page-center">
	<h1>openai chat test</h1>

	<input type="text" bind:value={message} />

	<button on:click={sendMessage} class="btn">Send Message</button>
	<p>{responseText}</p>
</div>

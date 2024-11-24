import { writable } from 'svelte/store';

export const messages = writable([
	{
		role: 'system',
		content: [{ type: 'text', text: 'You are a helpful assistant.' }]
	}
]);

// Helper to update the system message
export function updateSystemMessage(newText) {
	messages.update((msgs) => {
		const systemMessage = msgs.find((msg) => msg.role === 'system');
		if (systemMessage) {
			systemMessage.content = [{ type: 'text', text: newText }];
		}
		return [...msgs];
	});
}

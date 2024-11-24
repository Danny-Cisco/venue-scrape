import { writable } from 'svelte/store';

export const messages = writable([
	{
		role: 'system',
		content: [{ type: 'text', text: 'You are a helpful assistant.' }]
	}
]);

// Helper to update the system message
export function updateSystemPrompt(newText) {
	messages.update((msgs) => {
		const systemPrompt = msgs.find((msg) => msg.role === 'system');
		if (systemPrompt) {
			systemPrompt.content = [{ type: 'text', text: newText }];
		}
		return [...msgs];
	});
}

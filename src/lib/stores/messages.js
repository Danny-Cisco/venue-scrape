import { writable } from 'svelte/store';

export const messages = writable([
	{
		role: 'system',
		content: [{ type: 'text', text: 'You are a helpful assistant.' }]
	}
]);

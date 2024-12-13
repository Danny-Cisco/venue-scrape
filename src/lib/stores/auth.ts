// stores/auth.ts
import { writable } from 'svelte/store';

export const message = writable('');
export const error = writable('');
export const loading = writable(false);

import { writable } from 'svelte/store';

// Create the writable store
export const isRecording = writable(false);
export const start = writable(false);
export const stop = writable(false);

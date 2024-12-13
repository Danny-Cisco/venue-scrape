// stores/video.ts
import { writable } from 'svelte/store';

export const triggerStartStream = writable(false);
export const triggerStopStream = writable(false);

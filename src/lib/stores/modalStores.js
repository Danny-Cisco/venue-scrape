import { writable } from 'svelte/store';

export const lastClicked = writable({});

export const showGigModal = writable(false);

export const showBandModal = writable(false);

export const showMapsModal = writable(true);

import { writable } from 'svelte/store';

// Initialize the store with a default structure
const defaultStore = {
	CategoryNames: [],
	NumberOfCategories: 0
	// The individual category arrays will be added dynamically
};

// Create the writable store
export const categoryStore = writable(defaultStore);

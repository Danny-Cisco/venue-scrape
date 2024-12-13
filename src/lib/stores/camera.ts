// src/lib/stores/deviceStore.js
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const createPersistentDevice = () => {
	// Only access localStorage when in the browser
	const initialValue = browser ? localStorage.getItem('selectedDeviceId') : null;
	console.log('🚀 ~ createPersistentDevice ~ initialValue:', initialValue);

	const store = writable(initialValue);

	if (browser) {
		// Update localStorage when the store changes
		store.subscribe((value) => {
			if (value === null) {
				localStorage.removeItem('selectedDeviceId');
			} else {
				localStorage.setItem('selectedDeviceId', value);
			}
		});
	}

	return store;
};

export const selectedDevice = createPersistentDevice();

export const videoElement = writable();

export interface VideoDevice {
	deviceId: string;
	label: string;
	kind: 'videoinput';
}

export const devices = writable<VideoDevice[]>([]);
// export const selectedDevice = writable<string>('');
export const permissionStatus = writable<'pending' | 'granted' | 'denied' | 'error'>('pending');

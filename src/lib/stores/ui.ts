// stores/ui.ts
import { writable } from 'svelte/store';

export const showLeftSidebar = writable(true);
export const showRightSidebar = writable(true);
export const showCameraSettingsModal = writable(false);

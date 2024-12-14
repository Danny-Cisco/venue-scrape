// utils/camera.ts
import { devices, permissionStatus } from '../stores/camera';

export async function requestCameraPermission() {
	try {
		const result = await navigator.permissions.query({ name: 'camera' });
		if (result.state === 'granted') {
			permissionStatus.set('granted');
			await getVideoDevices();
		} else if (result.state === 'prompt') {
			try {
				await navigator.mediaDevices.getUserMedia({ video: true });
				permissionStatus.set('granted');
				await getVideoDevices();
			} catch (error) {
				console.error('Permission denied or error occurred:', error);
				permissionStatus.set('denied');
			}
		} else {
			permissionStatus.set('denied');
			console.error('Camera permission denied');
		}
		result.addEventListener('change', (e) => {
			permissionStatus.set(e.target.state);
			if (e.target.state === 'granted') {
				getVideoDevices();
			}
		});
	} catch (error) {
		console.error('Error checking camera permissions:', error);
		permissionStatus.set('error');
	}
}

export async function getVideoDevices() {
	try {
		const allDevices = await navigator.mediaDevices.enumerateDevices();
		const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');
		devices.set(videoDevices);
	} catch (error) {
		console.error('Error enumerating devices:', error);
	}
}

import { capturedImage } from '$lib/stores/capturedImage.js';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { videoElement, devices, selectedDevice, permissionStatus } from '$lib/stores/camera';
import GIF from 'gif.js'; // Ensure gif.js is installed: npm install gif.js

export function captureImage() {
	capturedImage.set('');
	tick().then(() => {
		setTimeout(() => {
			if (!get(selectedDevice)) return;
			const canvas = document.createElement('canvas');
			canvas.width = get(videoElement).videoWidth;
			canvas.height = get(videoElement).videoHeight;

			const context = canvas.getContext('2d');
			context.drawImage(get(videoElement), 0, 0, canvas.width, canvas.height);

			const imageData = canvas.toDataURL('image/png');
			capturedImage.set(imageData);
		}, 10);
	});
}

export function quantizeToBlackAndWhite(context, width, height) {
	// Get the pixel data from the canvas
	const imageData = context.getImageData(0, 0, width, height);
	const data = imageData.data;

	// Loop through each pixel and modify it
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		// Calculate the luminance (perceptual brightness)
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

		// Threshold to decide black or white
		const isWhite = luminance > 127; // Threshold can be adjusted
		const color = isWhite ? 255 : 0;

		// Set the pixel to black or white
		data[i] = color; // Red
		data[i + 1] = color; // Green
		data[i + 2] = color; // Blue
	}

	// Put the modified pixel data back into the canvas
	context.putImageData(imageData, 0, 0);
}

export function quantizeToBasicColors(
	context,
	width,
	height,
	saturationThreshold = 0.4,
	lightnessThreshold = 0.8
) {
	// Get the pixel data from the canvas
	const imageData = context.getImageData(0, 0, width, height);
	const data = imageData.data;

	// Define the target colors: black, white, and fully saturated colors
	const colors = [
		{ r: 0, g: 0, b: 0, name: 'black' }, // Black
		{ r: 255, g: 255, b: 255, name: 'white' }, // White
		{ r: 255, g: 0, b: 0, name: 'red' }, // Red
		{ r: 0, g: 255, b: 0, name: 'green' }, // Green
		{ r: 0, g: 0, b: 255, name: 'blue' }, // Blue
		{ r: 255, g: 255, b: 0, name: 'yellow' }, // Yellow
		{ r: 0, g: 255, b: 255, name: 'cyan' }, // Cyan
		{ r: 255, g: 0, b: 255, name: 'magenta' } // Magenta
	];

	// Helper function to convert RGB to HSL
	function rgbToHsl(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h,
			s,
			l = (max + min) / 2;

		if (max === min) {
			h = s = 0; // Achromatic (no hue, no saturation)
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return [h, s, l]; // Hue, Saturation, Lightness
	}

	// Loop through each pixel and quantize it
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		// Convert RGB to HSL
		const [h, s, l] = rgbToHsl(r, g, b);

		let mappedColor;

		// Step 1: Map high lightness pixels to white
		if (l > lightnessThreshold) {
			mappedColor = colors.find((c) => c.name === 'white');
		}
		// Step 2: Map low saturation pixels to black or white based on lightness
		else if (s < saturationThreshold) {
			mappedColor =
				l < 0.5 ? colors.find((c) => c.name === 'black') : colors.find((c) => c.name === 'white');
		}
		// Step 3: Map high saturation pixels based on hue
		else {
			if (h >= 0.1 && h < 0.2) {
				mappedColor = colors.find((c) => c.name === 'yellow'); // Yellow range
			} else if ((h >= 0 && h < 0.1) || (h >= 0.9 && h <= 1.0)) {
				mappedColor = colors.find((c) => c.name === 'red'); // Red range
			} else if (h >= 0.2 && h < 0.4) {
				mappedColor = colors.find((c) => c.name === 'green'); // Green range
			} else if (h >= 0.4 && h < 0.6) {
				mappedColor = colors.find((c) => c.name === 'cyan'); // Cyan range
			} else if (h >= 0.6 && h < 0.8) {
				mappedColor = colors.find((c) => c.name === 'blue'); // Blue range
			} else if (h >= 0.8 && h < 0.9) {
				mappedColor = colors.find((c) => c.name === 'magenta'); // Magenta range
			}
		}

		// Apply the mapped color to the pixel
		data[i] = mappedColor.r; // Red
		data[i + 1] = mappedColor.g; // Green
		data[i + 2] = mappedColor.b; // Blue
	}

	// Put the modified pixel data back into the canvas
	context.putImageData(imageData, 0, 0);
}

export function captureImageAsGif() {
	const squish512x512 = false;
	// Reset the store to indicate we're starting a new capture
	capturedImage.set('');

	console.log('Capturing GIF image...');

	// Use tick() to ensure the DOM has updated before we proceed
	tick().then(() => {
		// Small delay to ensure the camera frame is ready
		setTimeout(() => {
			// Safety check for device selection
			if (!get(selectedDevice)) {
				console.error('No camera device selected');
				return;
			}

			// Create a canvas to capture the current video frame
			const canvas = document.createElement('canvas');

			// Safety checks for video element
			if (!get(videoElement) || !get(videoElement).videoWidth) {
				console.error('Video element not ready');
				return;
			}

			// Set canvas dimensions to match video
			canvas.width = get(videoElement).videoWidth;
			canvas.height = get(videoElement).videoHeight;

			// Get the drawing context and capture the current frame
			const context = canvas.getContext('2d');
			if (!context) {
				console.error('Could not get canvas context');
				return;
			}

			// Draw the current video frame onto the canvas
			context.drawImage(get(videoElement), 0, 0, canvas.width, canvas.height);

			// Quantize the canvas to black and white
			// quantizeToBlackAndWhite(context, canvas.width, canvas.height);

			// Quantize the canvas to basic colors
			// quantizeToBasicColors(context, canvas.width, canvas.height);

			const saturationFactor = 2;

			captureImageWithSaturationAndQuantization(
				context,
				canvas.width,
				canvas.height,
				saturationFactor
			);

			// Perform the resize operation while maintaining content
			const finalCanvas = squish512x512 ? resizeCanvas(canvas, 512, 512) : canvas;

			// Configure our GIF encoder with optimal settings
			const gif = new GIF({
				workers: 2, // Use 2 worker threads for better performance
				quality: 10, // Lower number means better compression
				workerScript: '/gif.worker.js', // Path to worker script in public directory
				width: finalCanvas.width,
				height: finalCanvas.height
			});

			// Add the single frame to our GIF
			gif.addFrame(finalCanvas, {
				delay: 100, // Frame delay in milliseconds
				copy: true // Make a copy of the canvas data for safety
			});

			// Handle successful GIF creation
			gif.on('finished', (blob) => {
				const reader = new FileReader();
				reader.onload = function () {
					const base64String = reader.result.split(',')[1];
					const fileSizeKB = (blob.size / 1024).toFixed(2);
					console.log(`GIF file size: ${fileSizeKB} KB`);
					capturedImage.set(`data:image/gif;base64,${base64String}`);
				};
				reader.readAsDataURL(blob);
			});

			gif.on('error', (error) => {
				console.error('Error creating GIF:', error);
				capturedImage.set('');
			});

			gif.render();
		}, 10);
	});
}

export function captureImageWithSaturationAndQuantization(
	context,
	width,
	height,
	saturationFactor
) {
	// Increase saturation first
	adjustSaturation(context, width, height, saturationFactor);

	// Then quantize to the basic color palette
	quantizeToBasicColors(context, width, height);
}

export function adjustSaturation(context, width, height, saturationFactor = 5) {
	// Get the pixel data from the canvas
	const imageData = context.getImageData(0, 0, width, height);
	const data = imageData.data;

	// Helper to convert RGB to HSL
	function rgbToHsl(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h,
			s,
			l = (max + min) / 2;

		if (max === min) {
			h = s = 0; // achromatic
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return [h, s, l];
	}

	// Helper to convert HSL back to RGB
	function hslToRgb(h, s, l) {
		let r, g, b;

		function hueToRgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hueToRgb(p, q, h + 1 / 3);
			g = hueToRgb(p, q, h);
			b = hueToRgb(p, q, h - 1 / 3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	// Loop through each pixel and adjust saturation
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		// Convert RGB to HSL
		let [h, s, l] = rgbToHsl(r, g, b);

		// Increase saturation
		s *= saturationFactor;
		s = Math.min(1, Math.max(0, s)); // Clamp between 0 and 1

		// Convert HSL back to RGB
		const [newR, newG, newB] = hslToRgb(h, s, l);

		// Update pixel data
		data[i] = newR;
		data[i + 1] = newG;
		data[i + 2] = newB;
	}

	// Put the modified pixel data back into the canvas
	context.putImageData(imageData, 0, 0);
}

export function resizeCanvas(sourceCanvas, targetWidth, targetHeight) {
	// Create an intermediate canvas for the resize operation
	const resizedCanvas = document.createElement('canvas');
	resizedCanvas.width = targetWidth;
	resizedCanvas.height = targetHeight;
	const resizedContext = resizedCanvas.getContext('2d');

	// Calculate scaling factors for width and height
	const scaleX = targetWidth / sourceCanvas.width;
	const scaleY = targetHeight / sourceCanvas.height;

	// Apply the transformation to squish the image
	resizedContext.scale(scaleX, scaleY);

	// Draw the image with the applied transformation
	resizedContext.drawImage(sourceCanvas, 0, 0);

	// Log the transformation details
	console.log(
		`Canvas squished from ${sourceCanvas.width}x${sourceCanvas.height} to ${targetWidth}x${targetHeight}`,
		`Scale factors: x=${scaleX.toFixed(2)}, y=${scaleY.toFixed(2)}`
	);

	return resizedCanvas;
}

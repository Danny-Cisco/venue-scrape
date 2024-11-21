<script>
	import { writable } from 'svelte/store';

	// Define reactive values for parameters
	let repeats = 12; // Number of circles
	let spacing = 15; // Spacing between circles
	const strokeWidth = 2; // Stroke width for the circles
	let strokeColor = 'magenta'; // Default stroke color

	// Origin options: top-left, top-right, bottom-left, bottom-right
	let origin = 'bottom-left'; // Default origin

	// Store for the generated SVG code
	const svgCode = writable('');

	// Function to generate the SVG dynamically
	function generateSVG() {
		const svgNamespace = 'http://www.w3.org/2000/svg';
		const maxRadius = (repeats + 1) * spacing; // Maximum radius of the largest circle
		const padding = spacing + strokeWidth; // Padding for the smallest circle and stroke width
		const canvasSize = maxRadius * 2 + padding * 2; // Ensure the largest circle fits in the canvas with padding

		let svg = `<svg xmlns="${svgNamespace}" viewBox="0 0 ${canvasSize} ${canvasSize}" width="200" height="200" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}">`;

		for (let i = 0; i < repeats; i++) {
			let offset = i * spacing + padding; // Offset for the center of each circle
			let radius = (i + 1) * spacing; // Radius of each circle

			// Determine the circle's position based on the origin
			let cx, cy;
			switch (origin) {
				case 'top-left':
					cx = offset;
					cy = offset;
					break;
				case 'top-right':
					cx = canvasSize - offset;
					cy = offset;
					break;
				case 'bottom-left':
					cx = offset;
					cy = canvasSize - offset;
					break;
				case 'bottom-right':
					cx = canvasSize - offset;
					cy = canvasSize - offset;
					break;
			}

			// Add the circle to the SVG
			svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" />`;
		}

		svg += `</svg>`;
		svgCode.set(svg);
	}

	// Trigger initial SVG generation
	generateSVG();
</script>

<div class="controls">
	<label>
		Number of Circles:
		<input type="number" bind:value={repeats} min="1" max="50" step="1" />
	</label>

	<label>
		Spacing:
		<input type="number" bind:value={spacing} min="1" max="50" step="1" />
	</label>

	<label>
		Stroke Color:
		<input type="color" bind:value={strokeColor} />
	</label>

	<div class="buttons">
		<!-- Buttons to set the origin -->
		<button on:click={() => (origin = 'top-left')}>Origin: Top-Left</button>
		<button on:click={() => (origin = 'top-right')}>Origin: Top-Right</button>
		<button on:click={() => (origin = 'bottom-left')}>Origin: Bottom-Left</button>
		<button on:click={() => (origin = 'bottom-right')}>Origin: Bottom-Right</button>
	</div>

	<!-- Re-generate SVG -->
	<button class="generate-button" on:click={generateSVG}>Generate SVG</button>
</div>

<!-- Display the generated SVG -->
<div>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 {(repeats + 1) * spacing * 2 + (spacing + strokeWidth) * 2} {(repeats + 1) *
			spacing *
			2 +
			(spacing + strokeWidth) * 2}"
		width="200"
		height="200"
		fill="none"
		stroke={strokeColor}
		stroke-width={strokeWidth}
	>
		{#each Array(repeats) as _, i}
			<circle
				cx={origin === 'top-left'
					? i * spacing + spacing + strokeWidth
					: origin === 'top-right'
						? (repeats + 1) * spacing * 2 +
							(spacing + strokeWidth) -
							(i * spacing + spacing + strokeWidth)
						: origin === 'bottom-left'
							? i * spacing + spacing + strokeWidth
							: (repeats + 1) * spacing * 2 +
								(spacing + strokeWidth) -
								(i * spacing + spacing + strokeWidth)}
				cy={origin === 'top-left'
					? i * spacing + spacing + strokeWidth
					: origin === 'top-right'
						? i * spacing + spacing + strokeWidth
						: origin === 'bottom-left'
							? (repeats + 1) * spacing * 2 +
								(spacing + strokeWidth) -
								(i * spacing + spacing + strokeWidth)
							: (repeats + 1) * spacing * 2 +
								(spacing + strokeWidth) -
								(i * spacing + spacing + strokeWidth)}
				r={(i + 1) * spacing}
			/>
		{/each}
	</svg>
</div>

<!-- Textarea for the SVG code -->
<div>
	<label>
		SVG Code:
		<textarea readonly bind:value={$svgCode}></textarea>
	</label>
	<button on:click={() => navigator.clipboard.writeText($svgCode)}>Copy SVG Code</button>
</div>

<style>
	.controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 300px;
		margin-bottom: 2rem;
	}

	textarea {
		width: 100%;
		height: 150px;
		font-family: monospace;
		font-size: 0.9rem;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.generate-button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.generate-button:hover {
		background-color: #45a049;
	}

	button {
		padding: 0.5rem 1rem;
		background-color: #f0f0f0;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #e0e0e0;
	}

	svg {
		display: block;
		margin: 0 auto;
	}
</style>

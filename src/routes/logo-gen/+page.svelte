<script>
	import { writable } from 'svelte/store';

	// Define reactive values for parameters
	let repeats = 10; // Number of circles
	let spacing = 10; // Spacing between circles
	const strokeWidth = 2; // Stroke width for the circles

	// Store for the generated SVG code
	const svgCode = writable('');

	// Function to generate the SVG dynamically
	function generateSVG() {
		const svgNamespace = 'http://www.w3.org/2000/svg';
		const maxRadius = (repeats + 1) * spacing; // Maximum radius of the largest circle
		const padding = spacing + strokeWidth; // Padding for the smallest circle and stroke width
		const canvasSize = maxRadius * 2 + padding * 2; // Ensure the largest circle fits in the canvas with padding

		let svg = `<svg xmlns="${svgNamespace}" viewBox="0 0 ${canvasSize} ${canvasSize}" width="200" height="200" fill="none" stroke="magenta" stroke-width="${strokeWidth}">`;

		for (let i = 0; i < repeats; i++) {
			let offset = i * spacing + padding; // Center offset includes padding
			let radius = (i + 1) * spacing; // Radius of each circle
			svg += `<circle cx="${offset}" cy="${offset}" r="${radius}" />`;
		}

		svg += `</svg>`;
		svgCode.set(svg);
	}

	// Trigger initial SVG generation
	$: generateSVG();
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

	<button on:click={generateSVG}>Generate SVG</button>
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
		stroke="magenta"
		stroke-width={strokeWidth}
	>
		{#each Array(repeats) as _, i}
			<circle
				cx={i * spacing + spacing + strokeWidth}
				cy={i * spacing + spacing + strokeWidth}
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

	svg {
		display: block;
		margin: 0 auto;
	}
</style>

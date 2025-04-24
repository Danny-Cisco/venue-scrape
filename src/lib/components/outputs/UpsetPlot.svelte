<script>
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';
	import { slide } from 'svelte/transition';
	// --- Default Data ---
	const defaultData = [
		{ name: 'Set A', values: ['a', 'b', 'c', 'd', 'x'] },
		{ name: 'Set B', values: ['a', 'b', 'c', 'e', 'f', 'y'] },
		{ name: 'Set C', values: ['a', 'g', 'h', 'i', 'x', 'y'] },
		{ name: 'Set D', values: ['a', 'i', 'j', 'c', 'd', 'z'] }
	];

	// --- Component Props ---
	/** Input data: Array<{name: string, values: any[]}> */
	export let data = defaultData;
	/** How to handle solo sets: 'all', 'outersect', 'none' */
	export let soloSetMode = 'all';
	/** Optional CSS class */
	export let className = '';
	/** Base color for active elements */
	export let color = 'hsl(210, 60%, 60%)'; // A blue similar to the example
	/** Color for inactive elements */
	export let inactiveColor = '#555'; // Light grey
	/** Width of the set size bar chart area */
	export let setPlotWidth = 150;
	/** Height of the intersection size bar chart area */
	export let intersectionPlotHeight = 200;
	/** Size of the dots in the matrix */
	export let circleRadius = 5;
	/** Vertical space allocated for each set row in the matrix/set plot */
	export let setRowHeight = 24;
	/** Width of the bars in the intersection plot */
	export let intersectionBarWidth = 12;

	// --- Internal State ---
	let container;
	let tooltipCleanup = null;

	let showSingleDotsSelection = false;

	// --- Constants ---
	const MARGIN = { top: 10, right: 200, bottom: 10, left: 100 }; // Margins *around* the entire compound plot
	const MATRIX_AXIS_GAP = 30; // Gap between matrix/set plot and intersection plot/axis
	const SET_LABEL_OFFSET = 5; // Space between set bar edge and label

	// --- Data Formatting Logic ---
	const formatIntersectionData = (inputData) => {
		// --- Initial Setup & Validation ---
		if (!inputData || !Array.isArray(inputData) || inputData.length === 0) {
			console.warn('UpsetPlotStyled: Invalid or empty input data.');
			return { intersections: [], soloSetsWithTotals: [] };
		}
		if (
			!inputData.every(
				(item) =>
					typeof item === 'object' &&
					item !== null &&
					'name' in item &&
					'values' in item &&
					Array.isArray(item.values)
			)
		) {
			console.error(
				'UpsetPlotStyled: Invalid data format. Expected [{name: string, values: any[]}].'
			);
			// Provide minimal valid output to avoid downstream errors
			const validSoloTotals = inputData
				.filter(
					(item) =>
						typeof item === 'object' &&
						item !== null &&
						'name' in item &&
						'values' in item &&
						Array.isArray(item.values)
				)
				.map((x, i) => ({
					name: x.name,
					setName: `S${i}`, // Simple naming if default fails
					num: x.values.length,
					values: x.values
				}));
			return { intersections: [], soloSetsWithTotals: validSoloTotals };
		}

		const setInternalNameChars =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.substr(0, inputData.length);
		if (inputData.length > setInternalNameChars.length) {
			console.warn(
				'UpSet Plot: More sets than available characters for internal naming. Plot might be incorrect.'
			);
		}

		const allSetData = inputData.map((x, i) => ({
			name: x.name,
			setName: setInternalNameChars.substr(i, 1),
			valuesSet: new Set(Array.isArray(x.values) ? x.values : []), // Use Sets for efficiency
			originalNum: Array.isArray(x.values) ? x.values.length : 0,
			originalValues: Array.isArray(x.values) ? x.values : [] // Keep original array too
		}));

		const allValues = new Set(allSetData.flatMap((s) => Array.from(s.valuesSet)));

		// --- 1. Calculate All Exclusive Intersection Segments ---
		let allExclusiveSegments = [];
		allValues.forEach((value) => {
			const belongingSetChars = [];
			allSetData.forEach((set) => {
				if (set.valuesSet.has(value)) {
					belongingSetChars.push(set.setName);
				}
			});

			if (belongingSetChars.length > 0) {
				const combinationSetName = belongingSetChars.sort().join('');
				let existing = allExclusiveSegments.find((d) => d.setName === combinationSetName);
				if (existing) {
					existing.values.push(value);
					existing.num++;
				} else {
					const originalNames = belongingSetChars
						.map((setChar) => {
							const set = allSetData.find((s) => s.setName === setChar);
							return set ? set.name : '?';
						})
						.join(' + '); // Name reflects the combination

					allExclusiveSegments.push({
						name: originalNames, // Derived name for the combination
						setName: combinationSetName,
						num: 1,
						values: [value],
						isSolo: belongingSetChars.length === 1 // Flag for easier filtering
					});
				}
			}
		});

		// Filter out zero-count segments (shouldn't happen here, but good practice)
		allExclusiveSegments = allExclusiveSegments.filter((d) => d.num > 0);

		// --- 2. Separate Exclusive Solos and Multisets ---
		const exclusiveSolos = allExclusiveSegments.filter((d) => d.isSolo);
		const exclusiveMultisets = allExclusiveSegments.filter((d) => !d.isSolo);

		// --- 3 & 4. Process based on soloSetMode ---
		let finalIntersectionsForPlot = [...exclusiveMultisets]; // Start with multisets (always exclusive)

		if (soloSetMode === 'all') {
			// Use TOTAL counts for solo sets
			allSetData.forEach((setInfo) => {
				// Check if this set actually has any elements (edge case)
				if (setInfo.originalNum > 0) {
					// Add an entry representing the *total* size of the set
					finalIntersectionsForPlot.push({
						name: setInfo.name, // Original name
						setName: setInfo.setName,
						num: setInfo.originalNum, // TOTAL number
						values: setInfo.originalValues, // All original values
						isSolo: true // Mark it as a solo representation
					});
				}
			});
		} else if (soloSetMode === 'outersect') {
			// Use EXCLUSIVE counts for solo sets (already calculated)
			// Add the non-empty exclusive solos back
			finalIntersectionsForPlot.push(...exclusiveSolos.filter((s) => s.num > 0));
			// Ensure the name is the original set name for these solos
			finalIntersectionsForPlot = finalIntersectionsForPlot.map((d) => {
				if (d.isSolo && d.setName.length === 1) {
					const soloInfo = allSetData.find((s) => s.setName === d.setName);
					return { ...d, name: soloInfo ? soloInfo.name : d.name };
				}
				return d;
			});
		} // else soloSetMode === 'none', do nothing, solos are excluded

		// --- 5. Prepare Data for Left Bars (Always Total Size) ---
		const soloSetsWithTotals = allSetData.map((s) => ({
			name: s.name,
			setName: s.setName,
			num: s.originalNum, // Use the original total count
			values: s.originalValues // Use original values array
		}));

		// --- Return final data structures ---
		// Filter final plot data again just in case a mode resulted in zero counts being added
		finalIntersectionsForPlot = finalIntersectionsForPlot.filter((d) => d.num > 0);

		return { intersections: finalIntersectionsForPlot, soloSetsWithTotals };
	};

	// --- Plotting Logic ---
	const plotUpsetStyled = (plotData, soloSetsInfo, containerElement) => {
		d3.select(containerElement).select('svg').remove(); // Clear previous
		d3.select(containerElement).select('p').remove(); // Clear messages

		if (!plotData || plotData.length === 0 || !soloSetsInfo || soloSetsInfo.length === 0) {
			console.warn('UpsetPlotStyled: No data to plot.');
			d3.select(containerElement).append('p').text('No data available for styled UpSet plot.');
			return null;
		}

		// --- Data Prep ---
		const sortedIntersections = [...plotData].sort((a, b) => b.num - a.num);
		// Ensure consistent order for sets (e.g., alphabetical by name)
		const sortedSets = [...soloSetsInfo].sort((a, b) => a.name.localeCompare(b.name));
		const setNames = sortedSets.map((d) => d.name); // For scale domain

		// --- Dimensions ---
		const matrixWidth = sortedIntersections.length * (intersectionBarWidth * 1.8); // Width based on bars
		const matrixHeight = sortedSets.length * setRowHeight;

		// --- CONSTANTS (defined above in script scope) ---
		// MARGIN, MATRIX_AXIS_GAP, SET_LABEL_OFFSET

		const totalWidth = MARGIN.left + setPlotWidth + matrixWidth + MARGIN.right;
		const totalHeight =
			MARGIN.top + intersectionPlotHeight + matrixHeight + MATRIX_AXIS_GAP + MARGIN.bottom;

		// --- SVG Setup ---
		const svg = d3
			.select(containerElement)
			.append('svg')
			.attr('width', totalWidth)
			.attr('height', totalHeight)
			.attr('class', 'upset-plot-styled-svg');

		const mainGroup = svg.append('g').attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

		// --- Scales ---
		// Intersection Plot (Top Right)
		const xIntersectionScale = d3
			.scaleBand()
			.domain(d3.range(sortedIntersections.length))
			.range([0, matrixWidth])
			.paddingInner(0.3) // Space between intersection bars
			.paddingOuter(0.15);

		const yIntersectionScale = d3
			.scaleLinear()
			.domain([0, d3.max(sortedIntersections, (d) => d.num) || 1])
			.range([intersectionPlotHeight, 0])
			.nice();

		// Set Plot (Bottom Left) - REVERSED RANGE
		const xSetScale = d3
			.scaleLinear()
			.domain([0, d3.max(sortedSets, (d) => d.num) || 1])
			// REVERSE the range: max value maps to 0 (left), 0 maps to setPlotWidth (right)
			.range([setPlotWidth, 0])
			.nice();

		const ySetScale = d3
			.scaleBand()
			.domain(setNames) // Use sorted set names
			.range([0, matrixHeight])
			.paddingInner(0.1); // Space between set bars/rows

		// --- Axes ---
		// Intersection Size Axis (Left of Intersection Plot)
		const yIntersectionAxis = d3.axisLeft(yIntersectionScale).ticks(5).tickSizeOuter(0);
		mainGroup
			.append('g')
			.attr('class', 'y-axis intersection-axis')
			.attr('transform', `translate(${setPlotWidth}, 0)`) // Position left of matrix/intersection bars
			.call(yIntersectionAxis)
			.call((g) => g.select('.domain').remove())
			.call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0.2).attr('x2', -5));

		// Set Size Axis (Top of Set Plot) - Uses the reversed xSetScale
		const xSetAxis = d3.axisTop(xSetScale).ticks(3).tickSizeOuter(0); // Axis function handles reversed scale
		mainGroup
			.append('g')
			.attr('class', 'x-axis set-axis')
			.attr('transform', `translate(0, ${intersectionPlotHeight + MATRIX_AXIS_GAP})`) // Position above set bars
			.call(xSetAxis)
			.call((g) => g.select('.domain').remove())
			.call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0.2).attr('y2', 5));

		// --- Plot Elements ---

		// 1. Intersection Size Plot (Top Right)
		const intersectionPlotG = mainGroup
			.append('g')
			.attr('id', 'intersection-plot')
			.attr('transform', `translate(${setPlotWidth}, 0)`);

		intersectionPlotG
			.append('line') // Base line at 0
			.attr('class', 'base-line')
			.attr('x1', 0)
			.attr('x2', matrixWidth)
			.attr('y1', yIntersectionScale(0))
			.attr('y2', yIntersectionScale(0));

		const intersectionBars = intersectionPlotG
			.selectAll('.intersection-bar')
			.data(sortedIntersections, (d) => d.setName)
			.join('rect')
			.attr('class', 'intersection-bar')
			.attr('x', (d, i) => xIntersectionScale(i))
			.attr('y', (d) => yIntersectionScale(d.num))
			.attr('width', intersectionBarWidth) // Use fixed width
			.attr('height', (d) => Math.max(0, yIntersectionScale(0) - yIntersectionScale(d.num)))
			.attr('fill', color);

		// 2. Set Size Plot (Bottom Left) - RIGHT JUSTIFIED BARS
		const setPlotG = mainGroup
			.append('g')
			.attr('id', 'set-plot')
			.attr('transform', `translate(0, ${intersectionPlotHeight + MATRIX_AXIS_GAP})`); // Below intersection plot + gap

		setPlotG
			.selectAll('.set-bar')
			.data(sortedSets, (d) => d.setName)
			.join('rect')
			.attr('class', 'set-bar')
			// Bar starts at the scaled value (which is further left for higher numbers)
			.attr('x', (d) => xSetScale(d.num))
			.attr('y', (d) => ySetScale(d.name) + 3)
			// Width is the distance from the bar start to the right edge (xSetScale(0))
			.attr('width', (d) => xSetScale(0) - xSetScale(d.num))
			.attr('height', ySetScale.bandwidth() - 6)
			.attr('fill', color);

		// Set Labels (Left of Set Bars) - TEXT ANCHOR END
		setPlotG
			.selectAll('.set-label')
			.data(sortedSets, (d) => d.setName)
			.join('text')
			.attr('class', 'set-label')
			// Position text slightly to the LEFT of the bar's start
			.attr('x', (d) => xSetScale(d.num) - SET_LABEL_OFFSET)
			.attr('y', (d) => ySetScale(d.name) + ySetScale.bandwidth() / 2)
			.attr('dy', '0.35em') // Vertical alignment
			// Align the END of the text to the calculated x position
			.attr('text-anchor', 'end')
			.text((d) => `${d.name} (${d.num})`);

		// 3. Membership Matrix (Bottom Right)
		const matrixG = mainGroup
			.append('g')
			.attr('id', 'membership-matrix')
			.attr('transform', `translate(${setPlotWidth}, ${intersectionPlotHeight + MATRIX_AXIS_GAP})`); // Align with plots

		// Background stripes (optional)
		matrixG
			.selectAll('.matrix-bg-stripe')
			.data(d3.range(sortedSets.length))
			.join('rect')
			.attr('class', 'matrix-bg-stripe')
			.attr('x', 0)
			.attr('y', (d, i) => ySetScale(sortedSets[i].name))
			.attr('width', matrixWidth)
			.attr('height', ySetScale.bandwidth())
			.attr('fill', (d, i) => (i % 2 === 0 ? '#234' : 'transparent')); // Alternating subtle background

		// Dots and Lines per Intersection
		sortedIntersections.forEach((intersectionData, i) => {
			const intersectionX = xIntersectionScale(i) + intersectionBarWidth / 2; // Center X for this intersection
			const participatingSetNames = sortedSets
				.filter((set) => intersectionData.setName.includes(set.setName))
				.map((set) => set.name); // Get names of sets in this intersection

			// Draw dots for ALL sets (active or inactive)
			sortedSets.forEach((set) => {
				matrixG
					.append('circle')
					.attr('class', 'matrix-dot')
					.attr('cx', intersectionX)
					.attr('cy', ySetScale(set.name) + ySetScale.bandwidth() / 2)
					.attr('r', circleRadius)
					.attr('fill', participatingSetNames.includes(set.name) ? color : inactiveColor);
			});

			// Draw connecting line if intersection has > 1 set
			if (participatingSetNames.length > 1) {
				const yPositions = participatingSetNames.map(
					(name) => ySetScale(name) + ySetScale.bandwidth() / 2
				);
				matrixG
					.append('line')
					.attr('class', 'matrix-line')
					.attr('x1', intersectionX)
					.attr('x2', intersectionX)
					.attr('y1', d3.min(yPositions))
					.attr('y2', d3.max(yPositions))
					.attr('stroke', color)
					.attr('stroke-width', 2);
			}
		});

		// --- Tooltip ---
		let tooltip = d3.select('body').select('.upset-tooltip-styled');
		if (tooltip.empty()) {
			tooltip = d3.select('body').append('div').attr('class', 'upset-tooltip-styled');
		}
		tooltip
			.style('position', 'absolute')
			.style('z-index', '10')
			.style('visibility', 'hidden')
			.style('background-color', 'rgba(0, 0, 0, 0.8)')
			.style('color', 'white')
			.style('padding', '4px 8px')
			.style('border-radius', '4px')
			.style('font-size', '11px')
			.text('');

		intersectionBars
			.on('mouseover', (event, d) => {
				tooltip.html(`${d.name}: <b>${d.num}</b>`);
				tooltip.style('visibility', 'visible');
				d3.select(event.currentTarget).attr('fill', d3.color(color).darker(0.7));
			})
			.on('mousemove', (event) => {
				tooltip.style('top', `${event.pageY - 28}px`).style('left', `${event.pageX + 5}px`);
			})
			.on('mouseout', (event) => {
				tooltip.style('visibility', 'hidden');
				d3.select(event.currentTarget).attr('fill', color);
			});

		// Return cleanup function for tooltip
		return () => {
			tooltip.style('visibility', 'hidden');
		};
	};

	// --- Reactive Logic ---
	$: if (container && data) {
		// console.log("Recalculating styled plot...", soloSetMode);
		try {
			const currentData = Array.isArray(data) ? data : defaultData;
			if (
				!currentData.every(
					(item) =>
						typeof item === 'object' &&
						item !== null &&
						'name' in item &&
						'values' in item &&
						Array.isArray(item.values)
				)
			) {
				throw new Error('Invalid data format. Expected [{name: string, values: string[]}].');
			}

			// Use the combined formatting function
			const { intersections, soloSetsWithTotals } = formatIntersectionData(currentData);

			if (tooltipCleanup) {
				tooltipCleanup();
				tooltipCleanup = null;
			}

			if (intersections.length > 0 && soloSetsWithTotals.length > 0) {
				// Ensure both data parts are valid
				tooltipCleanup = plotUpsetStyled(intersections, soloSetsWithTotals, container);
			} else {
				d3.select(container).select('svg').remove();
				d3.select(container).select('p').remove();
				d3.select(container).append('p').text('No non-empty sets or intersections to display.');
			}
		} catch (error) {
			console.error('Error processing or plotting styled UpSet data:', error);
			d3.select(container).select('svg').remove();
			d3.select(container).select('p').remove();
			d3.select(container).html(
				`<p style="color: red; padding: 10px;">Error: ${error.message}</p>`
			);
			if (tooltipCleanup) tooltipCleanup();
		}
	}

	// --- Lifecycle ---
	onMount(() => {
		/* Initial plot handled by reactivity */
	});
	onDestroy(() => {
		if (container) {
			d3.select(container).select('svg').remove();
			d3.select(container).select('p').remove();
		}
		if (tooltipCleanup) {
			tooltipCleanup();
		}
		// Optionally remove the tooltip div entirely if no other instances exist
		// d3.select('body').select('.upset-tooltip-styled').remove();
	});
</script>

<!-- Controls Section -->
<div class="relative h-[35px] flex items-center justify-end gap-2 p-4">
	<button
		on:click={() => {
			showSingleDotsSelection = !showSingleDotsSelection;
		}}
		transition:slide={{ axis: 'x' }}
	>
		<label for="solo-mode-select" class="text-xs text-gray-400 row"
			><svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1"
				stroke="currentColor"
				class="size-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
				/>
			</svg>Single Dots
		</label>
	</button>
	{#if showSingleDotsSelection}
		<select
			id="solo-mode-select"
			class="p-1 border rounded shadow-sm border-gray-300/20 focus:ring-blue-500 focus:border-blue-500/20"
			bind:value={soloSetMode}
			transition:slide={{ axis: 'x' }}
		>
			<option value="outersect">Exclusive</option>
			<option value="all">Inclusive</option>
			<option value="none">None</option>
		</select>
	{/if}
</div>
<!-- Container div where the plot will be rendered -->
{#key soloSetMode}
	<div bind:this={container} class="upset-plot-styled-container text-white{className}">
		<!-- SVG appended here -->
	</div>
{/key}

<!-- Styles -->
<style>
	.upset-plot-styled-container {
		font-family: system-ui, sans-serif;
		line-height: 1.4;
		/* overflow-x: auto; Let parent handle scrolling if needed */
		padding: 5px;
	}

	.upset-plot-styled-container :global(svg.upset-plot-styled-svg) {
		display: block; /* Prevent extra space */
		background-color: transparent; /* Or set a background if desired */
		color: white; /* Default text/axis color */
	}

	/* Axis Styles */
	.upset-plot-styled-container :global(.axis .domain) {
		display: none; /* Hide axis lines */
	}
	.upset-plot-styled-container :global(.axis .tick line) {
		stroke: #ccc;
		stroke-opacity: 0.6;
	}
	.upset-plot-styled-container :global(.axis .tick text) {
		font-size: 10px;
		fill: #555;
	}

	/* Bar Styles */
	.upset-plot-styled-container :global(.intersection-bar) {
		transition: fill 0.15s ease-out;
		cursor: pointer;
	}
	.upset-plot-styled-container :global(.set-bar) {
		/* Add styles if needed */
	}

	/* Set Labels */
	.upset-plot-styled-container :global(.set-label) {
		font-size: 11px;
		fill: white;
		/* text-anchor: start; Removed, now handled inline via attr */
	}

	/* Matrix Styles */
	.upset-plot-styled-container :global(.matrix-dot) {
		/* transition: fill 0.15s ease-out; */ /* Optional transition */
	}
	.upset-plot-styled-container :global(.matrix-line) {
		/* shape-rendering: crispEdges; */
	}
	.upset-plot-styled-container :global(.base-line) {
		stroke: #ccc;
		stroke-width: 1px;
	}

	/* Global Tooltip Style (if not already defined elsewhere) */
	:global(.upset-tooltip-styled) {
		pointer-events: none; /* Important */
		white-space: nowrap;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>

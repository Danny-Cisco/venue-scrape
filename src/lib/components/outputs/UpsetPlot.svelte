<script>
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';
	import { slide, fade } from 'svelte/transition';
	import { filteredGigIds } from '$lib/stores/gigsStore.js';
	// --- Default Data ---
	const defaultData = [
		{ name: 'Set A', values: ['a', 'b', 'c', 'd', 'x'] },
		{ name: 'Set B', values: ['a', 'b', 'c', 'e', 'f', 'y'] },
		{ name: 'Set C', values: ['a', 'g', 'h', 'i', 'x', 'y'] },
		{ name: 'Set D', values: ['a', 'i', 'j', 'c', 'd', 'z'] }
	];

	// --- Component Props (Original values) ---
	export let data = defaultData;
	export let soloSetMode = 'all';
	export let className = '';
	export let color = 'hsl(210, 60%, 60%)';
	export let inactiveColor = '#555';
	export let setPlotWidth = 150;
	export let intersectionPlotHeight = 250;
	export let circleRadius = 6;
	export let setRowHeight = 20;
	export let intersectionBarWidth = 12;

	// --- Internal State ---
	let container;
	let tooltipCleanup = null;
	let showSingleDotsSelection = false;

	// --- Constants ---
	// Adjust margins/gaps for combined label layout
	const MARGIN = { top: 30, right: 100, bottom: 10, left: 100 }; // Minimal left margin before bars
	const SET_LABEL_WIDTH = 80; // Increased width for name + count
	const BAR_LABEL_GAP = 5; // Gap between bar plot end and set labels start
	const LABEL_MATRIX_GAP = 1; // Gap between set labels end and matrix start
	const MATRIX_AXIS_GAP = 10; // Vertical gap
	const INTERSECTION_LABEL_OFFSET = 4;
	const SET_BAR_V_OFFSET = 3; // Vertical offset for thinner bars
	const SET_BAR_V_REDUCTION = 6; // Total height reduction for thinner bars

	// --- Data Formatting Logic (Unchanged) ---
	const formatIntersectionData = (inputData) => {
		// ... (same as before) ...
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
					setName: `S${i}`,
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
			valuesSet: new Set(Array.isArray(x.values) ? x.values : []),
			originalNum: Array.isArray(x.values) ? x.values.length : 0,
			originalValues: Array.isArray(x.values) ? x.values : []
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
						.join(' + ');

					allExclusiveSegments.push({
						name: originalNames,
						setName: combinationSetName,
						num: 1,
						values: [value],
						isSolo: belongingSetChars.length === 1
					});
				}
			}
		});
		allExclusiveSegments = allExclusiveSegments.filter((d) => d.num > 0);

		// --- 2. Separate Exclusive Solos and Multisets ---
		const exclusiveSolos = allExclusiveSegments.filter((d) => d.isSolo);
		const exclusiveMultisets = allExclusiveSegments.filter((d) => !d.isSolo);

		// --- 3 & 4. Process based on soloSetMode ---
		let finalIntersectionsForPlot = [...exclusiveMultisets];

		if (soloSetMode === 'all') {
			allSetData.forEach((setInfo) => {
				if (setInfo.originalNum > 0) {
					finalIntersectionsForPlot.push({
						name: setInfo.name,
						setName: setInfo.setName,
						num: setInfo.originalNum,
						values: setInfo.originalValues,
						isSolo: true
					});
				}
			});
		} else if (soloSetMode === 'outersect') {
			finalIntersectionsForPlot.push(...exclusiveSolos.filter((s) => s.num > 0));
			finalIntersectionsForPlot = finalIntersectionsForPlot.map((d) => {
				if (d.isSolo && d.setName.length === 1) {
					const soloInfo = allSetData.find((s) => s.setName === d.setName);
					return { ...d, name: soloInfo ? soloInfo.name : d.name };
				}
				return d;
			});
		}

		// --- 5. Prepare Data for Left Bars (Always Total Size) ---
		const soloSetsWithTotals = allSetData.map((s) => ({
			name: s.name,
			setName: s.setName,
			num: s.originalNum,
			values: s.originalValues
		}));

		finalIntersectionsForPlot = finalIntersectionsForPlot.filter((d) => d.num > 0);

		return { intersections: finalIntersectionsForPlot, soloSetsWithTotals };
	};

	// --- Plotting Logic ---
	const plotUpsetStyled = (plotData, soloSetsInfo, containerElement) => {
		// ... (Initial setup, data prep, dimensions, SVG, scales - remain the same) ...
		d3.select(containerElement).select('svg').remove();
		d3.select(containerElement).select('p').remove();

		if (!plotData || plotData.length === 0 || !soloSetsInfo || soloSetsInfo.length === 0) {
			console.warn('UpsetPlotStyled: No data to plot.');
			d3.select(containerElement).append('p').text('No data available for styled UpSet plot.');
			return null;
		}

		// --- Data Prep ---
		// const sortedIntersections = [...plotData].sort((a, b) => b.num - a.num);
		const sortedIntersections = [...plotData].sort((a, b) => {
			// Primary sort: descending by count
			if (b.num !== a.num) return b.num - a.num;

			// Secondary sort: by number of participating sets (more sets = higher rank)
			const aSetCount = a.setName.length;
			const bSetCount = b.setName.length;
			return aSetCount - bSetCount;
		});
		const sortedSets = [...soloSetsInfo].sort((a, b) => a.name.localeCompare(b.name)); // soloSetsInfo contains total set sizes
		const setNames = sortedSets.map((d) => d.name);

		// --- Dimensions Recalculation ---
		const matrixWidth = sortedIntersections.length * (intersectionBarWidth * 1.8);
		const matrixHeight = sortedSets.length * setRowHeight;
		const barPlotStartX = MARGIN.left;
		const barPlotEndX = barPlotStartX + setPlotWidth;
		const nameLabelStartX = barPlotEndX + BAR_LABEL_GAP;
		const nameLabelEndX = nameLabelStartX + SET_LABEL_WIDTH;
		const matrixStartX = nameLabelEndX + LABEL_MATRIX_GAP;
		const totalWidth = matrixStartX + matrixWidth + MARGIN.right;
		const totalHeight =
			MARGIN.top + intersectionPlotHeight + MATRIX_AXIS_GAP + matrixHeight + MARGIN.bottom;

		// --- SVG Setup ---
		const svg = d3
			.select(containerElement)
			.append('svg')
			.attr('width', totalWidth)
			.attr('height', totalHeight)
			.attr('class', 'upset-plot-styled-svg');
		const mainGroup = svg.append('g').attr('transform', `translate(0, ${MARGIN.top})`);

		// --- Scales ---
		const xIntersectionScale = d3
			.scaleBand()
			.domain(d3.range(sortedIntersections.length))
			.range([0, matrixWidth])
			.paddingInner(0.3)
			.paddingOuter(0.15);
		const yIntersectionScale = d3
			.scaleLinear()
			.domain([0, d3.max(sortedIntersections, (d) => d.num) || 1])
			.range([intersectionPlotHeight, 0])
			.nice();
		const xSetScale = d3
			.scaleLinear()
			.domain([0, d3.max(sortedSets, (d) => d.num) || 1]) // Use sortedSets max for this scale
			.range([setPlotWidth, 0])
			.nice();
		const ySetScale = d3.scaleBand().domain(setNames).range([0, matrixHeight]).paddingInner(0.1);

		// --- Axes ---
		// ... (Axes code remains the same) ...
		const yIntersectionAxis = d3.axisLeft(yIntersectionScale).ticks(5).tickSizeOuter(0);
		mainGroup
			.append('g')
			.attr('class', 'y-axis intersection-axis')
			.attr('transform', `translate(${matrixStartX}, 0)`)
			.call(yIntersectionAxis)
			.call((g) => g.select('.domain').remove())
			.call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0.2).attr('x2', -5));

		const xSetAxis = d3.axisTop(xSetScale).ticks(3).tickSizeOuter(0);
		mainGroup
			.append('g')
			.attr('class', 'x-axis set-axis')
			.attr('transform', `translate(${barPlotStartX}, ${intersectionPlotHeight + MATRIX_AXIS_GAP})`) // Align with bar plot start
			.call(xSetAxis)
			.call((g) => g.select('.domain').remove())
			.call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0.2).attr('y2', 5));

		// --- Tooltip Setup (Define once) ---
		let tooltip = d3.select('body').select('.upset-tooltip-styled');
		if (tooltip.empty()) {
			tooltip = d3.select('body').append('div').attr('class', 'upset-tooltip-styled');
		}
		tooltip
			.style('position', 'absolute')
			.style('z-index', '10')
			.style('visibility', 'hidden')
			.style('background-color', 'rgba(0, 0, 0, 0.85)')
			.style('color', 'white')
			.style('padding', '4px 8px')
			.style('border-radius', '4px')
			.style('font-size', '11px')
			.text('');

		// --- Plot Elements ---

		// 1. Intersection Size Plot (Top Right)
		const intersectionPlotG = mainGroup
			.append('g')
			.attr('id', 'intersection-plot')
			.attr('transform', `translate(${matrixStartX}, 0)`);
		// ... (baseline) ...
		intersectionPlotG
			.append('line')
			.attr('class', 'base-line')
			.attr('x1', 0)
			.attr('x2', matrixWidth)
			.attr('y1', yIntersectionScale(0))
			.attr('y2', yIntersectionScale(0));

		const intersectionBars = intersectionPlotG
			.selectAll('.intersection-bar')
			.data(sortedIntersections, (d) => d.setName)
			.join('rect')
			// ... (intersection bar attributes and existing handlers - remain the same) ...
			.attr('class', 'intersection-bar')
			.attr('x', (d, i) => xIntersectionScale(i))
			.attr('y', (d) => yIntersectionScale(d.num))
			.attr('width', intersectionBarWidth)
			.attr('height', (d) => Math.max(0, yIntersectionScale(0) - yIntersectionScale(d.num)))
			.attr('fill', color)
			.style('cursor', 'pointer') // Add cursor
			.on('click', function (event, d) {
				// console.log(`Clicked Intersection: ${d.name} (${d.num} items)`);
				// console.log('Intersection values:', d.values);
				filteredGigIds.set(d.values);
			})
			.on('mouseover', (event, d) => {
				tooltip.html(`${d.name}: <b>${d.num}</b>`); // Clarify tooltip source
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

		// Intersection Count Labels
		// ... (Intersection labels remain the same) ...
		intersectionPlotG
			.selectAll('.intersection-label')
			.data(sortedIntersections, (d) => d.setName)
			.join('text')
			.attr('class', 'intersection-label')
			.attr('x', (d, i) => xIntersectionScale(i) + intersectionBarWidth / 2)
			.attr('y', (d) => yIntersectionScale(d.num) - INTERSECTION_LABEL_OFFSET)
			.attr('text-anchor', 'middle')
			.text((d) => d.num);

		// 2. Set Size Plot (Left Bars) - ADD INTERACTIONS HERE
		const setPlotG = mainGroup
			.append('g')
			.attr('id', 'set-plot')
			.attr(
				'transform',
				`translate(${barPlotStartX}, ${intersectionPlotHeight + MATRIX_AXIS_GAP})`
			);

		const setBars = setPlotG // Assign selection to a variable
			.selectAll('.set-bar')
			.data(sortedSets, (d) => d.setName) // Data is from sortedSets (total set info)
			.join('rect')
			.attr('class', 'set-bar')
			.attr('x', (d) => xSetScale(d.num)) // X depends on the total number
			.attr('y', (d) => ySetScale(d.name) + SET_BAR_V_OFFSET)
			.attr('width', (d) => Math.max(0, xSetScale(0) - xSetScale(d.num))) // Width depends on total number
			.attr('height', Math.max(0, ySetScale.bandwidth() - SET_BAR_V_REDUCTION))
			.attr('fill', color)
			.style('cursor', 'pointer') // Add cursor
			.on('click', function (event, d) {
				// console.log(`Clicked Set: ${d.name} (${d.num} items)`);
				// console.log('Set values:', d.values);
				//Update store with the full set's values
				filteredGigIds.set(d.values);
			})
			.on('mouseover', (event, d) => {
				// 'd' is from sortedSets
				tooltip.html(`${d.name}: <b>${d.num}</b>`); // Clarify tooltip source
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

		// 3. Set Name & Count Labels
		// ... (Set labels remain the same) ...
		const setLabelG = mainGroup
			.append('g')
			.attr('id', 'set-labels') // Changed ID back
			.attr(
				'transform',
				`translate(${nameLabelStartX}, ${intersectionPlotHeight + MATRIX_AXIS_GAP - SET_BAR_V_OFFSET})`
			); // Position after bars+gap

		setLabelG
			.selectAll('.set-label') // Changed class back
			.data(sortedSets, (d) => d.setName)
			.join('text')
			.attr('class', 'set-label') // Use original class
			.attr('x', 0)
			.attr('y', (d) => ySetScale(d.name) + ySetScale.bandwidth() / 2)
			.attr('dy', '0.35em')
			.attr('text-anchor', 'start')
			// .text((d) => `(${d.num}) ${d.name}`);
			.text((d) => `${d.name}`);

		// 4. Membership Matrix (Bottom Right)
		// ... (Matrix dots and lines - revert to original simpler version without interactions) ...
		const matrixG = mainGroup
			.append('g')
			.attr('id', 'membership-matrix')
			.attr('transform', `translate(${matrixStartX}, ${intersectionPlotHeight + MATRIX_AXIS_GAP})`);

		// Background stripes
		matrixG
			.selectAll('.matrix-bg-stripe')
			.data(d3.range(sortedSets.length))
			.join('rect')
			.attr('class', 'matrix-bg-stripe')
			.attr('x', 0)
			.attr('y', (d, i) => ySetScale(sortedSets[i].name))
			.attr('width', matrixWidth)
			.attr('height', ySetScale.bandwidth())
			.attr('fill', (d, i) => (i % 2 === 0 ? '#22272e' : 'transparent'))
			.attr('opacity', 0.6);

		// Dots and Lines (Original loop structure)
		sortedIntersections.forEach((intersectionData, i) => {
			const intersectionX = xIntersectionScale(i) + intersectionBarWidth / 2;
			const participatingSetNames = sortedSets
				.filter((set) => intersectionData.setName.includes(set.setName))
				.map((set) => set.name);

			// Draw dots for this intersection column
			sortedSets.forEach((set) => {
				const isActive = participatingSetNames.includes(set.name);
				matrixG
					.append('circle')
					.attr('class', 'matrix-dot')
					.attr('cx', intersectionX)
					.attr('cy', ySetScale(set.name) + ySetScale.bandwidth() / 2)
					.attr('r', circleRadius)
					.attr('fill', isActive ? color : inactiveColor)
					.attr('opacity', isActive ? 1 : 0.7);
			});

			// Draw connecting line if needed
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

		// --- Return Cleanup Function ---
		return () => {
			tooltip.style('visibility', 'hidden');
		};
	}; // End of plotUpsetStyled function

	// --- Reactive Logic (Unchanged) ---
	$: if (container && data) {
		// ... (same as before) ...
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
			const { intersections, soloSetsWithTotals } = formatIntersectionData(currentData);

			if (tooltipCleanup) {
				tooltipCleanup();
				tooltipCleanup = null;
			}

			if (intersections.length > 0 && soloSetsWithTotals.length > 0) {
				tooltipCleanup = plotUpsetStyled(intersections, soloSetsWithTotals, container);
			} else {
				d3.select(container).select('svg').remove();
				d3.select(container).select('p').remove();
				d3.select(container).append('p').text('No gigs found... = (');
			}
		} catch (error) {
			console.error('Error processing or plotting styled UpSet data:', error);
			d3.select(container).select('svg').remove();
			d3.select(container).select('p').remove();
			d3.select(container).html(
				`<p style="color: #f87171; padding: 10px;">Error: ${error.message}</p>`
			);
			if (tooltipCleanup) tooltipCleanup();
		}
	}

	// --- Lifecycle (Unchanged) ---
	onMount(() => {
		/* Handled by reactivity */
	});
	onDestroy(() => {
		// ... (same as before) ...
		if (container) {
			d3.select(container).select('svg').remove();
			d3.select(container).select('p').remove();
		}
		if (tooltipCleanup) {
			tooltipCleanup();
		}
	});
</script>

<!-- Controls Section (Unchanged) -->
<div class="relative h-[35px] flex items-center justify-end w-screen right-[50px] gap-2 p-4">
	<!-- ... -->
	<button
		on:click={() => {
			showSingleDotsSelection = !showSingleDotsSelection;
		}}
		class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200"
		transition:slide={{ axis: 'x' }}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-5"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
			/>
		</svg>
		Single Dots
	</button>
	{#if showSingleDotsSelection}
		<select
			id="solo-mode-select"
			class="p-1 text-xs text-white bg-gray-800 border border-gray-700 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500/50"
			bind:value={soloSetMode}
			transition:slide={{ axis: 'x' }}
		>
			<option value="outersect">Exclusive</option>
			<option value="all">Inclusive</option>
			<option value="none">None</option>
		</select>
	{/if}
</div>
<!-- Container div -->
<div class="flex justify-center w-screen overflow-x-auto">
	{#key soloSetMode}
		<div bind:this={container} class="upset-plot-styled-container text-white {className}" in:fade>
			<!-- SVG appended here -->
		</div>
	{/key}
</div>

<!-- Styles -->
<style>
	.upset-plot-styled-container {
		font-family: system-ui, sans-serif;
		line-height: 1.4;
		padding: 5px;
	}

	.upset-plot-styled-container :global(svg.upset-plot-styled-svg) {
		display: block;
		background-color: transparent;
		color: white;
	}

	/* Axis Styles */
	.upset-plot-styled-container :global(.axis .domain) {
		display: none;
	}
	.upset-plot-styled-container :global(.axis .tick line) {
		stroke: #444;
		stroke-opacity: 0.6;
	}
	.upset-plot-styled-container :global(.axis .tick text) {
		font-size: 10px;
		fill: #aaa;
	}

	/* Bar Styles */
	.upset-plot-styled-container :global(.intersection-bar) {
		transition: fill 0.15s ease-out;
		cursor: pointer;
	}
	.upset-plot-styled-container :global(.set-bar) {
	}

	/* Label Styles */
	/* Combined Set Name (Count) Label Style */
	.upset-plot-styled-container :global(.set-label) {
		font-size: 11px;
		fill: white;
		dominant-baseline: middle;
		user-select: none;
	}

	/* Intersection Count Label Style */
	.upset-plot-styled-container :global(.intersection-label) {
		font-size: 9px;
		fill: #ccc;
		text-anchor: middle;
		dominant-baseline: auto;
		user-select: none;
	}

	/* Matrix Styles */
	.upset-plot-styled-container :global(.matrix-dot) {
	}
	.upset-plot-styled-container :global(.matrix-line) {
		stroke: v-bind(color);
	}
	.upset-plot-styled-container :global(.base-line) {
		stroke: #444;
		stroke-width: 1px;
	}
	.upset-plot-styled-container :global(.matrix-bg-stripe) {
	}

	/* Global Tooltip Style */
	:global(.upset-tooltip-styled) {
		pointer-events: none;
		white-space: nowrap;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>

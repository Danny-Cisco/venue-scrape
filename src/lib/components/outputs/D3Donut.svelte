<script>
	import { onMount, afterUpdate } from 'svelte';
	import * as d3 from 'd3';
	import { searchTermStore } from '$lib/stores/transcriptionStore';

	export let data = [];
	export let valueKey = 'value';
	export let width = 500;

	let svg;
	let pie;
	let arc;
	let color;
	let mounted = false;

	onMount(() => {
		width = window.innerWidth / 2;
		const height = Math.min(500, width * 0.614);
		const outerRadius = (height / 2) * 0.8;
		const innerRadius = outerRadius * 0.667;

		color = d3.scaleOrdinal(d3.schemeCategory10);
		arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

		const labelArc = d3
			.arc()
			.innerRadius(outerRadius * 1.1)
			.outerRadius(outerRadius * 1.1);

		pie = d3
			.pie()
			.sort(null)
			.value((d) => d[valueKey]);

		svg = d3.select('#donut-chart').attr('viewBox', [-width / 2, -height / 2, width, height]);

		mounted = true;
	});

	function arcTween(a) {
		const i = d3.interpolate(this._current, a);
		this._current = i(0);
		return (t) => arc(i(t));
	}

	function midAngle(d) {
		return d.startAngle + (d.endAngle - d.startAngle) / 2;
	}

	function handleLabelClick(text) {
		searchTermStore.set(text);
	}

	function updateChart(newData) {
		if (!svg || !mounted || !newData?.length) return;

		console.log('Updating chart with data:', newData);

		const pieData = pie(newData);
		const outerRadius = (Math.min(500, width * 0.614) / 2) * 0.8;
		const labelArc = d3
			.arc()
			.innerRadius(outerRadius * 1.1)
			.outerRadius(outerRadius * 1.1);

		// Paths
		const paths = svg.selectAll('path').data(pieData);

		// Enter paths
		const enterPaths = paths
			.enter()
			.append('path')
			.attr('fill', (d, i) => color(i))
			.attr('d', arc)
			.each(function (d) {
				this._current = d;
			});

		// Update paths
		paths
			.attr('fill', (d, i) => color(i))
			.transition()
			.duration(750)
			.attrTween('d', arcTween);

		// Exit paths
		paths.exit().remove();

		// Labels
		const labels = svg.selectAll('text.label').data(pieData);

		// Function to create/update tspans
		function createTspans(selection) {
			selection.each(function (d) {
				const text = d.data.category;
				const words = text.split(/\s+/);
				const lineHeight = 1.1;
				const node = d3.select(this);

				// Clear existing tspans
				node.selectAll('tspan').remove();

				let line = [];
				let lineNumber = 0;
				let tspan = node.append('tspan').attr('x', 0).attr('dy', 0);

				words.forEach((word) => {
					line.push(word);
					tspan.text(line.join(' '));

					if (line.join(' ').length > 15 && line.length > 1) {
						line.pop();
						tspan.text(line.join(' '));
						line = [word];
						tspan = node.append('tspan').attr('x', 0).attr('dy', `${lineHeight}em`).text(word);
						lineNumber++;
					}
				});

				// Add any remaining words
				if (line.length > 0) {
					tspan.text(line.join(' '));
				}

				d.lineCount = lineNumber + 1;
			});
		}

		// Enter labels with click handling
		const enterLabels = labels
			.enter()
			.append('text')
			.attr('class', 'label')
			.style('font-size', '14px')
			.on('mouseenter', function () {
				d3.select(this).style('text-decoration', 'underline');
			})
			.on('mouseleave', function () {
				d3.select(this).style('text-decoration', 'none');
			})
			.style('font-family', 'Monospace')
			.style('fill', '#000')
			.style('text-anchor', (d) => {
				const angle = midAngle(d);
				return angle < Math.PI ? 'start' : 'end';
			})
			.style('pointer-events', 'all') // Enable pointer events
			.style('cursor', 'pointer') // Show pointer cursor
			.attr('opacity', 0)
			.on('click', (event, d) => handleLabelClick(d.data.category)) // Add click handler
			.call(createTspans);

		// Update existing labels
		labels
			.style('text-anchor', (d) => {
				const angle = midAngle(d);
				return angle < Math.PI ? 'start' : 'end';
			})
			.style('pointer-events', 'all')
			.style('cursor', 'pointer')
			.on('click', (event, d) => handleLabelClick(d.data.category))
			.call(createTspans);

		// Merge and transition all labels
		labels
			.merge(enterLabels)
			.transition()
			.duration(750)
			.attr('transform', (d) => {
				const pos = labelArc.centroid(d);
				const angle = midAngle(d);
				pos[0] = pos[0] + (angle < Math.PI ? 5 : -5);
				const lineCount = d.lineCount || 1;
				pos[1] = pos[1] - (lineCount - 1) * 6;
				return `translate(${pos})`;
			})
			.attr('opacity', 1);

		// Exit labels
		labels.exit().transition().duration(750).attr('opacity', 0).remove();

		// Add connecting lines
		const polylines = svg.selectAll('polyline').data(pieData);

		// Enter polylines
		const enterPolylines = polylines
			.enter()
			.append('polyline')
			.style('fill', 'none')
			.style('stroke', '#000')
			.style('stroke-width', '1px')
			.style('opacity', 0.0);

		// Update polylines
		polylines
			.merge(enterPolylines)
			.transition()
			.duration(150)
			.attr('points', (d) => {
				const pos = labelArc.centroid(d);
				const angle = midAngle(d);
				pos[0] = pos[0] + (angle < Math.PI ? 2 : -2);
				const midRadius = (arc.outerRadius()() + labelArc.outerRadius()()) / 2;
				const midPoint = [
					midRadius * Math.cos(midAngle(d) - Math.PI / 2),
					midRadius * Math.sin(midAngle(d) - Math.PI / 2)
				];
				return [arc.centroid(d), midPoint, pos];
			});

		// Exit polylines
		polylines.exit().remove();
	}

	// Watch for data changes
	$: {
		console.log('Data changed:', data);
		if (mounted && data) {
			updateChart(data);
		}
	}
</script>

<svg id="donut-chart" class=""></svg>

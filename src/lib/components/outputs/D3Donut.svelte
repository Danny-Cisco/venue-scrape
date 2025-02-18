<script>
	import { onMount, afterUpdate } from 'svelte';
	import * as d3 from 'd3';

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
		const outerRadius = height / 2;
		const innerRadius = outerRadius * 0.667;

		color = d3.scaleOrdinal(d3.schemeCategory10);

		arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

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

	function updateChart(newData) {
		if (!svg || !mounted || !newData?.length) return;

		console.log('Updating chart with data:', newData); // Debug log

		const pieData = pie(newData);

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
		const labels = svg.selectAll('text').data(pieData);

		// Enter labels
		const enterLabels = labels
			.enter()
			.append('text')
			.attr('transform', (d) => `translate(${arc.centroid(d)})`)
			.style('font-size', '12px') // Increased font size
			.style('font-family', 'Monospace')
			.style('fill', '#fff')
			.style('text-anchor', 'middle')
			.style('alignment-baseline', 'middle')
			.style('pointer-events', 'none') // Prevent labels from interfering with interactions
			.attr('opacity', 0);

		// Update labels
		labels
			.merge(enterLabels)
			.text((d) => d.data.category)
			.transition()
			.duration(750)
			.attr('transform', (d) => `translate(${arc.centroid(d)})`)
			.attr('opacity', 1);

		// Exit labels
		labels.exit().transition().duration(750).attr('opacity', 0).remove();
	}

	// Watch for data changes
	$: {
		console.log('Data changed:', data); // Debug log
		if (mounted && data) {
			updateChart(data);
		}
	}
</script>

<svg id="donut-chart"></svg>

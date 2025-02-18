<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];
	export let valueKey = 'value'; // Default key for values
	export let width = 500;

	let svg;
	let path;
	let pie;
	let arc;
	let color;

	onMount(() => {
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

		updateChart();
	});

	function updateChart() {
		if (!svg) return;

		const pieData = pie(data);
		path = svg.selectAll('path').data(pieData);

		path
			.join('path')
			.attr('fill', (d, i) => color(i))
			.attr('d', arc)
			.each(function (d) {
				this._current = d;
			});

		// Add labels
		const labels = svg
			.selectAll('text')
			.data(pieData)
			.join('text')
			.attr('transform', (d) => `translate(${arc.centroid(d)})`)
			.attr('text-anchor', 'middle')
			.attr('alignment-baseline', 'middle')
			.style('font-size', '7px')
			.style('font-family', 'Monospace')
			.style('fill', '#fff')
			.text((d) => d.data.category);
	}

	$: updateChart(); // Reactively update chart when data changes
</script>

<svg id="donut-chart"></svg>

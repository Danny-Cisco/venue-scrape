<script>
	import { onMount, afterUpdate } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];
	export let valueKey = 'value';
	export let width = 500;

	let svg;
	let path;
	let pie;
	let arc;
	let color;
	let mounted = false;

	onMount(() => {
		const height = Math.min(500, width);
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
		updateChart();
	});

	function arcTween(a) {
		const i = d3.interpolate(this._current, a);
		this._current = i(0);
		return (t) => arc(i(t));
	}

	function updateChart() {
		if (!svg || !mounted || !data.length) return;

		const pieData = pie(data);

		// Update paths
		path = svg.selectAll('path').data(pieData);

		// Enter new paths
		const enterPath = path
			.enter()
			.append('path')
			.attr('fill', (d, i) => color(i))
			.attr('d', arc);

		// Store the initial angles
		enterPath.each(function (d) {
			this._current = d;
		});

		// Update existing paths
		path
			.attr('fill', (d, i) => color(i))
			.transition()
			.duration(750)
			.attrTween('d', arcTween);

		// Remove old paths
		path.exit().remove();

		// Update labels
		const labels = svg.selectAll('text').data(pieData);

		// Enter new labels
		labels
			.enter()
			.append('text')
			.attr('transform', (d) => `translate(${arc.centroid(d)})`)
			.attr('opacity', 0)
			.style('font-size', '7px')
			.style('font-family', 'Monospace')
			.style('fill', '#fff')
			.style('text-anchor', 'middle')
			.style('alignment-baseline', 'middle')
			.text((d) => d.data.category)
			.transition()
			.duration(750)
			.attr('opacity', 1);

		// Update existing labels
		labels
			.transition()
			.duration(750)
			.attr('transform', (d) => `translate(${arc.centroid(d)})`)
			.text((d) => d.data.category);

		// Remove old labels
		labels.exit().transition().duration(750).attr('opacity', 0).remove();
	}

	// Watch for data changes
	$: if (mounted && data) {
		updateChart();
	}
</script>

<svg id="donut-chart" {width}></svg>

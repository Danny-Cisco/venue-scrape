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
		// Reduce the outer radius to leave space for labels
		const outerRadius = (height / 2) * 0.8;
		const innerRadius = outerRadius * 0.667;

		color = d3.scaleOrdinal(d3.schemeCategory10);

		arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

		// Create a larger arc for label positioning
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
		const labels = svg.selectAll('text').data(pieData);

		// Enter labels
		const enterLabels = labels
			.enter()
			.append('text')
			.attr('class', 'label')
			.style('font-size', '12px')
			.style('font-family', 'Monospace')
			.style('fill', '#000')
			.style('text-anchor', (d) => {
				const angle = midAngle(d);
				return angle < Math.PI ? 'start' : 'end';
			})
			.style('pointer-events', 'none')
			.attr('opacity', 0);

		// Update labels
		labels
			.merge(enterLabels)
			.text((d) => d.data.category)
			.transition()
			.duration(750)
			.attr('transform', (d) => {
				const pos = labelArc.centroid(d);
				const angle = midAngle(d);
				// Adjust x position based on text anchor
				pos[0] = pos[0] + (angle < Math.PI ? 5 : -5);
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
			.style('stroke', '#999')
			.style('stroke-width', '1px')
			.style('opacity', 0.5);

		// Update polylines
		polylines
			.merge(enterPolylines)
			.transition()
			.duration(750)
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

<svg id="donut-chart"></svg>

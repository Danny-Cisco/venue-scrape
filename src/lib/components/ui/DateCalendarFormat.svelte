<script>
	import { InlineCalendar } from 'svelte-calendar';

	export let date;

	let selected = new Date(date);
	let start = new Date(date);
	let end = new Date(date);
	const theme = {
		calendar: {
			width: '300px',
			shadow: '0px 0px 5px rgba(0, 0, 0, 0)',
			grid: {
				disabledOpacity: '1',
				outsiderOpacity: '.6'
			},
			font: {
				regular: '1em',
				large: '37em'
			},
			legend: {
				height: '55px'
			}
		}
	};
</script>

<div class="flex justify-end w-full overflow-hidden">
	<InlineCalendar {theme} {selected} {start} {end} />
</div>

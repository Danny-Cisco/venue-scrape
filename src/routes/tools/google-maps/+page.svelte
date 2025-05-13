<script>
	import GoogleMaps from '$lib/components/outputs/GoogleMaps.svelte';

	let gigs = [
		{
			id: '1',
			title: 'Grunge Night',
			genre: 'Rock',
			venue: {
				name: 'Shotkickers',
				lat: -37.75579357364951,
				lng: 145.00139125092542
			}
		},
		{
			id: '2',
			title: 'Synth Dreams',
			genre: 'Electronic',
			venue: {
				name: 'Shotkickers',
				lat: -37.75579357364951,
				lng: 145.00139125092542
			}
		},
		{
			id: '3',
			title: 'Acoustic Folk',
			genre: 'Folk',
			venue: {
				name: 'The Gem',
				lat: -37.796170897005005,
				lng: 144.9877218897404
			}
		}
	];
</script>

<GoogleMaps {gigs} />

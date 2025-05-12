<script>
	import { onMount } from 'svelte';
	import { PUBLIC_GOOGLE_API_KEY } from '$env/static/public';

	let mapDiv;

	const loadGoogleMapsScript = () => {
		return new Promise((resolve, reject) => {
			if (window.google && window.google.maps) {
				resolve(window.google.maps);
				return;
			}
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${PUBLIC_GOOGLE_API_KEY}`;
			script.async = true;
			script.defer = true;
			script.onload = () => resolve(window.google.maps);
			script.onerror = reject;
			document.head.appendChild(script);
		});
	};

	onMount(async () => {
		const googleMaps = await loadGoogleMapsScript();

		const brunswickCoords = { lat: -37.7706, lng: 144.9614 };
		const thegembar = { lat: -37.796170897005005, lng: 144.9877218897404 };

		const map = new googleMaps.Map(mapDiv, {
			center: thegembar,
			zoom: 11
		});

		new googleMaps.Marker({
			position: thegembar,
			map,
			title: 'The Gem Bar'
		});
	});
</script>

<div bind:this={mapDiv} id="map"></div>

<style>
	#map {
		width: 100%;
		height: 100%;
	}
</style>

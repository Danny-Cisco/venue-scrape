<script>
	import { onMount } from 'svelte';
	import { PUBLIC_GOOGLE_API_KEY } from '$env/static/public';

	export let gigs = [];

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

	const groupGigsByVenue = (gigs) => {
		const map = new Map();

		for (const gig of gigs) {
			const key = `${gig.venue.lat},${gig.venue.lng}`;
			if (!map.has(key)) {
				map.set(key, {
					venue: gig.venue,
					gigs: []
				});
			}
			map.get(key).gigs.push(gig);
		}

		return Array.from(map.values());
	};

	onMount(async () => {
		const googleMaps = await loadGoogleMapsScript();

		const venueGroups = groupGigsByVenue(gigs);

		const defaultCenter = venueGroups[0]?.venue ?? { lat: 0, lng: 0 };

		const map = new googleMaps.Map(mapDiv, {
			center: defaultCenter,
			zoom: 12
		});

		venueGroups.forEach(({ venue, gigs }) => {
			const marker = new googleMaps.Marker({
				position: { lat: venue.lat, lng: venue.lng },
				map,
				title: venue.name
			});

			const content = `
        <div style="
          background-color: black;
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-family: sans-serif;
          max-width: 250px;
        ">
          <strong>${venue.name}</strong><br/>
          <ul style="margin: 0; padding-left: 1em;">
            ${gigs.map((g) => `<li><b>${g.title}</b> <i>(${g.genre})</i></li>`).join('')}
          </ul>
        </div>
      `;

			const infoWindow = new googleMaps.InfoWindow({ content });

			marker.addListener('mouseover', () => {
				infoWindow.open(map, marker);
			});

			marker.addListener('click', () => {
				infoWindow.open(map, marker); // optional: click-to-open
			});
		});
	});
</script>

<div bind:this={mapDiv} class="map-container"></div>

<style>
	.map-container {
		width: 100%;
		height: 100%;
	}
</style>

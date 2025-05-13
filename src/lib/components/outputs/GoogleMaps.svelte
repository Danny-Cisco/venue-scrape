<script>
	import { onMount } from 'svelte';
	import { PUBLIC_GOOGLE_API_KEY } from '$env/static/public';
	import { parseWKT } from '$lib/utils/coords.js';

	export let gigs = [];

	let mapDiv;

	const loadGoogleMapsScript = () => {
		return new Promise((resolve, reject) => {
			if (window.google && window.google.maps) return resolve(window.google.maps);

			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${PUBLIC_GOOGLE_API_KEY}`;
			script.async = true;
			script.defer = true;
			script.onload = () => resolve(window.google.maps);
			script.onerror = reject;
			document.head.appendChild(script);
		});
	};

	// Groups gigs by venue coordinates
	function groupGigsByVenue(gigs) {
		const map = new Map();

		for (const gig of gigs) {
			if (!gig.location) continue;

			const coords = parseWKT(gig.location);
			if (!coords) continue;

			const key = `${coords.lat},${coords.lng}`;
			if (!map.has(key)) {
				map.set(key, {
					coords,
					venueName: gig.venue || gig.oztix?.venue || 'Unknown Venue',
					gigs: []
				});
			}
			map.get(key).gigs.push(gig);
		}

		return Array.from(map.values());
	}

	onMount(async () => {
		const googleMaps = await loadGoogleMapsScript();

		const venueGroups = groupGigsByVenue(gigs);

		const defaultCenter = venueGroups[0]?.coords || { lat: -37.81, lng: 144.96 };

		const map = new googleMaps.Map(mapDiv, {
			center: defaultCenter,
			zoom: 12
		});

		venueGroups.forEach(({ coords, venueName, gigs }) => {
			const marker = new googleMaps.Marker({
				position: coords,
				map,
				title: venueName
			});

			const content = `
				<div style="
					background: black;
					color: white;
					padding: 12px;
					border-radius: 8px;
					font-family: sans-serif;
					max-width: 280px;
				">
					<strong style="font-size: 16px;">${venueName}</strong>
					<ul style="padding-left: 1em; margin-top: 6px;">
						${gigs
							.map(
								(gig) => `
							<li style="margin-bottom: 6px;">
								<div><b>${gig.title}</b></div>
								<div>🎵 ${gig.genres?.join(', ') || 'Unknown Genre'}</div>
								<div>👥 ${gig.bands?.join(', ') || 'Unknown Band(s)'}</div>
								${gig.ticketUrl ? `<div><a href="${gig.ticketUrl}" target="_blank" style="color:#4FC3F7;">🎫 Tickets</a></div>` : ''}
							</li>
						`
							)
							.join('')}
					</ul>
				</div>
			`;

			const infoWindow = new googleMaps.InfoWindow({ content });

			marker.addListener('mouseover', () => infoWindow.open(map, marker));
			marker.addListener('click', () => infoWindow.open(map, marker));
		});
	});
</script>

<div bind:this={mapDiv} class="mx-auto map-container rounded-2xl"></div>

<style>
	.map-container {
		width: 70%;
		height: 50dvh;
	}
</style>

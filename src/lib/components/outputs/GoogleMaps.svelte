<script>
	import { onMount } from 'svelte';
	import { PUBLIC_GOOGLE_API_KEY } from '$env/static/public';
	import { lastClicked, showGigModal } from '$lib/stores/modalStores.js';

	export let gigs = [];

	let mapDiv;

	const SHOTKICKERS_COORDS = {
		lat: -37.75580205616345,
		lng: 145.0013590644179
	};

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

	function groupGigsByVenue(gigs) {
		const map = new Map();

		for (const gig of gigs) {
			if (!gig.location?.coordinates) {
				console.warn('❌ Missing location for gig:', gig);
				continue;
			}

			const [lng, lat] = gig.location.coordinates;
			const key = `${lng},${lat}`;

			if (!map.has(key)) {
				map.set(key, {
					coords: { lat, lng },
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

		const greenMarkerIcon = {
			url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
			scaledSize: new googleMaps.Size(36, 36)
		};

		window.selectGigFromMap = (gigId) => {
			const gig = gigs.find((g) => g.id === gigId);
			if (gig) {
				lastClicked.set(gig);
				showGigModal.set(true);
			}
		};

		const venueGroups = groupGigsByVenue(gigs);
		const defaultCenter = venueGroups[0]?.coords || { lat: -37.81, lng: 144.96 };

		const map = new googleMaps.Map(mapDiv, {
			center: defaultCenter,
			zoom: 12
		});

		// Main loop: render real gigs
		venueGroups.forEach(({ coords, venueName, gigs }) => {
			const key = `${coords.lng},${coords.lat}`;

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
					max-width: 300px;
				">
					<div style="max-height: 240px; overflow-y: auto;">
						<div style="position: sticky; top: 0; background: black; z-index: 1; padding: 4px 0; font-weight: bold; font-size: 1.5rem; border-bottom: 1px solid #555;">
							${venueName} (${gigs.length})
						</div>
						<ul style="padding-left: 0; margin-top: 18px; list-style: none;">
							${gigs
								.map(
									(gig) => `
								<li style="margin-bottom: 16px; border-bottom: 1px solid #333; padding-bottom: 12px;">
									<a href="#" onclick="selectGigFromMap('${gig.id}')" style="color: #4FC3F7; font-weight: bold; display: block; margin-bottom: 8px;">${gig.title}</a>
									<div style="display: flex; align-items: center; gap: 0.5rem; font-size: 14px; color: white;">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">
											<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
										</svg>
										${gig.followers || 0}
									</div>
									<div style="display: flex; align-items: center; gap: 0.5rem; font-size: 14px; color: tomato; margin-top: 6px;">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">
											<path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
										</svg>
										${gig.genres?.join(', ') || 'Unknown Genre'}
									</div>
									${gig.ticketUrl ? `<div style="margin-top: 8px;"><a href="${gig.ticketUrl}" target="_blank" style="color:#4FC3F7;">Tickets</a></div>` : ''}
								</li>
							`
								)
								.join('')}
						</ul>
					</div>
				</div>`;

			const infoWindow = new googleMaps.InfoWindow({ content });
			// marker.addListener('mouseover', () => infoWindow.open(map, marker));
			marker.addListener('click', () => infoWindow.open(map, marker));
		});

		// Static green anchor for ShotKickers
		new googleMaps.Marker({
			position: SHOTKICKERS_COORDS,
			map,
			title: 'ShotKickers',
			icon: greenMarkerIcon
			// no listeners
		});
	});
</script>

<div bind:this={mapDiv} class="mx-auto mb-8 map-container rounded-2xl"></div>

<style>
	.map-container {
		width: 70%;
		height: 50dvh;
	}
</style>

export function weserv(url) {
	if (!url) return;
	const weservUrl = `https://images.weserv.nl/?url=${encodeURIComponent(
		url.replace(/^https?:\/\//, '')
	)}`;

	return weservUrl;
}

export function imgHaste(url) {
	if (!url) return;
	const imgHasteUrl = `https://imghaste.com/?url=${url}`;

	return imgHasteUrl;
}

export function photon(url) {
	if (!url) return;

	// Photon requires the full original URL, but prefixed with i0.wp.com and without the scheme
	const stripped = url.replace(/^https?:\/\//, '');

	const photonUrl = `https://i0.wp.com/${stripped}`;

	return photonUrl;
}

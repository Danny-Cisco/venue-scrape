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

export function imageUrlToLarge(url) {
	if (typeof url !== 'string') return url;

	const isMoshtix = url.includes('moshtix') && url.includes('x140x140');

	if (isMoshtix) {
		return url.replace('x140x140', 'x600x600');
	}

	const isOztix = url.includes('oztix');

	if (isOztix) {
		return url.replace(/(\?|&)width=\d+&height=\d+/, '?width=600&height=600');
	}

	return url;
}

export function imageUrlToMedium(url) {
	if (typeof url !== 'string') return url;

	const isMoshtix = url.includes('moshtix') && url.includes('x140x140');

	if (isMoshtix) {
		return url.replace('x140x140', 'x300x300');
	}

	const isOztix = url.includes('oztix');

	if (isOztix) {
		return url.replace(/(\?|&)width=\d+&height=\d+/, '?width=200&height=200');
	}

	return url;
}

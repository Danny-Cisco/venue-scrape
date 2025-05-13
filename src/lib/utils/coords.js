import { is } from 'date-fns/locale';

export function parseWKT(wkt) {
	if (typeof wkt !== 'string') return null; // prevent calling .match on non-strings
	const match = wkt.match(/POINT\(([\d\.\-]+) ([\d\.\-]+)\)/);
	if (!match) return null;
	const [, lng, lat] = match;
	return {
		lat: parseFloat(lat),
		lng: parseFloat(lng)
	};
}

// Example Usage:
// const wkt = 'SRID=4326;POINT(145.00139125092542 -37.75579357364951)';
// const coords = parseWKT(wkt);
// coords = { lat: -37.75579357364951, lng: 145.00139125092542 }

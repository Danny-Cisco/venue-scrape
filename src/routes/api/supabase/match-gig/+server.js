import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	const { supabase } = locals;

	// Normalize venue and bands for comparison
	const normalize = (inputStr) => {
		if (typeof inputStr !== 'string') {
			return '';
		}
		let str = inputStr;
		// 1. Remove content in parentheses at the end of the string, and surrounding spaces. eg Dickshits (SYDNEY)
		str = str.replace(/\s*\([^)]*\)\s*$/, '').trim();
		// 2. Convert to lowercase
		str = str.toLowerCase();
		// 3. Remove all remaining whitespace
		str = str.replace(/\s+/g, '');
		// 4. Remove all non-alphanumeric characters
		str = str.replace(/[^\w]/g, '');
		return str;
	};

	try {
		const reqBody = await request.json();
		// console.log('🔍 Incoming match request body:', reqBody);

		const { datetime, venue, bands } = reqBody;

		if (!datetime || !venue || !bands || !Array.isArray(bands) || typeof venue !== 'string') {
			return json({ error: 'Missing or invalid datetime, venue, or bands' }, { status: 400 });
		}

		// Get full-day range in UTC
		const inputDate = new Date(datetime);
		if (isNaN(inputDate.getTime())) {
			return json({ error: 'Invalid datetime format' }, { status: 400 });
		}

		const dayStart = new Date(inputDate.getTime());
		dayStart.setUTCHours(0, 0, 0, 0);

		const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

		// console.log('Input datetime string:', datetime);
		// console.log('Parsed inputDate (ISO):', inputDate.toISOString());
		// console.log('Calculated dayStart (ISO):', dayStart.toISOString());
		// console.log('Calculated dayEnd (ISO):', dayEnd.toISOString());

		const { data: potentialMatches, error } = await supabase
			.from('gigs')
			.select('id, datetime, venue, bands')
			.gte('datetime', dayStart.toISOString())
			.lt('datetime', dayEnd.toISOString());

		if (error) {
			console.error('❌ Supabase query error:', error);
			return json({ error: 'Supabase query failed' }, { status: 500 });
		}

		const normalizedVenue = normalize(venue);
		// Ensure bands are strings before normalizing, then filter empty strings
		const inputBands = bands
			.filter((b) => typeof b === 'string') // Ensure elements are strings
			.map(normalize)
			.filter((b) => b.length > 0);

		for (const match of potentialMatches) {
			if (typeof match.venue !== 'string' || !Array.isArray(match.bands)) {
				// console.warn('Skipping potential match with invalid structure:', match);
				continue; // Skip malformed data from DB
			}
			const matchVenue = normalize(match.venue);
			const matchBands = match.bands
				.filter((b) => typeof b === 'string') // Ensure elements are strings
				.map(normalize)
				.filter((b) => b.length > 0);

			// Venue must match
			if (matchVenue !== normalizedVenue || matchVenue === '') continue; // Also skip if venue becomes empty after normalization

			// Band matching logic:
			// If both inputBands and matchBands are empty AFTER normalization,
			// it means there were no "significant" bands to compare.
			// This could be a match if you only care about venue on a given day,
			// or not a match if bands are crucial.
			// Current logic: if one list is empty and the other is not, no band overlap.
			// If both are empty, no band overlap according to `hasBandOverlap`.

			if (inputBands.length > 0 && matchBands.length > 0) {
				const hasBandOverlap = matchBands.some((b) => inputBands.includes(b));
				if (hasBandOverlap) {
					return json({ matchId: match.id, reason: 'Venue and band overlap' });
				}
			}
			// Optional: If you want to match even if one or both band lists are empty AFTER normalization,
			// (e.g. only venue matters, or a gig with no listed bands matches another with no listed bands)
			// you might add logic here. For instance:
			// else if (inputBands.length === 0 && matchBands.length === 0) {
			//     return json({ matchId: match.id, reason: "Venue overlap, no significant bands for either" });
			// }
		}

		return json({ matchId: null, requested: reqBody, potentials: potentialMatches });
	} catch (err) {
		console.error('❌ Unexpected error:', err);
		if (err instanceof SyntaxError && err.message.includes('JSON')) {
			return json({ error: 'Invalid JSON in request body' }, { status: 400 });
		}
		return json({ error: 'Internal error' }, { status: 500 });
	}
}

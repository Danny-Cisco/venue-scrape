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

		const { startDate, venueId, bandObjects } = reqBody;

		if (
			!startDate ||
			!venueId ||
			!bandObjects ||
			!Array.isArray(bandObjects) ||
			typeof venueId !== 'string'
		) {
			return json(
				{ error: 'Missing or invalid startDate, venue, or bandObjects' },
				{ status: 400 }
			);
		}

		// Get full-day range in UTC
		const inputDate = new Date(startDate);
		if (isNaN(inputDate.getTime())) {
			return json({ error: 'Invalid startDate format' }, { status: 400 });
		}

		const dayStart = new Date(inputDate.getTime());
		dayStart.setUTCHours(0, 0, 0, 0);

		const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

		const { data: potentialMatches, error } = await supabase
			.from('gigs')
			.select('id, start_date, venue_id, band_objects')
			.gte('start_date', dayStart.toISOString())
			.lt('start_date', dayEnd.toISOString());

		if (error) {
			console.error('❌ Supabase query error:', error);
			return json({ error: 'Supabase query failed' }, { status: 500 });
		}

		// Ensure bands are strings before normalizing, then filter empty strings
		const inputBands = bandObjects
			.map((b) => (typeof b.bandname === 'string' ? normalize(b.bandname) : ''))
			.filter((name) => name.length > 0);

		for (const potentialMatch of potentialMatches) {
			if (
				typeof potentialMatch.venue_id !== 'string' ||
				!Array.isArray(potentialMatch.band_objects)
			) {
				continue; // Skip malformed data from DB
			}
			// const matchVenue = normalize(potentialMatch.venue);
			const matchVenue = potentialMatch.venue_id;
			const matchBands = potentialMatch.band_objects
				.map((b) => (typeof b.bandname === 'string' ? normalize(b.bandname) : ''))
				.filter((name) => name.length > 0);

			const comparisonLog = [
				{
					inputBands: inputBands,
					matchVenueId: matchVenue
				},
				{
					matchBands: matchBands,
					inputVenueId: venueId
				}
			];

			// Venue must potentialMatch
			if (matchVenue !== venueId || matchVenue === '') continue; // Also skip if venue becomes empty after normalization

			// Band matching logic:

			if (inputBands.length > 0 && matchBands.length > 0) {
				const hasBandOverlap = matchBands.some((b) => inputBands.includes(b));
				if (hasBandOverlap) {
					console.log('🥳 HOORAY!!!!! GIG MATCH FOUND IN DATABASE 🥳');
					return json({ matchId: potentialMatch.id, reason: 'Venue and band overlap' });
				}
			}
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

import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	const { supabase } = locals;

	try {
		const reqBody = await request.json();
		console.log('🔍 Incoming match request body:', reqBody);

		const { datetime, venue, bands } = reqBody;

		if (!datetime || !venue || !bands || !Array.isArray(bands)) {
			return json({ error: 'Missing or invalid datetime, venue, or bands' }, { status: 400 });
		}

		// Get full-day range in UTC
		const inputDate = new Date(datetime);

		// Create a new Date object for dayStart calculation
		const dayStart = new Date(inputDate.getTime());
		dayStart.setUTCHours(0, 0, 0, 0); // Set to midnight UTC of the inputDate's UTC date

		const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000); // Next day at 00:00:00.000Z

		// Optional: Log the calculated range for debugging
		// console.log('Input datetime string:', datetime);
		// console.log('Parsed inputDate (ISO):', inputDate.toISOString());
		// console.log('Calculated dayStart (ISO):', dayStart.toISOString());
		// console.log('Calculated dayEnd (ISO):', dayEnd.toISOString());

		// Fetch all gigs for that day (date filter only)
		const { data: potentialMatches, error } = await supabase
			.from('gigs')
			.select('id, datetime, venue, bands')
			.gte('datetime', dayStart.toISOString())
			.lt('datetime', dayEnd.toISOString());

		if (error) {
			console.error('❌ Supabase query error:', error);
			return json({ error: 'Supabase query failed' }, { status: 500 });
		}

		// Normalize venue and bands for comparison
		const normalize = (str) => str.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
		const normalizedVenue = normalize(venue);
		const inputBands = bands.map(normalize).filter((b) => b.length > 0); // Added filter for empty strings

		for (const match of potentialMatches) {
			const matchVenue = normalize(match.venue);
			const matchBands = match.bands.map(normalize).filter((b) => b.length > 0); // Added filter

			// Ensure there are bands to compare after filtering
			if (
				inputBands.length === 0 &&
				matchBands.length === 0 &&
				match.bands.length === 0 &&
				bands.length === 0
			) {
				// If both input and match have no bands, consider it an overlap if you want.
				// Or, require at least one band. For now, let's assume band overlap requires non-empty band lists.
			} else if (inputBands.length === 0 || matchBands.length === 0) {
				// If one has bands and the other doesn't (after normalization/filtering), no overlap.
			} else {
				const hasBandOverlap = matchBands.some((b) => inputBands.includes(b));
				if (matchVenue === normalizedVenue && hasBandOverlap) {
					return json({ matchId: match.id });
				}
			}
		}

		// No match found
		return json({ matchId: null, requested: reqBody, potentials: potentialMatches });
	} catch (err) {
		console.error('❌ Unexpected error:', err);
		if (err instanceof SyntaxError && err.message.includes('JSON')) {
			return json({ error: 'Invalid JSON in request body' }, { status: 400 });
		}
		return json({ error: 'Internal error' }, { status: 500 });
	}
}

import { json } from '@sveltejs/kit';

export async function GET({ locals, url }) {
	console.log('BOBOBOBOBOBOP');
	const table = url.searchParams.get('table') || 'main';

	// Read optional date range
	let dateRangeStart = url.searchParams.get('dateRangeStart');
	let dateRangeEnd = url.searchParams.get('dateRangeEnd');

	// Use UTC now + 7 days if missing (defaults will be overridden by client-side logic)
	const now = new Date();
	const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

	// Fall back to ISO strings
	dateRangeStart = dateRangeStart || now.toISOString();
	dateRangeEnd = dateRangeEnd || in7Days.toISOString();

	try {
		let records;

		if (table === 'gigs') {
			records = await locals.db.all(table, (q) =>
				q
					.select('*, venue:venue_id(*)')
					.gte('start_date', dateRangeStart)
					.lt('start_date', dateRangeEnd)
					.order('start_date', { ascending: true })
			);
		} else {
			records = await locals.db.all(table, (q) => q.order('created_at', { ascending: false }));
		}

		return json({ success: true, table, records });
	} catch (err) {
		console.error('❌ Error in get-filtered-date:', err);
		return json(
			{
				success: false,
				message: err?.message ?? 'Oops, something went wrong',
				table
			},
			{ status: 500 }
		);
	}
}

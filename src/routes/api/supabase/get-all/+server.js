import { json } from '@sveltejs/kit'; // convenient helper

export async function GET({ locals, url }) {
	const table = url.searchParams.get('table') || 'main';

	let records;

	try {
		// Wraps supabase + converts snake→camel

		if (table === 'gigs')
			records = await locals.db.all(table, (q) =>
				q
					.select('*, venue:venue_id(*)') // Join the venue table
					.order('start_date', { ascending: false })
			);
		else {
			records = await locals.db.all(table, (q) => q.order('name', { ascending: true }));
		}

		return json({ success: true, table, records }); // already camelCase
	} catch (err) {
		console.error('Unexpected error:', err);
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

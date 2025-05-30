import { json } from '@sveltejs/kit'; // convenient helper

export async function GET({ locals, url }) {
	const table = url.searchParams.get('table') || 'main';

	try {
		// Wraps supabase + converts snake→camel
		// const records = await locals.db.all(table, (q) => q.order('created_at', { ascending: false }));
		const records = await locals.db.all(table, (q) =>
			q
				.select('*, venue:venue_id(*)') // Join the venue table
				.order('created_at', { ascending: false })
		);
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

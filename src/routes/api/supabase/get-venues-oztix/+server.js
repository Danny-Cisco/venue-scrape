import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
	try {
		const records = await locals.db.all('venues', (q) =>
			q
				.select('*')
				.neq('oztix', '') // not an empty string
				.not('oztix', 'is', null) // not null
				.order('name', { ascending: true })
		);

		return json({ success: true, records });
	} catch (err) {
		console.error('❌ Error fetching venues with oztix:', err);
		return json(
			{
				success: false,
				message: err?.message ?? 'Unexpected error in oztix venue query'
			},
			{ status: 500 }
		);
	}
}

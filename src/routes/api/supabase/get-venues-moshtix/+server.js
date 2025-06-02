import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
	try {
		const records = await locals.db.all('venues', (q) =>
			q
				.select('*')
				.neq('moshtix', '') // not an empty string
				.not('moshtix', 'is', null) // not null
				.order('name', { ascending: true })
		);

		return json({ success: true, records });
	} catch (err) {
		console.error('❌ Error fetching venues with moshtix:', err);
		return json(
			{
				success: false,
				message: err?.message ?? 'Unexpected error in moshtix venue query'
			},
			{ status: 500 }
		);
	}
}

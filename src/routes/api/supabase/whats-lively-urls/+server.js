import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET({ locals }) {
	const supabase = locals.supabase;
	const { all } = db(supabase);

	try {
		const data = await all(
			'venues',
			(q) =>
				q
					.neq('whats_lively_url', '') // excludes empty strings
					.not('whats_lively_url', 'is', null) // excludes nulls
		);

		console.log(`📦 Retrieved ${data.length} venues with whats_lively_url`);
		return json(data);
	} catch (error) {
		console.error('❌ db.all error:', error.message);
		return json({ error: error.message }, { status: 500 });
	}
}

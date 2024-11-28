import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
	const { supabase } = locals;

	console.log('Starting GET request');

	try {
		console.log('Attempting to fetch data from Supabase');
		const { data, error: supaError } = await supabase
			.from('main')
			.select('*')
			.eq('user_id', locals.user.id)
			.or('archived.is.null', 'archived.eq.false')
			.eq('do', true);
		if (supaError) {
			console.error('Supabase error:', supaError);
			return json({ records: [], error: supaError.message }, { status: 400 });
		}

		if (!data || data.length === 0) {
			console.log('No data found');
			return json({ records: [], error: 'No records found' }, { status: 404 });
		}

		console.log('Data fetched successfully');
		return json({ records: data, error: '' }, { status: 200 });
	} catch (err) {
		console.error('Supabase record fetch error:', err);
		return json({ records: [], error: err.message || 'Failed to fetch records' }, { status: 500 });
	}
}

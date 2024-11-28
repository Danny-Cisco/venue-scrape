import { json } from '@sveltejs/kit';

export async function GET({ locals, url }) {
	const { supabase } = locals;
	const searchValue = url.searchParams.get('search');
	console.log(searchValue);

	console.log('👀 Starting to search');

	try {
		// here goes the search
		const { data, error: supaError } = await supabase
			.from('main')
			.select('*')
			.eq('user_id', locals.user.id)
			.textSearch('short', searchValue);

		if (supaError) {
			console.error('⚠️ Supabase error:', supaError);
			return json({ records: [], error: supaError.message }, { status: 400 });
		}

		if (!data || data.length === 0) {
			console.log('❌ No data found (search)');
			return json({ records: [], error: 'No records found' }, { status: 404 });
		}

		console.log('✅ Data fetched successfully');

		return json({ records: data, error: '' }, { status: 200 });
	} catch (err) {
		console.error('😎 Supabase record fetch error: ', err);
		return json({ records: [], error: 'Failed to fetch records' }, { status: 500 });
	}
}

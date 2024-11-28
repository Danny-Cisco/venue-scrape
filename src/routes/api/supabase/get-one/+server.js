import { json } from '@sveltejs/kit';

export async function GET({ locals, url }) {
	const { supabase } = locals;
	const recordId = url.searchParams.get('id');

	console.log('👀 Starting GET request for single record');

	if (!recordId) {
		return json({ record: null, error: 'No record ID provided' }, { status: 400 });
	}

	try {
		console.log(`👀👀 Attempting to fetch record with ID: ${recordId}`);
		const { data, error: supaError } = await supabase
			.from('main')
			.select('*')
			.eq('id', recordId)
			.single();

		if (supaError) {
			console.error('⚠️ Supabase error:', supaError);
			return json({ record: null, error: supaError.message }, { status: 400 });
		}

		if (!data) {
			console.log('❌ No data found');
			return json({ record: null, error: 'Record not found' }, { status: 404 });
		}

		console.log('✅ Data fetched successfully');

		return json({ record: data, error: '' }, { status: 200 });
	} catch (err) {
		console.error('😎 Supabase record fetch error: ', err);
		return json({ record: null, error: 'Failed to fetch record' }, { status: 500 });
	}
}

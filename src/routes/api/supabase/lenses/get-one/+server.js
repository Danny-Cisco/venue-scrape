import { json } from '@sveltejs/kit';

export async function GET({ locals, url }) {
	const { supabase } = locals;
	const secretKey = url.searchParams.get('key');

	if (!secretKey) {
		return json({ record: null, error: 'No Secret Key provided' }, { status: 400 });
	}

	try {
		const { data, error: supaError } = await supabase
			.from('lenses')
			.select('*')
			.eq('key', secretKey)
			.single();

		if (supaError) {
			console.error('⚠️ Supabase error:', supaError);
			return json({ record: null, error: supaError.message }, { status: 400 });
		}

		if (!data) {
			console.log('❌ No data found');
			return json({ record: null, error: 'Record not found' }, { status: 404 });
		}

		return json({ record: data, error: '' }, { status: 200 });
	} catch (err) {
		console.error('😎 Supabase record fetch error: ', err);
		return json({ record: null, error: 'Failed to fetch record' }, { status: 500 });
	}
}

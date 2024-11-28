import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const { supabase } = locals;

	console.log('👀 Starting POST request to create record');

	try {
		// Parse the JSON body of the request
		const newRecord = await request.json();

		// Add the current time in datetimetz format
		newRecord.time_now = new Date().toISOString();

		console.log('👀👀 Attempting to create new record:', newRecord);

		const { data, error: supaError } = await supabase
			.from('time_training')
			.insert(newRecord)
			.select()
			.single();

		if (supaError) {
			console.log('⚠️ Supabase error (timetraining):', supaError);
			return json({ record: null, error: supaError.message }, { status: 400 });
		}

		console.log('✅ Record created successfully');

		return json({ record: data, error: '' }, { status: 201 });
	} catch (err) {
		console.error('😎 Supabase record creation error: ', err);
		return json({ record: null, error: 'Failed to create record' }, { status: 500 });
	}
}

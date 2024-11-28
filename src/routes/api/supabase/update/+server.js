import { json } from '@sveltejs/kit';

export async function PATCH({ request, locals, url }) {
	const { supabase } = locals;
	const recordId = url.searchParams.get('id');

	console.log('👀 Starting PATCH request to update record');

	if (!recordId) {
		return json({ record: null, error: 'No record ID provided' }, { status: 400 });
	}

	try {
		// Parse the JSON body of the request
		const updatedFields = await request.json();
		console.log(updatedFields);

		console.log(`👀👀 Attempting to update record with ID: ${recordId}`);
		console.log('Fields to update:', updatedFields);

		// Perform the update
		const { data, error: supaError } = await supabase
			.from('main')
			.update(updatedFields)
			.eq('id', recordId)
			.select()
			.single();

		if (supaError) {
			console.error('⚠️ Supabase error:', supaError);
			return json({ record: null, error: supaError.message }, { status: 400 });
		}

		if (!data) {
			console.log('❌ No data returned after update');
			return json({ record: null, error: 'Failed to update record' }, { status: 500 });
		}

		console.log('✅ Record updated successfully');

		return json({ record: data, error: '' }, { status: 200 });
	} catch (err) {
		console.error('😎 Supabase record update error: ', err);
		return json({ record: null, error: 'Failed to update record' }, { status: 500 });
	}
}

import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const { supabase } = locals;

	try {
		// Parse the JSON body of the request
		let newRecord = await request.json();
		newRecord.user_id = locals.user.id; // Add the user_id to the new record

		newRecord.body = newRecord.long;
		delete newRecord.long;
		delete newRecord.who;
		newRecord.type = 'Thread';
		newRecord.to = newRecord.whoToEmail;
		delete newRecord.whoToEmail;
		newRecord.threadBodyHtml = `<p>${newRecord.body}</p>`;

		// Remove empty fields from the newRecord object
		newRecord = Object.fromEntries(
			Object.entries(newRecord).filter(([_, value]) => {
				if (value === null || value === undefined) return false;
				if (typeof value === 'string' && value.trim() === '') return false;
				if (Array.isArray(value) && value.length === 0) return false;
				if (typeof value === 'object' && Object.keys(value).length === 0) return false;
				return true;
			})
		);

		const { data, error: supaError } = await supabase
			.from('threads')
			.insert(newRecord)
			.select()
			.single();

		if (supaError) {
			console.error('⚠️ Supabase error:', supaError);
			return json({ record: null, error: supaError.message }, { status: 400 });
		}

		console.log('✅ thread-record created successfully');

		return json({ record: data, error: '' }, { status: 201 });
	} catch (err) {
		console.error('😎 Supabase threads-record creation error: ', err);
		return json({ record: null, error: 'Failed to create threads-record' }, { status: 500 });
	}
}

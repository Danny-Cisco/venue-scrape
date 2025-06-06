// PATCH /api/supabase/update?table=venues

export async function PATCH({ request, url, locals }) {
	const { supabase } = locals;
	const table = url.searchParams.get('table');

	console.log('🤖');

	if (!table) {
		return new Response(JSON.stringify({ success: false, message: 'Missing table name' }), {
			status: 400
		});
	}

	const payload = await request.json();
	const { id, ...fieldsToUpdate } = payload;

	if (!id || Object.keys(fieldsToUpdate).length === 0) {
		return new Response(JSON.stringify({ success: false, message: 'Missing id or update data' }), {
			status: 400
		});
	}

	const { data, error } = await supabase.from(table).update(fieldsToUpdate).eq('id', id).select(); // Optional: remove if you don’t need the updated record

	if (error) {
		console.error('Error updating:', error);
		return new Response(JSON.stringify({ success: false, message: error.message }), {
			status: 500
		});
	}

	return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}

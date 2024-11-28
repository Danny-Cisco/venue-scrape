export async function POST({ request, locals, url }) {
	const { supabase } = locals;
	try {
		const tableName = url.searchParams.get('table') || 'main';
		const data = await request.json();

		if (!data || Object.keys(data).length === 0) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Please send at least one piece of data'
				}),
				{ status: 400 }
			);
		}

		// Add user_id and timestamp to whatever the user sent
		const dataToSave = {
			...data,
			user_id: locals.user.id,
			created_at: new Date().toISOString()
		};

		const { data: result, error } = await supabase.from(tableName).insert([dataToSave]);

		if (error) {
			console.error(`Error saving to ${tableName}:`, error);
			return new Response(
				JSON.stringify({
					success: false,
					message: error.message,
					table: tableName,
					what_we_tried_to_save: dataToSave
				}),
				{ status: 500 }
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				table: tableName,
				saved_data: dataToSave
			}),
			{ status: 201 }
		);
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Oops, something went wrong',
				table: url.searchParams.get('table') || 'main'
			}),
			{ status: 500 }
		);
	}
}

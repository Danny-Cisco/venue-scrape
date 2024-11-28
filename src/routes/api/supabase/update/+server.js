export async function PATCH({ request, locals, url }) {
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

		if (!data.key) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Key is required for updating records'
				}),
				{ status: 400 }
			);
		}

		// Separate key from the data to update
		const { key, ...dataToUpdate } = data;

		// Add update timestamp and user_id to whatever the user sent
		const updatedData = {
			...dataToUpdate,
			user_id: locals.user.id,
			updated_at: new Date().toISOString()
		};

		// First check if the record exists and belongs to the user
		const { data: existingRecord, error: fetchError } = await supabase
			.from(tableName)
			.select('*')
			.eq('key', key)
			.eq('user_id', locals.user.id)
			.single();

		if (fetchError || !existingRecord) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Record not found or you do not have permission to update it'
				}),
				{ status: 404 }
			);
		}

		// Perform the update
		const { data: result, error } = await supabase
			.from(tableName)
			.update(updatedData)
			.eq('key', key)
			.eq('user_id', locals.user.id);

		if (error) {
			console.error(`Error updating ${tableName}:`, error);
			return new Response(
				JSON.stringify({
					success: false,
					message: error.message,
					table: tableName,
					what_we_tried_to_update: updatedData
				}),
				{ status: 500 }
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				table: tableName,
				updated_data: {
					key,
					...updatedData
				}
			}),
			{ status: 200 }
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

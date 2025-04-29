export async function PATCH({ request, locals, url }) {
	const { supabase } = locals;
	try {
		const tableName = 'gigs';
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
					message: 'a key (previously oztixUrl) is required for updating records'
				}),
				{ status: 400 }
			);
		}

		// Separate key from the data to update
		const { key, ...dataToUpdate } = data;

		// Perform the upsert
		const { data: result, error } = await supabase
			.from(tableName)
			.upsert([{ key, ...dataToUpdate }], { onConflict: ['key'] });

		if (error) {
			console.error(`Error updating ${tableName}:`, error);
			return new Response(
				JSON.stringify({
					success: false,
					message: error.message,
					table: tableName,
					what_we_tried_to_update: dataToUpdate
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
					...dataToUpdate
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

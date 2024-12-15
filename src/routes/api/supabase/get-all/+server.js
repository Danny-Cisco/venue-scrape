export async function GET({ locals, url }) {
	const { supabase } = locals;
	try {
		const tableName = url.searchParams.get('table') || 'main';

		// Fetch records for the current user
		const { data: records, error } = await supabase
			.from(tableName)
			.select('*')
			.eq('user_id', locals.user.id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error(`Error reading from ${tableName}:`, error);
			return new Response(
				JSON.stringify({
					success: false,
					message: error.message,
					table: tableName
				}),
				{ status: 500 }
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				table: tableName,
				records
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

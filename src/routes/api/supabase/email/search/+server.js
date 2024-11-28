import { json } from '@sveltejs/kit';
import { createEmbedding } from '$lib/openai/embeddings.js';

export async function GET({ locals, url }) {
	const { supabase } = locals;
	const search = url.searchParams.get('search');
	const embedding = await createEmbedding(search);

	try {
		const { data: emails, error: supaError } = await supabase.rpc('match_emails', {
			query_embedding: embedding, // pass the query embedding
			match_threshold: 0.75, // choose an appropriate threshold for your data
			match_count: 10, // choose the number of matches
			supabase_user_id: locals.user.id
		});

		if (supaError) {
			console.error('⚠️ Supabase error:', supaError);
			return json({ records: [], error: supaError.message }, { status: 400 });
		}

		if (!emails || emails.length === 0) {
			console.log('❌ No data found');
			return json({ records: [], error: 'No records found' }, { status: 404 });
		}

		console.log('✅Embedded search successfully');

		return json({ records: emails, error: '' }, { status: 200 });
	} catch (err) {
		console.error('😎 Supabase record fetch error: ', err);
		return json({ records: [], error: 'Failed to fetch records' }, { status: 500 });
	}
}

import { json } from '@sveltejs/kit';

export async function GET({ locals, url }) {
	const { supabase } = locals;
	const archived = url.searchParams.get('archived');
	console.log('🚀 ~ GET ~ archived:', archived);
	const doFilter = url.searchParams.get('do');
	const doneFilter = url.searchParams.get('done');
	const filters = JSON.parse(url.searchParams.get('filters') || '{}');
	console.log('🚀 ~ GET ~ filters:', filters);

	try {
		let query = supabase.from('main').select('*').eq('user_id', locals.user.id);

		// Apply archived filter only if it's explicitly set to 'true' or 'false'
		if (archived === 'true' || archived === 'false') {
			query = query.eq('archived', archived === 'true');
		}

		// Apply do filter only if it's explicitly set to 'true' or 'false'
		if (doFilter === 'true' || doFilter === 'false') {
			query = query.eq('do', doFilter === 'true');
		}

		// Apply done filter only if it's explicitly set to 'true' or 'false'
		if (doneFilter === 'true' || doneFilter === 'false') {
			query = query.eq('done', doneFilter === 'true');
		}

		Object.entries(filters).forEach(([field, value]) => {
			if (value) {
				if (field === 'tags') {
					const tagsArray = Array.isArray(value) ? value : [value];
					query = query.overlaps(field, tagsArray);
				} else if (value.includes(' OR ')) {
					const orConditions = value.split(' OR ').map((term) => term.trim());
					query = query.or(orConditions.map((term) => `${field}.ilike.%${term}%`).join(','));
				} else {
					query = query.ilike(field, `%${value}%`);
				}
			}
		});

		const { data, error: supaError } = await query;

		if (supaError) {
			console.error('⚠️ Supabase error:', supaError);
			return json({ records: [], error: supaError.message }, { status: 400 });
		}

		if (!data || data.length === 0) {
			console.log('❌ No data found (get-all)');
			return json({ records: [], error: 'No records found' }, { status: 404 });
		}

		return json({ records: data, error: '' }, { status: 200 });
	} catch (err) {
		console.error('😎 Supabase record fetch error: ', err);
		return json({ records: [], error: 'Failed to fetch records' }, { status: 500 });
	}
}

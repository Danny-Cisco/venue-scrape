import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, fetch }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/not-logged-in');
	}

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select(`username, avatar_url`)
		.eq('id', session.user.id)
		.single();

	if (profileError) {
		console.error('Error fetching profile:', profileError);
		// Return empty profile rather than failing completely
		return { session, profile: { username: null, avatar_url: null } };
	}

	// DO I ADD MY FETCH TO MY API ENDPOINT HERE?

	const res = await fetch('/api/supabase/get-all?table=gigs', { method: 'GET' });
	if (!res.ok) {
		console.log('❌ NOT OK: ', res);
	}
	const gigsData = await res.json();

	return { session, profile, gigsData };
	// return { session, profile };
};

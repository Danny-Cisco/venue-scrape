import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
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

	return { session, profile };
};

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	console.log('✅ WELCOME TO PROFILE CHECK');

	const session = await safeGetSession();

	if (!session) {
		console.log('❌ No session found, redirecting to login');
		throw redirect(303, '/auth/login');
	}

	// Add error handling for the database query
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', session.user.id)
		.maybeSingle();

	if (error) {
		console.error('❌ Profile fetch error:', error.message);
		// You might want to handle this differently based on your needs
		throw redirect(303, '/auth/error');
	}

	if (!profile) {
		console.log('ℹ️ No profile found, redirecting to create profile');
		throw redirect(303, '/auth/create-profile');
	}

	console.log('✅ Profile found, redirecting to load profile');
	throw redirect(303, '/auth/load-profile');
};

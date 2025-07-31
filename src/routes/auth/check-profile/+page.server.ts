import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	console.log('✅ WELCOME TO PROFILE CHECK');

	const session = await safeGetSession();

	if (!session) {
		console.warn('❌ No session found — redirecting to login');
		throw redirect(303, '/auth/login');
	}

	const userId = session.user.id;

	const { data: profile, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		console.error('❌ Supabase profile fetch failed:', error.message);
		// If it's a permission error, your table RLS might be misconfigured
		// Instead of redirecting, consider showing a detailed error page for debugging
		throw redirect(303, '/auth/error');
	}

	if (!profile) {
		console.log(`ℹ️ No profile found for user ${userId}, redirecting to create-profile`);
		throw redirect(303, '/auth/create-profile');
	}

	console.log(`✅ Profile found for user ${userId}, redirecting to load-profile`);
	throw redirect(303, '/auth/load-profile');
};

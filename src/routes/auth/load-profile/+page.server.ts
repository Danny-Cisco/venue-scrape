import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const session = await safeGetSession();

	if (!session) {
		throw redirect(303, '/auth/login');
	}

	const { data: profile, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', session.user.id)
		.single();

	if (error || !profile) {
		console.error('Error loading profile:', error);
		throw redirect(303, '/auth/error');
	}

	// Successfully loaded profile, redirect to control panels
	throw redirect(303, '/dashboards');
};

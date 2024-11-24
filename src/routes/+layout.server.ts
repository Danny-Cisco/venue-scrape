import { fail } from '@sveltejs/kit';
import { sendMagicLink } from '$lib/utils/magicLink';
import type { Actions, PageServerLoad } from './$types';

// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		// Optionally redirect unauthenticated users to the home page
		return { session: null, profile: null };
	}

	// Fetch user profile
	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('username, avatar_url')
		.eq('id', session.user.id)
		.single();

	if (profileError) {
		console.error('Error fetching profile:', profileError);
		return { session, profile: null }; // Return session even if profile fetch fails
	}

	return { session, profile };
};

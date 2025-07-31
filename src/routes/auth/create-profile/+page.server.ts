import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function generateUsername(email: string): string {
	if (!email) throw new Error('Email is required');
	const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
	return `${base}${Math.floor(Math.random() * 10000)}`;
}

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const session = await safeGetSession();

	if (!session) {
		console.warn('No session found — redirecting to login');
		throw redirect(303, '/auth/login');
	}

	const userId = session.user.id;
	const userEmail = session.user.email || '';

	// First check if profile already exists (prevents double insert errors)
	const { data: existingProfile, error: fetchError } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.maybeSingle();

	if (fetchError) {
		console.error('❌ Error checking existing profile:', fetchError.message);
		throw redirect(303, '/auth/error');
	}

	if (existingProfile) {
		console.log('ℹ️ Profile already exists, skipping creation');
		throw redirect(303, '/auth/load-profile');
	}

	// Try to insert a new profile
	const { error: insertError } = await supabase
		.from('profiles')
		.insert({
			id: userId,
			email: userEmail,
			username: generateUsername(userEmail),
			created_at: new Date().toISOString()
		})
		.single();

	if (insertError) {
		console.error('❌ Error creating profile:', insertError.message);
		throw redirect(303, '/auth/error');
	}

	console.log('✅ Profile created, redirecting to load-profile');
	throw redirect(303, '/auth/load-profile');
};
